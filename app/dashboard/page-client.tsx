"use client";

import React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ClipboardList,
  Wallet,
  Users,
  BarChart3,
  UserCircle,
  Settings,
  Plus,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Zap,
  CreditCard,
  Layers,
} from "lucide-react";

/* ───────────────────────────────────────────────
   Types
   ─────────────────────────────────────────────── */
interface DashboardPageProps {
  user: {
    fullName: string | null;
    email: string;
    role: string;
  };
  stats: {
    balance: number;
    totalOrders: number;
    activeOrders: number;
    completedOrders: number;
    spentLast7Days: number;
    referralEarnings: number;
    loyaltyPoints: number;
  };
  recentOrders: {
    id: string;
    service: string;
    status: "pending" | "in_progress" | "completed" | "cancelled";
    createdAt: string;
  }[];
}

/* ───────────────────────────────────────────────
   Accent colour helper
   ─────────────────────────────────────────────── */
const ACCENT = "#DC2626"; // red-600

/* ───────────────────────────────────────────────
   Card component — the sexy rounded white card
   ─────────────────────────────────────────────── */
function Card({
  children,
  className = "",
  href,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
}) {
  const base =
    "group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 dark:border-slate-800 dark:bg-[#13131a]";

  if (href) {
    return (
      <Link href={href} className={`${base} block ${className}`}>
        {children}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button onClick={onClick} className={`${base} w-full text-left ${className}`}>
        {children}
      </button>
    );
  }
  return <div className={`${base} ${className}`}>{children}</div>;
}

/* ───────────────────────────────────────────────
   Icon badge — coloured circle with icon
   ─────────────────────────────────────────────── */
function IconBadge({
  icon: Icon,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div
      className="flex h-11 w-11 items-center justify-center rounded-2xl"
      style={{ backgroundColor: `${color}15`, color }}
    >
      <Icon className="h-5 w-5" />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Dashboard Overview Page
   ═══════════════════════════════════════════════ */
export default function DashboardPage({ user, stats, recentOrders }: DashboardPageProps) {
  const firstName = user.fullName?.split(" ")[0] ?? user.email.split("@")[0];

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* ── Welcome header ── */}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
          MeFamous Growth Dashboard
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
          Welcome back, <span className="capitalize">{firstName}</span>
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Manage your growth across every platform — track orders, top up your wallet and place new orders in seconds.
        </p>
      </div>

      {/* ── Quick-action buttons ── */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        <Link
          href="/dashboard/services"
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition-all hover:shadow-xl hover:shadow-red-500/30 active:scale-95"
          style={{ backgroundColor: ACCENT }}
        >
          <Plus className="h-4 w-4" />
          New Order
        </Link>
        <Link
          href="/dashboard/wallet"
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-[#13131a] dark:text-slate-200 dark:hover:bg-[#1a1a24]"
        >
          <CreditCard className="h-4 w-4" />
          Add Funds
        </Link>
        <Link
          href="/dashboard/orders"
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-[#13131a] dark:text-slate-200 dark:hover:bg-[#1a1a24]"
        >
          <Layers className="h-4 w-4" />
          Mass Order
        </Link>
      </div>

      {/* ═══════════════════════════════════════
          STATS GRID — 2 cols mobile, 3 cols desktop
          ═══════════════════════════════════════ */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {/* Balance */}
        <Card href="/dashboard/wallet" className="col-span-2 md:col-span-1">
          <div className="flex items-start justify-between">
            <IconBadge icon={Wallet} color={ACCENT} />
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-950/30 dark:text-red-400">
              BALANCE
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold tracking-tight">₦{stats.balance.toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-400">Available to spend</p>
          </div>
        </Card>

        {/* Total Orders */}
        <Card href="/dashboard/orders">
          <div className="flex items-start justify-between">
            <IconBadge icon={ClipboardList} color="#7C3AED" />
            <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-600 dark:bg-violet-950/30 dark:text-violet-400">
              {stats.activeOrders} active
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold tracking-tight">{stats.totalOrders.toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-400">Total orders</p>
          </div>
        </Card>

        {/* Completed */}
        <Card href="/dashboard/orders">
          <div className="flex items-start justify-between">
            <IconBadge icon={CheckCircle2} color="#10B981" />
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
              {Math.round((stats.completedOrders / Math.max(stats.totalOrders, 1)) * 100)}%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold tracking-tight">{stats.completedOrders.toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-400">Completed</p>
          </div>
        </Card>

        {/* Spent (7 days) */}
        <Card>
          <div className="flex items-start justify-between">
            <IconBadge icon={TrendingUp} color="#F59E0B" />
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
              7 days
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold tracking-tight">₦{stats.spentLast7Days.toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-400">Spent · last 7 days</p>
          </div>
        </Card>

        {/* Referral earnings */}
        <Card href="/dashboard/referrals">
          <div className="flex items-start justify-between">
            <IconBadge icon={Users} color="#8B5CF6" />
            <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-600 dark:bg-violet-950/30 dark:text-violet-400">
              5% each
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold tracking-tight">₦{stats.referralEarnings.toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-400">Referral earnings</p>
          </div>
        </Card>

        {/* Loyalty points */}
        <Card href="/dashboard/referrals">
          <div className="flex items-start justify-between">
            <IconBadge icon={Zap} color="#EC4899" />
            <span className="rounded-full bg-pink-50 px-2 py-0.5 text-[10px] font-bold text-pink-600 dark:bg-pink-950/30 dark:text-pink-400">
              +10/day
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold tracking-tight">{stats.loyaltyPoints} <span className="text-lg text-slate-400">pts</span></p>
            <p className="mt-1 text-xs text-slate-400">Worth ₦{stats.loyaltyPoints} in credit</p>
          </div>
        </Card>
      </div>

      {/* ═══════════════════════════════════════
          RECENT ORDERS SECTION
          ═══════════════════════════════════════ */}
      <Card className="mt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Recent orders</h2>
            <p className="text-xs text-slate-400">Your latest activity at a glance.</p>
          </div>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-10 dark:border-slate-800">
            <ClipboardList className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p className="mt-2 text-sm font-medium text-slate-400">No orders yet</p>
            <p className="text-xs text-slate-400">Place your first order to get started.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-2xl border border-slate-50 bg-slate-50/50 px-4 py-3 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/30 dark:hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                      order.status === "completed"
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : order.status === "in_progress"
                        ? "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {order.status === "completed" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : order.status === "in_progress" ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{order.service}</p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${
                    order.status === "completed"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : order.status === "in_progress"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {order.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ═══════════════════════════════════════
          QUICK-LINK GRID (mobile app-style tiles)
          ═══════════════════════════════════════ */}
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
          Quick Access
        </h2>
        <div className="grid grid-cols-4 gap-3 md:grid-cols-6">
          {[
            { icon: ShoppingBag, label: "Services", href: "/dashboard/services", color: "#DC2626" },
            { icon: ClipboardList, label: "Orders", href: "/dashboard/orders", color: "#7C3AED" },
            { icon: Wallet, label: "Wallet", href: "/dashboard/wallet", color: "#F59E0B" },
            { icon: Users, label: "Referrals", href: "/dashboard/referrals", color: "#8B5CF6" },
            { icon: BarChart3, label: "Reseller", href: "/dashboard/reseller", color: "#10B981" },
            { icon: Settings, label: "Settings", href: "/dashboard/settings", color: "#64748B" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-3 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95 dark:border-slate-800 dark:bg-[#13131a]"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${item.color}12`, color: item.color }}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
