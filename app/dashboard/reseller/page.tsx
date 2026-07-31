import { createClient } from "@/lib/supabase/server";
import { BulkOrderForm } from "@/components/dashboard/bulk-order-form";

export default async function ResellerToolsPage() {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("id, name, category")
    .eq("is_active", true)
    .order("category")
    .order("name");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reseller tools</h1>
        <p className="text-sm text-slate-400">
          Place one order per client in a single submission — same wallet, same pricing, same
          per-line refund-on-failure protection as ordering one at a time.
        </p>
      </div>

      {!services || services.length === 0 ? (
        <p className="text-sm text-slate-400">No services are available yet.</p>
      ) : (
        <BulkOrderForm services={services} />
      )}
    </div>
  );
}
