import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/queries/profile";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/actions/auth";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", roles: ["customer", "reseller", "admin", "super_admin", "moderator"] },
  { href: "/dashboard/services", label: "Services", roles: ["customer", "reseller", "admin", "super_admin"] },
  { href: "/dashboard/orders", label: "Orders", roles: ["customer", "reseller", "admin", "super_admin"] },
  { href: "/dashboard/wallet", label: "Wallet", roles: ["customer", "reseller", "admin", "super_admin"] },
  { href: "/dashboard/referrals", label: "Referrals", roles: ["customer", "reseller", "admin", "super_admin", "moderator"] },
  { href: "/dashboard/reseller", label: "Reseller tools", roles: ["reseller", "admin", "super_admin"] },
  { href: "/dashboard/profile", label: "Profile", roles: ["customer", "reseller", "admin", "super_admin", "moderator"] },
  { href: "/dashboard/settings", label: "Settings", roles: ["customer", "reseller", "admin", "super_admin", "moderator"] },
  { href: "/admin", label: "Admin panel", roles: ["admin", "super_admin"] },
] as const;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  const supabase = await createClient();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, title, body, link, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  const visibleNav = NAV_ITEMS.filter((item) => (item.roles as readonly string[]).includes(user.role));

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <a href="#main-content" className="sr-only-focusable">Skip to content</a>
      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 p-6 dark:border-slate-800 md:block">
          <Link href="/" className="mb-8 block text-lg font-semibold">MeFamous</Link>
          <nav className="space-y-1">
            {visibleNav.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50">
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{user.fullName ?? user.email}</p>
              <p className="text-xs capitalize text-slate-500 dark:text-slate-400">{user.role}</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <NotificationBell notifications={notifications ?? []} />
              <form action={signOutAction}>
                <button type="submit" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900">Sign out</button>
              </form>
            </div>
          </header>
          <main id="main-content" className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
