import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/queries/profile";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-slate-800 text-slate-300",
  submitted: "bg-cyan-900/30 text-cyan-400",
  in_progress: "bg-violet-900/30 text-violet-400",
  partial: "bg-amber-900/30 text-amber-400",
  completed: "bg-emerald-900/30 text-emerald-400",
  cancelled: "bg-slate-800 text-slate-300",
  failed: "bg-red-900/30 text-red-400",
};

const IN_FLIGHT = new Set(["pending", "submitted", "in_progress", "partial"]);

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null; // layout already handles redirect

  const supabase = await createClient();

  // SAFER: wrap each query so one failure doesn't kill the page
  let orders: any[] = [];
  let walletBalance = 0;

  try {
    const { data: ordersData } = await supabase
      .from("orders")
      .select("id, quantity, price_charged, status, created_at, service_id, services(name)")
      .eq("user_id", user.id) // <-- ADD THIS if your column is user_id
      .order("created_at", { ascending: false })
      .limit(200);
    orders = ordersData ?? [];
  } catch {
    orders = [];
  }

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user.id)
      .single();
    walletBalance = profile?.wallet_balance ?? 0;
  } catch {
    walletBalance = 0;
  }

  const allOrders = orders;
  const inFlight = allOrders.filter((o) => IN_FLIGHT.has(o.status)).length;
  const completed = allOrders.filter((o) => o.status === "completed").length;
  const recentOrders = allOrders.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome back{user.fullName ? `, ${user.fullName}` : ""}
        </h1>
        <p className="text-sm text-slate-400">Here&apos;s what&apos;s happening with your account.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Wallet balance" value={`$${walletBalance.toFixed(2)}`} />
        <StatCard label="Orders in progress" value={inFlight} />
        <StatCard label="Completed orders" value={completed} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/services" className="rounded-full bg-gradient-to-r from-violet-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20">
          Order a service
        </Link>
        <Link href="/dashboard/wallet" className="rounded-full border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-900">
          Top up wallet
        </Link>
        <Link href="/dashboard/orders" className="rounded-full border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-900">
          View all orders
        </Link>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">Recent orders</h2>
          <Link href="/dashboard/orders" className="text-sm text-cyan-400 hover:underline">View all</Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-slate-400">
            You haven&apos;t placed any orders yet.{" "}
            <Link href="/dashboard/services" className="text-cyan-400 hover:underline">Browse services</Link>.
          </p>
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
                    <td className="px-4 py-3">{order.quantity ?? "—"}</td>
                    <td className="px-4 py-3">
                      ${order.price_charged != null ? order.price_charged.toFixed(2) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs capitalize ${STATUS_STYLES[order.status] ?? "bg-slate-800 text-slate-300"}`}>
                        {order.status?.replace("_", " ") ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : "—"}
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

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
