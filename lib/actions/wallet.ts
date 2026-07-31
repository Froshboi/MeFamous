"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { initializeKorapayCharge } from "@/lib/korapay/client";
import { KorapayApiError } from "@/lib/korapay/types";

export type WalletActionState = {
  error?: string;
  success?: boolean;
  message?: string;
};

const topupSchema = z.object({
  amount: z.coerce.number().positive().min(100, "Minimum top-up is ₦100"),
});

/**
 * Creates a pending wallet_topups row, then initializes a Korapay Checkout
 * Redirect charge and sends the customer to Korapay's hosted checkout.
 * The wallet is only ever credited later, by the webhook (or the
 * redirect-confirmation fallback below) calling credit_wallet_topup() —
 * never here, since we haven't seen a completed payment yet.
 */
export async function initiateKorapayTopupAction(
  _prevState: WalletActionState,
  formData: FormData
): Promise<WalletActionState> {
  const parsed = topupSchema.safeParse({ amount: formData.get("amount") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid amount" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: "You need to be signed in to top up your wallet." };
  }

  const reference = `MFTOPUP-${randomUUID()}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { error: insertError } = await supabase.from("wallet_topups").insert({
    user_id: user.id,
    reference,
    amount: parsed.data.amount,
    currency: "NGN",
    method: "korapay",
    status: "pending",
  });

  if (insertError) {
    return { error: "Could not start the top-up — please try again." };
  }

  let checkoutUrl: string;
  try {
    const charge = await initializeKorapayCharge({
      amount: parsed.data.amount,
      currency: "NGN",
      reference,
      customer: { email: user.email },
      redirect_url: `${appUrl}/dashboard/wallet?reference=${reference}`,
      notification_url: `${appUrl}/api/webhooks/korapay`,
      narration: "MeFamous wallet top-up",
    });
    checkoutUrl = charge.data.checkout_url;
  } catch (err) {
    const message = err instanceof KorapayApiError ? err.message : "Could not reach Korapay.";
    return { error: message };
  }

  redirect(checkoutUrl);
}

const cryptoClaimSchema = z.object({
  amount: z.coerce.number().positive(),
  asset: z.enum(["BTC", "ETH", "USDT_TRC20", "USDT_ERC20", "LTC", "SOL"]),
  txNote: z.string().min(3, "Add the transaction hash or a note so we can find your payment").max(500),
});

/**
 * Crypto deposits have no automated on-chain verification in this phase —
 * there's no indexer wired up to watch the deposit addresses. This just
 * logs the customer's claim as a pending top-up for an admin to confirm
 * against the blockchain and credit manually from /admin/wallet-topups.
 */
export async function claimCryptoTopupAction(
  _prevState: WalletActionState,
  formData: FormData
): Promise<WalletActionState> {
  const parsed = cryptoClaimSchema.safeParse({
    amount: formData.get("amount"),
    asset: formData.get("asset"),
    txNote: formData.get("txNote"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in to submit a deposit claim." };
  }

  const reference = `MFCRYPTO-${randomUUID()}`;
  const { error } = await supabase.from("wallet_topups").insert({
    user_id: user.id,
    reference,
    amount: parsed.data.amount,
    currency: "USD",
    method: "crypto",
    crypto_asset: parsed.data.asset,
    crypto_tx_note: parsed.data.txNote,
    status: "pending",
  });

  if (error) {
    return { error: "Could not submit your claim — please try again." };
  }

  return {
    success: true,
    message: "Claim submitted. We'll credit your wallet once we confirm the transaction on-chain.",
  };
}
const bankTransferSchema = z.object({
  amount: z.coerce.number().positive().min(100, "Minimum top-up is ₦100"),
  senderName: z.string().min(2, "Enter sender name").max(100),
  txNote: z.string().min(3, "Add a reference or note").max(500),
});

/**
 * Manual bank transfer — user sends to OPay, submits proof, admin verifies.
 */
export async function submitBankTransferAction(
  _prevState: WalletActionState,
  formData: FormData
): Promise<WalletActionState> {
  const parsed = bankTransferSchema.safeParse({
    amount: formData.get("amount"),
    senderName: formData.get("senderName"),
    txNote: formData.get("txNote"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in to submit a transfer." };
  }

  const reference = `MFBANK-${randomUUID()}`;
  const { error } = await supabase.from("wallet_topups").insert({
    user_id: user.id,
    reference,
    amount: parsed.data.amount,
    currency: "NGN",
    method: "korapay", // reusing method column — or change to "bank_transfer" if you prefer
    crypto_tx_note: `Sender: ${parsed.data.senderName} | Ref: ${parsed.data.txNote}`,
    status: "pending",
  });

  if (error) {
    return { error: "Could not submit — please try again." };
  }

  return {
    success: true,
    message: "Transfer submitted! We'll credit your wallet within 10 minutes of confirmation.",
  };
}
