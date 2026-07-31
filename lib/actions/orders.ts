"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { User } from "@supabase/supabase-js";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getProvider } from "@/lib/providers/registry";
import { ProviderApiError } from "@/lib/providers/types";
import { sendTransactionalEmail } from "@/lib/email/resend";
import { orderSubmittedEmail } from "@/lib/email/templates";

export type PlaceOrderState = {
  error?: string;
  success?: boolean;
  orderId?: string;
};

const orderInputSchema = z.object({
  serviceId: z.coerce.number().int().positive(),
  link: z.string().url("Enter a valid link"),
  quantity: z.coerce.number().int().positive(),
});

type OrderInput = z.infer<typeof orderInputSchema>;

/**
 * Core two-phase order placement, shared by the single-order form
 * (placeOrderAction) and the reseller bulk-order tool
 * (bulkPlaceOrdersAction):
 *  1. place_order() — SECURITY DEFINER RPC that locks the wallet row,
 *     checks the balance, debits it, and inserts a 'pending' order —
 *     all in one transaction, so two clicks (or two bulk rows) can never
 *     double-spend. The order is stamped with whichever provider the
 *     service currently belongs to.
 *  2. Submit to that SAME provider via the generic SmmProvider interface
 *     — never a hardcoded Owlet call, so switching the platform's active
 *     provider later doesn't strand in-flight code, and a service always
 *     gets fulfilled by whoever it was actually synced from. On success,
 *     confirm_order() attaches the real provider order id. On failure,
 *     fail_order_and_refund() reverses the debit so the customer is never
 *     charged for a failed submission.
 */
async function placeSingleOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  admin: ReturnType<typeof createAdminClient>,
  user: User,
  input: OrderInput
): Promise<{ success: true; orderId: string } | { success: false; error: string }> {
  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("id, name, provider, provider_service_id, customer_rate, min_quantity, max_quantity, is_active")
    .eq("id", input.serviceId)
    .single();

  if (serviceError || !service || !service.is_active) {
    return { success: false, error: "This service is no longer available." };
  }

  if (input.quantity < service.min_quantity || input.quantity > service.max_quantity) {
    return {
      success: false,
      error: `Quantity must be between ${service.min_quantity} and ${service.max_quantity}.`,
    };
  }

  const price = Math.round(((service.customer_rate * input.quantity) / 1000) * 100) / 100;

  const { data: order, error: placeError } = await supabase.rpc("place_order", {
    p_service_id: input.serviceId,
    p_link: input.link,
    p_quantity: input.quantity,
    p_price: price,
  });

  if (placeError || !order) {
    return { success: false, error: placeError?.message ?? "Could not reserve funds for this order." };
  }

  try {
    const provider = getProvider(service.provider);
    const providerResponse = await provider.addOrder({
      providerServiceId: service.provider_service_id,
      link: input.link,
      quantity: input.quantity,
    });

    await admin.rpc("confirm_order", {
      p_order_id: order.id,
      p_provider_order_id: providerResponse.providerOrderId,
    });

    if (user.email) {
      await sendTransactionalEmail({
        to: user.email,
        subject: "Your MeFamous order is on its way",
        html: orderSubmittedEmail({ serviceName: service.name, quantity: input.quantity, price }),
      });
    }

    return { success: true, orderId: order.id };
  } catch (err) {
    const message = err instanceof ProviderApiError ? err.message : "Provider rejected the order.";
    await admin.rpc("fail_order_and_refund", { p_order_id: order.id, p_reason: message });
    return { success: false, error: `Order could not be submitted (refunded): ${message}` };
  }
}

export async function placeOrderAction(
  _prevState: PlaceOrderState,
  formData: FormData
): Promise<PlaceOrderState> {
  const parsed = orderInputSchema.safeParse({
    serviceId: formData.get("serviceId"),
    link: formData.get("link"),
    quantity: formData.get("quantity"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid order details" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in to place an order." };
  }

  const admin = createAdminClient();
  const result = await placeSingleOrder(supabase, admin, user, parsed.data);

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard");

  if (!result.success) return { error: result.error };
  return { success: true, orderId: result.orderId };
}

export type BulkOrderState = {
  error?: string;
  results?: { line: string; success: boolean; message: string }[];
};

const bulkLineSchema = z.object({
  link: z.string().url(),
  quantity: z.coerce.number().int().positive(),
});

/**
 * Reseller bulk ordering: one service, many "link,quantity" lines. Each
 * line goes through the exact same debit/submit/confirm-or-refund path as
 * a single order — there is no separate, less-safe bulk code path for
 * money movement.
 */
export async function bulkPlaceOrdersAction(
  _prevState: BulkOrderState,
  formData: FormData
): Promise<BulkOrderState> {
  const serviceId = Number(formData.get("serviceId"));
  const linesRaw = String(formData.get("lines") ?? "");

  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    return { error: "Choose a service." };
  }

  const lines = linesRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { error: "Add at least one line as: link,quantity" };
  }
  if (lines.length > 50) {
    return { error: "Bulk orders are limited to 50 lines at a time." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in to place orders." };
  }

  const admin = createAdminClient();
  const results: BulkOrderState["results"] = [];

  for (const line of lines) {
    const [link, quantityStr] = line.split(",").map((part) => part?.trim());
    const parsedLine = bulkLineSchema.safeParse({ link, quantity: quantityStr });

    if (!parsedLine.success) {
      results.push({ line, success: false, message: "Expected format: link,quantity" });
      continue;
    }

    const outcome = await placeSingleOrder(supabase, admin, user, {
      serviceId,
      link: parsedLine.data.link,
      quantity: parsedLine.data.quantity,
    });

    results.push(
      outcome.success
        ? { line, success: true, message: `Order placed (${outcome.orderId.slice(0, 8)})` }
        : { line, success: false, message: outcome.error }
    );
  }

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard");

  return { results };
}
