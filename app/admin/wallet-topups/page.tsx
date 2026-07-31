import { createAdminClient } from "@/lib/supabase/server";
import { TopupReviewActions } from "@/components/admin/topup-review-actions";

export default async function AdminWalletTopupsPage() {
  const admin = createAdminClient();

  const { data: pendingCrypto } = await admin
    .from("wallet_topups")
    .select("id, reference, user_id, amount, crypto_asset, crypto_tx_note, created_at, profiles(email)")
    .eq("method", "crypto")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const { data: recent } = await admin
    .from("wallet_topups")
    .select("id, reference, amount, currency, method, status, created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Wallet top-ups</h1>
        <p className="text-sm text-slate-400">
          Korapay top-ups confirm automatically. Crypto claims need a manual check against the
          blockchain before approving.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Pending crypto claims</h2>
        {!pendingCrypto || pendingCrypto.length === 0 ? (
          <p className="text-sm text-slate-400">Nothing waiting on review.</p>
        ) : (
          <div className="space-y-3">
            {pendingCrypto.map((claim) => (
              <div
                key={claim.id}
                className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium">
                    {(claim.profiles as unknown as { email: string } | null)?.email ?? "Unknown user"} —{" "}
                    ${claim.amount.toFixed(2)} in {claim.crypto_asset}
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-slate-400">
                    {claim.crypto_tx_note}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(claim.created_at).toLocaleString()}
                  </p>
                </div>
                <TopupReviewActions reference={claim.reference} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Recent activity</h2>
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/70 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {(recent ?? []).map((row) => (
                <tr key={row.id} className="border-t border-slate-800">
                  <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
                  <td className="px-4 py-3">
                    {row.currency} {row.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 capitalize">{row.method}</td>
                  <td className="px-4 py-3 capitalize">{row.status}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
