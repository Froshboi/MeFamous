import "server-only";
import { Resend } from "resend";

let client: Resend | null = null;

function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

/**
 * Best-effort send: transactional emails should never take down the
 * request that triggered them (an order/top-up succeeding shouldn't fail
 * because Resend is down or RESEND_API_KEY isn't set yet). Errors are
 * logged, not thrown.
 */
export async function sendTransactionalEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const resend = getClient();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping send:", params.subject);
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "MeFamous <no-reply@mefamous.com>",
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
  } catch (err) {
    console.error("[email] send failed", err);
  }
}
