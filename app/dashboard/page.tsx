import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/queries/profile";
import { createClient } from "@/lib/supabase/server";
import DashboardPageClient from "./page-client";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/dashboard");

  const supabase = await createClient();

  /* ── Recent orders (last 5) ── */
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id,
      service_id,
      price_charged,
      status,
      created_at,
      services (name)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  /* ── Order stats ── */
  const { count: totalOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: completedOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed");

  const { count: activeOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .in("status", ["pending", "submitted", "in_progress", "partial"]);

  /* ── Spent in last 7 days ── */
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentSpent } = await supabase
    .from("orders")
    .select("price_charged")
    .eq("user_id", user.id)
    .gte("created_at", sevenDaysAgo.toISOString());

  const spentLast7Days = recentSpent?.reduce(
    (sum, o) => sum + Number(o.price_charged || 0),
    0
  ) ?? 0;

  /* ── Wallet balance (from profiles, not a separate table) ── */
  const { data: profile } = await supabase
    .from("profiles")
    .select("wallet_balance")
    .eq("id", user.id)
    .single();

  /* ── Referral earnings (from referral_rewards, column is referrer_id) ── */
  const { data: referralRewards } = await supabase
    .from("referral_rewards")
    .select("amount")
    .eq("referrer_id", user.id);

  const totalReferralEarnings = referralRewards?.reduce(
    (sum, r) => sum + Number(r.amount || 0),
    0
  ) ?? 0;

  /* ── Map orders for client ── */
  const recentOrders = (orders ?? []).map((o: any) => ({
    id: o.id,
    service: o.services?.name ?? "Unknown Service",
    status: o.status as "pending" | "in_progress" | "completed" | "cancelled",
    createdAt: o.created_at,
  }));

  const stats = {
    balance: Number(profile?.wallet_balance ?? 0),
    totalOrders: totalOrders ?? 0,
    activeOrders: activeOrders ?? 0,
    completedOrders: completedOrders ?? 0,
    spentLast7Days,
    referralEarnings: totalReferralEarnings,
    loyaltyPoints: 0, // No loyalty_points table in schema
  };

  return (
    <DashboardPageClient
      user={{
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      }}
      stats={stats}
      recentOrders={recentOrders}
    />
  );
}
