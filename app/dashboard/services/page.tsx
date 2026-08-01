import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { OrderForm } from "@/components/dashboard/order-form";
import { ServiceSearchBar } from "@/components/dashboard/service-search-bar";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { FloatingAIButton } from "@/components/dashboard/floating-ai-button";
import { getPlatformMeta } from "@/lib/platform-branding";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  // Check onboarding status
  const [{ data: orders }, { data: topups }] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", user?.id ?? ""),
    supabase.from("wallet_topups").select("id", { count: "exact", head: true }).eq("user_id", user?.id ?? ""),
  ]);

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
    <div className="space-y-6">
      <WelcomeBanner
        fullName={user?.user_metadata?.full_name ?? ""}
        hasOrders={(orders?.length ?? 0) > 0}
        hasWalletTopup={(topups?.length ?? 0) > 0}
      />

      <div>
        <h1 className="text-2xl font-semibold">Services</h1>
        <p className="text-sm text-slate-400">Browse and order social media growth services.</p>
      </div>

      <Suspense fallback={<div className="h-10 w-full max-w-xs animate-pulse rounded-lg bg-slate-800" />}>
        <ServiceSearchBar categories={categories} />
      </Suspense>

      {grouped.size === 0 ? (
        <p className="text-sm text-slate-400">
          {q || category ? "No services match your search." : "No services available yet."}
        </p>
      ) : (
        [...grouped.entries()].map(([cat, categoryServices]) => {
          const meta = getPlatformMeta(cat);
          return (
            <div key={cat}>
              <div className="mb-3 flex items-center gap-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-md text-xs ${meta.color}`}>
                  {meta.icon}
                </span>
                <h2 className="text-lg font-medium">{cat}</h2>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                  {categoryServices?.length}
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {categoryServices?.map((service) => (
                  <div key={service.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-slate-700">
                    <p className="font-medium text-slate-50">{service.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-slate-500">₦{service.customer_rate.toFixed(2)} / 1,000</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-500">Min {service.min_quantity.toLocaleString()}</span>
                    </div>
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
          );
        })
      )}

      <FloatingAIButton />
    </div>
  );
}
