"use client";

import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      suppressHydrationWarning
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="rounded-lg border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
    >
      <span aria-hidden="true" suppressHydrationWarning>
        {theme === "dark" ? "☀️" : "🌙"}
      </span>
    </button>
  );
}
