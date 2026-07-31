import { createClient, createAdminClient } from "@/lib/supabase/server";
import { verifyKorapayCharge } from "@/lib/korapay/client";
import { notifyTopupCompleted } from "@/lib/actions/notify-topup";
import { KorapayTopupForm } from "@/components/dashboard/korapay-topup-form";
import { CryptoTopupPanel } from "@/components/dashboard/crypto-topup-panel";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-slate-800 text-slate-300",
  completed: "bg-emerald-500/20 text-emerald-400",
  failed: "bg-red-500/20 text-red-400",
};

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect-confirmation fallback: if the customer lands back here from
  // Korapay's checkout before the webhook has arrived, actively verify
  // the charge now. credit_wallet_topup() is idempotent, so this can
  // never double-credit even if the webhook fires moments later too.
  if (reference && user) {
    try {
      const charge = await verifyKorapayCharge(reference);
      if (charge.data.status === "success") {
        const admin = createAdminClient();
        await admin.rpc("credit_wallet_topup", { p_reference: reference });
        await notifyTopupCompleted(reference);
      } else if (charge.data.status === "failed") {
        const admin = createAdminClient();
        await admin.rpc("fail_wallet_topup", { p_reference: reference });
      }
    } catch {
      // Verification failing here just means we fall back to the webhook —
      // not worth surfacing an error for what is a best-effort double-check.
    }
  }

  const { data: profile } = user
    ? await supabase.from("profiles").select("wallet_balance").eq("id", user.id).single()
    : { data: null };

  const { data: topups } = await supabase
    .from("wallet_topups")
    .select("id, amount, currency, method, status, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  const cryptoAddresses: Record<string, string | undefined> = {
    BTC: process.env.CRYPTO_BTC_ADDRESS,
    ETH: process.env.CRYPTO_ETH_ADDRESS,
    USDT_TRC20: process.env.CRYPTO_USDT_TRC20_ADDRESS,
    USDT_ERC20: process.env.CRYPTO_USDT_ERC20_ADDRESS,
    LTC: process.env.CRYPTO_LTC_ADDRESS,
    SOL: process.env.CRYPTO_SOL_ADDRESS,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Wallet</h1>
        <p className="text-sm text-slate-400">Top up to place orders.</p>
      </div>

      <div className="max-w-sm rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <p className="text-xs uppercase tracking-wide text-slate-400">Available balance</p>
        <p className="mt-2 text-3xl font-semibold">${(profile?.wallet_balance ?? 0).toFixed(2)}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="mb-3 text-lg font-medium">Pay with Korapay</h2>
          <KorapayTopupForm />
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="mb-3 text-lg font-medium">Pay with crypto</h2>
          <CryptoTopupPanel addresses={cryptoAddresses} />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Recent top-ups</h2>
        {!topups || topups.length === 0 ? (
          <p className="text-sm text-slate-400">No top-ups yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/70 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {topups.map((topup) => (
                  <tr key={topup.id} className="border-t border-slate-800">
                    <td className="px-4 py-3">
                      {topup.currency} {topup.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 capitalize">{topup.method}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs capitalize ${STATUS_STYLES[topup.status]}`}
                      >
                        {topup.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(topup.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
