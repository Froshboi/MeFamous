import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { sendTransactionalEmail } from "@/lib/email/resend";
import { walletToppedUpEmail, referralRewardEmail } from "@/lib/email/templates";

/**
 * Called right after credit_wallet_topup() succeeds (from the Korapay
 * webhook or the redirect-confirmation fallback). Looks up what just
 * happened purely to send emails — credit_wallet_topup() is idempotent,
 * so this is safe to call even if it's a repeat notification for an
 * already-completed top-up (we just re-check status first).
 */
export async function notifyTopupCompleted(reference: string): Promise<void> {
  const admin = createAdminClient();

  const { data: topup } = await admin
    .from("wallet_topups")
    .select("id, user_id, amount, currency, status")
    .eq("reference", reference)
    .single();

  if (!topup || topup.status !== "completed") return;

  const { data: profile } = await admin
    .from("profiles")
    .select("email")
    .eq("id", topup.user_id)
    .single();

  if (profile?.email) {
    await sendTransactionalEmail({
      to: profile.email,
      subject: "Your MeFamous wallet has been topped up",
      html: walletToppedUpEmail({ amount: topup.amount, currency: topup.currency }),
    });
  }

  const { data: reward } = await admin
    .from("referral_rewards")
    .select("referrer_id, amount")
    .eq("source_topup_id", topup.id)
    .maybeSingle();

  if (reward) {
    const { data: referrerProfile } = await admin
      .from("profiles")
      .select("email")
      .eq("id", reward.referrer_id)
      .single();

    if (referrerProfile?.email) {
      await sendTransactionalEmail({
        to: referrerProfile.email,
        subject: "You earned a MeFamous referral reward",
        html: referralRewardEmail({ amount: reward.amount, currency: topup.currency }),
      });
    }
  }
}
