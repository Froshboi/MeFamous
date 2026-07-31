import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/queries/profile";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/actions/auth";
import { NotificationBell } from "@/components/dashboard/notification-bell";

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

  let notifications: any[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("notifications")
      .select("id, type, title, body, link, read_at, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    notifications = data ?? [];
  } catch {
    notifications = [];
  }

  const visibleNav = NAV_ITEMS.filter((item) =>
    (item.roles as readonly string[]).includes(user.role)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <a href="#main-content" className="sr-only-focusable">
        Skip to content
      </a>
      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden w-64 shrink-0 border-r border-slate-800 p-6 md:block">
          <Link href="/" className="mb-8 block text-lg font-semibold">
            MeFamous
          </Link>
          <nav className="space-y-1">
            {visibleNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
            <div>
              <p className="text-sm font-medium text-white">
                {user.fullName ?? user.email}
              </p>
              <p className="text-xs capitalize text-slate-500">{user.role}</p>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell notifications={notifications} />
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-900"
                >
                  Sign out
                </button>
              </form>
            </div>
          </header>
          <main id="main-content" className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
