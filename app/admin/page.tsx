import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";

export default async function AdminOverviewPage() {
  const admin = createAdminClient();

  const [
    { count: totalUsers },
    { count: activeServices },
    { count: pendingCryptoClaims },
    { data: recentOrders },
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("services").select("id", { count: "exact", head: true }).eq("is_active", true),
    admin
      .from("wallet_topups")
      .select("id", { count: "exact", head: true })
      .eq("method", "crypto")
      .eq("status", "pending"),
    admin
      .from("orders")
      .select("id, quantity, price_charged, status, created_at, service_id, services(name)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Admin overview</h1>
        <p className="text-sm text-slate-400">A snapshot of what needs attention right now.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total users" value={totalUsers ?? 0} />
        <StatCard label="Active services" value={activeServices ?? 0} />
        <StatCard
          label="Pending crypto claims"
          value={pendingCryptoClaims ?? 0}
          href="/admin/wallet-topups"
          highlight={(pendingCryptoClaims ?? 0) > 0}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/analytics"
          className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          View analytics
        </Link>
        <Link
          href="/admin/provider"
          className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          Manage provider
        </Link>
        <Link
          href="/admin/wallet-topups"
          className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          Review top-ups
        </Link>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Recent orders</h2>
        {!recentOrders || recentOrders.length === 0 ? (
          <p className="text-sm text-slate-400">No orders yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/70 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-t border-slate-800">
                    <td className="px-4 py-3">
                      {(order.services as unknown as { name: string } | null)?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">{order.quantity}</td>
                    <td className="px-4 py-3">${order.price_charged.toFixed(2)}</td>
                    <td className="px-4 py-3 capitalize">{order.status.replace("_", " ")}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(order.created_at).toLocaleDateString()}
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

function StatCard({
  label,
  value,
  href,
  highlight,
}: {
  label: string;
  value: string | number;
  href?: string;
  highlight?: boolean;
}) {
  const content = (
    <div
      className={`rounded-xl border p-5 transition ${
        highlight
          ? "border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/15"
          : "border-slate-800 bg-slate-900/50"
      }`}
    >
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
