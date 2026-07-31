import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { OrderForm } from "@/components/dashboard/order-form";
import { ServiceSearchBar } from "@/components/dashboard/service-search-bar";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const supabase = await createClient();

  const { data: allCategories } = await supabase
    .from("services")
    .select("category")
    .eq("is_active", true);
  const categories = [...new Set((allCategories ?? []).map((c) => c.category))].sort();

  let query = supabase
    .from("services")
    .select("id, name, category, customer_rate, min_quantity, max_quantity")
    .eq("is_active", true);

  if (q) query = query.ilike("name", `%${q}%`);
  if (category) query = query.eq("category", category);

  const { data: services } = await query.order("category").order("name");

  const grouped = new Map<string, typeof services>();
  for (const service of services ?? []) {
    const list = grouped.get(service.category) ?? [];
    list.push(service);
    grouped.set(service.category, list);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Services</h1>
        <p className="text-sm text-slate-400">
          Synced from our provider catalog. Pricing already includes our platform fee.
        </p>
      </div>

      <Suspense fallback={<div className={`h-10 w-full max-w-xs animate-pulse rounded-lg bg-slate-900`} />}>
        <ServiceSearchBar categories={categories} />
      </Suspense>

      {grouped.size === 0 ? (
        <p className="text-sm text-slate-400">
          {q || category
            ? "No services match your search."
            : "No services are available yet — an admin needs to run a catalog sync from Admin → SMM provider."}
        </p>
      ) : (
        [...grouped.entries()].map(([cat, categoryServices]) => (
          <div key={cat}>
            <h2 className="mb-3 text-lg font-medium">{cat}</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {categoryServices?.map((service) => (
                <div key={service.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                  <p className="font-medium text-slate-50">{service.name}</p>
                  <OrderForm
                    serviceId={service.id}
                    minQuantity={service.min_quantity}
                    maxQuantity={service.max_quantity}
                    ratePerThousand={service.customer_rate}
                  />
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
