import { createClient, createAdminClient } from "@/lib/supabase/server";
import { verifyKorapayCharge } from "@/lib/korapay/client";
import { notifyTopupCompleted } from "@/lib/actions/notify-topup";
import { KorapayTopupForm } from "@/components/dashboard/korapay-topup-form";
import { CryptoTopupPanel } from "@/components/dashboard/crypto-topup-panel";
import { BankTransferForm } from "@/components/dashboard/bank-transfer-form";

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

  // Redirect-confirmation fallback for Korapay
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
      // Fallback to webhook
    }
  }

  const { data: profile } = user
    ? await supabase.from("profiles").select("wallet_balance").eq("id", user.id).single()
    : { data: null };

  const { data: topups } = await supabase
    .from("wallet_topups")
    .select("id, amount, currency, method, status, created_at, crypto_tx_note")
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
        <p className="mt-2 text-3xl font-semibold">₦{(profile?.wallet_balance ?? 0).toFixed(2)}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Bank Transfer — active */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="mb-3 text-lg font-medium">Bank Transfer</h2>
          <BankTransferForm />
        </div>

        {/* Korapay — coming soon */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 opacity-60">
          <h2 className="mb-3 text-lg font-medium">Pay with Card (Korapay)</h2>
          <p className="text-sm text-slate-400 mb-3">Coming soon — instant card and bank payments.</p>
          <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-4 text-center">
  <p className="text-sm text-slate-500">Card payments coming soon</p>
</div>
        </div>

        {/* Crypto */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 md:col-span-2">
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
                  <th className="px-4 py-3">Details</th>
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
                    <td className="px-4 py-3 text-xs text-slate-400 max-w-[200px] truncate">
                      {topup.crypto_tx_note ?? "—"}
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
