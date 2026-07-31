import type { ReactNode } from "react";
import Link from "next/link";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur">
        <Link href="/" className="mb-6 inline-block text-lg font-semibold text-slate-900 dark:text-slate-50">
          MeFamous
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
        <div className="mt-6">{children}</div>
        {footer ? <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">{footer}</div> : null}
      </div>
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
      {message}
    </p>
  );
}

export function FormSuccess({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300">
      {message}
    </p>
  );
}

export const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet focus:outline-none focus:ring-1 focus:ring-violet dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500";

export const primaryButtonClass =
  "w-full rounded-lg bg-gradient-to-r from-violet to-cyan px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";
