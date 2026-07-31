import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyKorapayWebhookSignature } from "@/lib/korapay/client";
import { notifyTopupCompleted } from "@/lib/actions/notify-topup";
import type { KorapayWebhookPayload } from "@/lib/korapay/types";

export const dynamic = "force-dynamic";

/**
 * Korapay always expects a 200 for any request it considers "received" —
 * per their docs, anything else (or a timeout) triggers retries for up to
 * 72 hours. So invalid/unrecognized requests still get a 200 (we just do
 * nothing with them), and only genuine server errors return non-200.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as KorapayWebhookPayload | null;

  if (!body?.data) {
    return NextResponse.json({ received: true });
  }

  const signature = request.headers.get("x-korapay-signature");
  const isValid = verifyKorapayWebhookSignature(body.data, signature);

  if (!isValid) {
    console.error("[korapay webhook] invalid signature — ignoring request");
    return NextResponse.json({ received: true });
  }

  const admin = createAdminClient();

  try {
    if (body.event === "charge.success" && body.data.status === "success") {
      await admin.rpc("credit_wallet_topup", { p_reference: body.data.reference });
      await notifyTopupCompleted(body.data.reference);
    } else if (body.event === "charge.failed") {
      await admin.rpc("fail_wallet_topup", { p_reference: body.data.reference });
    }
    // Other event types (transfer.*, refund.*) aren't relevant to wallet
    // top-ups in this phase and are acknowledged without action.
  } catch (err) {
    console.error("[korapay webhook] failed to process", err);
    // Still 200: this was likely "reference not found" (e.g. a stale test
    // event), not something retrying will fix.
  }

  return NextResponse.json({ received: true });
}
