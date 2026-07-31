"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Wallet,
  Users,
  BarChart3,
  UserCircle,
  Settings,
  Shield,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { signOutAction } from "@/lib/actions/auth";
import { NotificationBell } from "@/components/dashboard/notification-bell";

/* ───────────────────────────────────────────────
   Types
   ─────────────────────────────────────────────── */
type Role = "customer" | "reseller" | "admin" | "super_admin" | "moderator";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: readonly Role[];
  badge?: string;
}

/* ───────────────────────────────────────────────
   Navigation config
   ─────────────────────────────────────────────── */
const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, roles: ["customer", "reseller", "admin", "super_admin", "moderator"] },
  { href: "/dashboard/services", label: "Services", icon: ShoppingBag, roles: ["customer", "reseller", "admin", "super_admin"] },
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList, roles: ["customer", "reseller", "admin", "super_admin"] },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet, roles: ["customer", "reseller", "admin", "super_admin"] },
  { href: "/dashboard/referrals", label: "Referrals", icon: Users, roles: ["customer", "reseller", "admin", "super_admin", "moderator"] },
  { href: "/dashboard/reseller", label: "Reseller Lab", icon: BarChart3, roles: ["reseller", "admin", "super_admin"] },
  { href: "/dashboard/profile", label: "Profile", icon: UserCircle, roles: ["customer", "reseller", "admin", "super_admin", "moderator"] },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["customer", "reseller", "admin", "super_admin", "moderator"] },
  { href: "/admin", label: "Admin", icon: Shield, roles: ["admin", "super_admin"], badge: "Admin" },
];

const BOTTOM_NAV: Pick<NavItem, "href" | "label" | "icon">[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/services", label: "Services", icon: ShoppingBag },
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
];

const ACCENT = { light: "#DC2626", dark: "#EF4444" };

/* ═══════════════════════════════════════════════
   DashboardLayoutClient
   ═══════════════════════════════════════════════ */
export default function DashboardLayoutClient({
  children,
  user,
  notifications,
}: {
  children: React.ReactNode;
  user: {
    fullName: string | null;
    email: string;
    role: Role;
  };
  notifications: import("@/components/dashboard/notification-bell").NotificationItem[];
}) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visibleNav = NAV_ITEMS.filter((item) =>
    (item.roles as readonly string[]).includes(user.role)
  );

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const accentColor = theme === "dark" ? ACCENT.dark : ACCENT.light;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#0a0a0f] dark:text-slate-100">
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-cyan-400 focus:px-4 focus:py-2 focus:text-slate-950"
      >
        Skip to content
      </a>

      {/* ═══════ DESKTOP SIDEBAR ═══════ */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0f0f14] md:flex">
        <div className="flex h-16 items-center px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: accentColor }}>
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">MeFamous</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {visibleNav.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-slate-100 text-slate-900 dark:bg-slate-800/60 dark:text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200"
                }`}
              >
                <Icon className={`h-[18px] w-[18px] transition-colors ${active ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"}`} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: accentColor }}>
                    {item.badge}
                  </span>
                )}
                {active && <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200"
          >
            {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>
          <form action={signOutAction} className="mt-0.5">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/20 dark:hover:text-red-400"
            >
              <LogOut className="h-[18px] w-[18px]" />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* ═══════ MOBILE HEADER ═══════ */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-[#0a0a0f]/80 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition active:scale-95 dark:text-slate-300"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: accentColor }}>
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight">MeFamous</span>
        </Link>

        <NotificationBell notifications={notifications} />
      </header>

      {/* ═══════ MOBILE DRAWER ═══════ */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-[280px] bg-white shadow-2xl dark:bg-[#0f0f14] md:hidden">
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5 dark:border-slate-800">
              <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: accentColor }}>
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight">MeFamous</span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mx-4 mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-sm font-bold text-slate-600 dark:from-slate-700 dark:to-slate-600 dark:text-slate-200">
                  {(user.fullName ?? user.email).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user.fullName ?? user.email}</p>
                  <p className="text-xs capitalize text-slate-400">{user.role}</p>
                </div>
              </div>
            </div>

            <nav className="mt-2 space-y-0.5 px-3 py-4">
              {visibleNav.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                      active
                        ? "bg-slate-100 text-slate-900 dark:bg-slate-800/60 dark:text-white"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: accentColor }}>
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100 p-3 dark:border-slate-800">
              <button
                onClick={() => { toggleTheme(); }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40"
              >
                {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
                <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
              </button>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="mt-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/20 dark:hover:text-red-400"
                >
                  <LogOut className="h-[18px] w-[18px]" />
                  <span>Sign out</span>
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ═══════ MAIN CONTENT ═══════ */}
      <div className="md:ml-64">
        {/* Desktop topbar */}
        <div className="hidden h-16 items-center justify-end border-b border-slate-200 bg-white/60 px-8 backdrop-blur-xl dark:border-slate-800 dark:bg-[#0a0a0f]/60 md:flex">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-xs font-bold text-slate-600 dark:from-slate-700 dark:to-slate-600 dark:text-slate-200">
                {(user.fullName ?? user.email).charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium leading-none">{user.fullName ?? user.email}</p>
                <p className="mt-0.5 text-[11px] capitalize text-slate-400">{user.role}</p>
              </div>
            </div>
            <NotificationBell notifications={notifications} />
          </div>
        </div>

        <main id="main-content" className="min-h-[calc(100vh-4rem)] p-4 pb-24 md:p-8 md:pb-8">
          {children}
        </main>
      </div>

      {/* ═══════ MOBILE BOTTOM NAV ═══════ */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-[#0a0a0f]/90 md:hidden">
        <div className="flex h-16 items-center justify-around px-2">
          {BOTTOM_NAV.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 transition-all active:scale-95"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${active ? "text-white shadow-lg" : "text-slate-400 dark:text-slate-500"}`}
                  style={active ? { backgroundColor: accentColor } : undefined}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                <span className={`text-[10px] font-semibold ${active ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  );
}
