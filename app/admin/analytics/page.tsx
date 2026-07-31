import { createAdminClient } from "@/lib/supabase/server";
import {
  RevenueChart,
  SignupsChart,
  OrderStatusPie,
  TopServicesChart,
} from "@/components/admin/analytics-charts";

const DAYS = 30;

function dayKey(dateString: string): string {
  return new Date(dateString).toISOString().slice(0, 10);
}

function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default async function AdminAnalyticsPage() {
  const admin = createAdminClient();
  const since = new Date();
  since.setDate(since.getDate() - DAYS);

  const [{ data: orders }, { data: profiles }, { data: services }] = await Promise.all([
    admin
      .from("orders")
      .select("created_at, price_charged, status, service_id")
      .gte("created_at", since.toISOString()),
    admin.from("profiles").select("created_at").gte("created_at", since.toISOString()),
    admin.from("services").select("id, name"),
  ]);

  const days = lastNDays(DAYS);
  const revenueByDay = new Map(days.map((d) => [d, 0]));
  const signupsByDay = new Map(days.map((d) => [d, 0]));
  const statusCounts = new Map<string, number>();
  const ordersByService = new Map<number, number>();

  for (const order of orders ?? []) {
    if (order.status !== "failed") {
      const key = dayKey(order.created_at);
      revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + order.price_charged);
    }
    statusCounts.set(order.status, (statusCounts.get(order.status) ?? 0) + 1);
    ordersByService.set(order.service_id, (ordersByService.get(order.service_id) ?? 0) + 1);
  }

  for (const profile of profiles ?? []) {
    const key = dayKey(profile.created_at);
    signupsByDay.set(key, (signupsByDay.get(key) ?? 0) + 1);
  }

  const serviceNameById = new Map((services ?? []).map((s) => [s.id, s.name]));
  const topServices = [...ordersByService.entries()]
    .map(([serviceId, count]) => ({ name: serviceNameById.get(serviceId) ?? `#${serviceId}`, orders: count }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 8);

  const revenueData = days.map((d) => ({
    date: d.slice(5),
    revenue: Math.round((revenueByDay.get(d) ?? 0) * 100) / 100,
  }));
  const signupsData = days.map((d) => ({ date: d.slice(5), signups: signupsByDay.get(d) ?? 0 }));
  const statusData = [...statusCounts.entries()].map(([status, count]) => ({ status, count }));

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = (orders ?? []).length;
  const totalSignups = (profiles ?? []).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-slate-400">Last {DAYS} days.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Revenue (excl. failed)" value={`$${totalRevenue.toFixed(2)}`} />
        <StatCard label="Orders" value={totalOrders} />
        <StatCard label="New signups" value={totalSignups} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Revenue">
          <RevenueChart data={revenueData} />
        </ChartCard>
        <ChartCard title="Signups">
          <SignupsChart data={signupsData} />
        </ChartCard>
        <ChartCard title="Orders by status">
          {statusData.length > 0 ? (
            <OrderStatusPie data={statusData} />
          ) : (
            <p className="py-16 text-center text-sm text-slate-500">No orders yet.</p>
          )}
        </ChartCard>
        <ChartCard title="Top services">
          {topServices.length > 0 ? (
            <TopServicesChart data={topServices} />
          ) : (
            <p className="py-16 text-center text-sm text-slate-500">No orders yet.</p>
          )}
        </ChartCard>
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

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <h2 className="mb-3 text-sm font-medium text-slate-300">{title}</h2>
      {children}
    </div>
  );
}
