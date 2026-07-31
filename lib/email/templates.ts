const WRAPPER_START = `
<div style="font-family: -apple-system, Helvetica, Arial, sans-serif; background:#020617; padding:32px; color:#f8fafc;">
  <div style="max-width:480px; margin:0 auto; background:#0f172a; border-radius:16px; padding:32px; border:1px solid #1e293b;">
    <p style="font-size:18px; font-weight:600; margin:0 0 24px;">MeFamous</p>
`;
const WRAPPER_END = `
  </div>
</div>
`;

export function orderSubmittedEmail(params: { serviceName: string; quantity: number; price: number }) {
  return `${WRAPPER_START}
    <h1 style="font-size:20px; margin:0 0 12px;">Order submitted</h1>
    <p style="color:#cbd5e1; font-size:14px; line-height:1.6;">
      We've submitted your order for <strong>${params.quantity}</strong> units of
      <strong>${escapeHtml(params.serviceName)}</strong> for $${params.price.toFixed(2)}.
      You can track progress any time from your dashboard.
    </p>
  ${WRAPPER_END}`;
}

export function orderCompletedEmail(params: { serviceName: string; quantity: number }) {
  return `${WRAPPER_START}
    <h1 style="font-size:20px; margin:0 0 12px;">Order completed 🎉</h1>
    <p style="color:#cbd5e1; font-size:14px; line-height:1.6;">
      Your order for <strong>${params.quantity}</strong> units of
      <strong>${escapeHtml(params.serviceName)}</strong> is complete.
    </p>
  ${WRAPPER_END}`;
}

export function walletToppedUpEmail(params: { amount: number; currency: string }) {
  return `${WRAPPER_START}
    <h1 style="font-size:20px; margin:0 0 12px;">Wallet topped up</h1>
    <p style="color:#cbd5e1; font-size:14px; line-height:1.6;">
      ${params.currency} ${params.amount.toFixed(2)} has been added to your wallet balance.
    </p>
  ${WRAPPER_END}`;
}

export function referralRewardEmail(params: { amount: number; currency: string }) {
  return `${WRAPPER_START}
    <h1 style="font-size:20px; margin:0 0 12px;">You earned a referral reward</h1>
    <p style="color:#cbd5e1; font-size:14px; line-height:1.6;">
      ${params.currency} ${params.amount.toFixed(2)} has been added to your wallet from a referral's
      first top-up. Thanks for spreading the word!
    </p>
  ${WRAPPER_END}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
