import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/queries/profile";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) redirect("/login?redirectTo=/admin");
  if (user.role !== "admin" && user.role !== "super_admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <a href="#main-content" className="sr-only-focusable">Skip to content</a>
      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 p-6 dark:border-slate-800 md:block">
          <Link href="/dashboard" className="mb-8 block text-lg font-semibold">
            MeFamous Admin
          </Link>
          <nav className="space-y-1">
            <Link href="/admin" className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50">
              Overview
            </Link>
            <Link href="/admin/analytics" className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50">
              Analytics
            </Link>
            <Link href="/admin/provider" className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50">
              SMM provider
            </Link>
            <Link href="/admin/wallet-topups" className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50">
              Wallet top-ups
            </Link>
            <Link href="/dashboard" className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50">
              ← Back to dashboard
            </Link>
          </nav>
        </aside>
        <main id="main-content" className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
