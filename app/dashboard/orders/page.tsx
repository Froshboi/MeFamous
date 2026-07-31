import { createClient } from "@/lib/supabase/server";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-slate-800 text-slate-300",
  submitted: "bg-cyan/20 text-cyan",
  in_progress: "bg-violet/20 text-violet",
  partial: "bg-amber-500/20 text-amber-400",
  completed: "bg-emerald-500/20 text-emerald-400",
  cancelled: "bg-slate-700 text-slate-300",
  failed: "bg-red-500/20 text-red-400",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, quantity, price_charged, status, start_count, remains, created_at, service_id, services(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Your orders</h1>

      {!orders || orders.length === 0 ? (
        <p className="text-sm text-slate-400">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/70 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Start count</th>
                <th className="px-4 py-3">Remaining</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-slate-800">
                  <td className="px-4 py-3">
                    {(order.services as unknown as { name: string } | null)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">{order.quantity}</td>
                  <td className="px-4 py-3">${order.price_charged.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-400">{order.start_count ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-400">{order.remains ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs capitalize ${STATUS_STYLES[order.status] ?? "bg-slate-800 text-slate-300"}`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </td>
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
  );
}
