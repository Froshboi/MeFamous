import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/queries/profile";

const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/analytics", label: "Analytics", icon: "📈" },
  { href: "/admin/provider", label: "Provider", icon: "🔗" },
  { href: "/admin/wallet-topups", label: "Top-ups", icon: "💰" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) redirect("/login?redirectTo=/admin");
  if (user.role !== "admin" && user.role !== "super_admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <a href="#main-content" className="sr-only-focusable">
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden w-64 shrink-0 border-r border-slate-800 p-6 md:block">
          <Link href="/admin" className="mb-8 flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm">
              ⚡
            </span>
            MeFamous Admin
          </Link>

          <nav className="space-y-1">
            {ADMIN_NAV.map((item) => (
              <NavLink key={item.href} href={item.href} icon={item.icon}>
                {item.label}
              </NavLink>
            ))}
            <div className="my-4 border-t border-slate-800" />
            <NavLink href="/dashboard" icon="←">
              Back to dashboard
            </NavLink>
          </nav>
        </aside>

        <main id="main-content" className="min-w-0 flex-1 p-4 pb-24 md:p-6 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md justify-around py-2">
          {ADMIN_NAV.map((item) => (
            <MobileNavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
          ))}
        </div>
        <div className="h-safe-area-inset-bottom bg-slate-950" />
      </nav>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-slate-50"
    >
      <span className="text-base">{icon}</span>
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs text-slate-400 transition active:text-slate-50"
    >
      <span className="text-lg">{icon}</span>
      <span className="text-[10px]">{label}</span>
    </Link>
  );
}
