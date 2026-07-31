import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCronRequest } from "@/lib/cron/verify";
import { createAdminClient } from "@/lib/supabase/server";
import { getProvider } from "@/lib/providers/registry";
import { sendTransactionalEmail } from "@/lib/email/resend";
import { orderCompletedEmail } from "@/lib/email/templates";
import type { OrderStatus } from "@/types/database";

export const dynamic = "force-dynamic";

const IN_FLIGHT_STATUSES: OrderStatus[] = ["submitted", "in_progress", "partial"];
const BATCH_SIZE = 100; // conservative batch size shared across providers

/**
 * Polls order status for every in-flight order, grouped by the PROVIDER
 * THAT ORDER WAS ACTUALLY PLACED WITH (orders.provider) — not whichever
 * provider happens to be "active" right now. If the active provider gets
 * switched, orders already in flight with the old one still get checked
 * against it correctly; only new orders go to the new provider.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: orders, error } = await admin
    .from("orders")
    .select("id, provider, provider_order_id, quantity, user_id, service_id")
    .in("status", IN_FLIGHT_STATUSES)
    .not("provider_order_id", "is", null)
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!orders || orders.length === 0) {
    return NextResponse.json({ checked: 0, updated: 0 });
  }

  const ordersByProvider = new Map<string, typeof orders>();
  for (const order of orders) {
    const list = ordersByProvider.get(order.provider) ?? [];
    list.push(order);
    ordersByProvider.set(order.provider, list);
  }

  let updated = 0;
  let failed = 0;

  for (const [providerKey, providerOrders] of ordersByProvider) {
    let provider;
    try {
      provider = getProvider(providerKey);
    } catch {
      // A provider that's no longer registered (removed from code) —
      // can't check it, but don't let that break other providers' orders.
      failed += providerOrders.length;
      continue;
    }

    for (let i = 0; i < providerOrders.length; i += BATCH_SIZE) {
      const batch = providerOrders.slice(i, i + BATCH_SIZE);
      const idToOrder = new Map(batch.map((o) => [o.provider_order_id as string, o]));

      try {
        const statuses = await provider.getMultiOrderStatus(batch.map((o) => o.provider_order_id as string));

        for (const [providerOrderId, result] of Object.entries(statuses)) {
          const orderRow = idToOrder.get(providerOrderId);
          if (!orderRow) continue;

          if ("error" in result) {
            failed++;
            continue;
          }

          const { error: rpcError } = await admin.rpc("update_order_progress", {
            p_order_id: orderRow.id,
            p_status: result.status,
            p_start_count: result.startCount,
            p_remains: result.remains,
            p_provider_charge: result.charge,
          });

          if (rpcError) {
            failed++;
            continue;
          }

          updated++;

          if (result.status === "completed") {
            const [{ data: profile }, { data: service }] = await Promise.all([
              admin.from("profiles").select("email").eq("id", orderRow.user_id).single(),
              admin.from("services").select("name").eq("id", orderRow.service_id).single(),
            ]);

            if (profile?.email && service?.name) {
              await sendTransactionalEmail({
                to: profile.email,
                subject: "Your MeFamous order is complete",
                html: orderCompletedEmail({ serviceName: service.name, quantity: orderRow.quantity }),
              });
            }
          }
        }
      } catch {
        failed += batch.length;
      }
    }
  }

  return NextResponse.json({ checked: orders.length, updated, failed });
}
