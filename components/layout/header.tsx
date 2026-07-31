import Link from "next/link";
import { BRAND } from "@/lib/constants/brand";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const NAV_ITEMS = [
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Calculator", href: "/#calculator" },
  { label: "FAQ", href: "/#faq" },
];

/**
 * Public marketing header. Only rendered on the unauthenticated
 * landing/marketing routes — the dashboard uses its own topbar
 * (see components/layout/dashboard-topbar.tsx, added in Phase 5).
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-lg dark:border-white/10 dark:bg-slate/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
          {BRAND.name}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm font-medium text-slate-700 transition hover:text-slate-950 dark:text-slate-200 dark:hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-gradient-to-r from-violet to-cyan px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet/20 transition hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
