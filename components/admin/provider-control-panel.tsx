"use client";

import { useState, useTransition } from "react";
import {
  testProviderConnectivityAction,
  getProviderBalanceAction,
  syncProviderServicesAction,
  setProviderAutoSyncAction,
  setActiveProviderAction,
} from "@/lib/actions/provider-admin";

export function ProviderControlPanel({
  autoSyncEnabled,
  availableProviders,
  activeProviderKey,
}: {
  autoSyncEnabled: boolean;
  availableProviders: { key: string; displayName: string }[];
  activeProviderKey: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [autoSync, setAutoSync] = useState(autoSyncEnabled);
  const [activeProvider, setActiveProviderState] = useState(activeProviderKey);

  function run(action: () => Promise<{ error?: string; message?: string; success?: boolean }>) {
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        setMessage({ tone: "error", text: result.error });
      } else {
        setMessage({ tone: "ok", text: result.message ?? "Done." });
      }
    });
  }

  return (
    <div className="space-y-6">
      {message ? (
        <p
          className={`rounded-lg border px-3 py-2 text-sm ${
            message.tone === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
        <p className="font-medium">Active provider</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          New orders and catalog syncs use this provider. Services already synced from a different
          provider keep working — switching here doesn&apos;t touch them until you sync again.
        </p>
        <label htmlFor="active-provider" className="sr-only">
          Active provider
        </label>
        <select
          id="active-provider"
          value={activeProvider}
          disabled={isPending}
          onChange={(e) => {
            const next = e.target.value;
            setActiveProviderState(next);
            run(() => setActiveProviderAction(next));
          }}
          className="mt-3 w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
        >
          {availableProviders.map((p) => (
            <option key={p.key} value={p.key}>
              {p.displayName}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
          Only one provider is implemented today. To add another, write an adapter in{" "}
          <code>lib/providers/</code> and register it — it&apos;ll show up here automatically.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <button
          disabled={isPending}
          onClick={() => run(testProviderConnectivityAction)}
          className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-violet disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900/50"
        >
          <p className="font-medium">Test connectivity</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Pings the active provider&apos;s balance endpoint and reports latency.
          </p>
        </button>

        <button
          disabled={isPending}
          onClick={() =>
            run(async () => {
              const result = await getProviderBalanceAction();
              return result.success
                ? { success: true, message: `Balance: $${result.balance} ${result.currency}` }
                : result;
            })
          }
          className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-violet disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900/50"
        >
          <p className="font-medium">View provider balance</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your current account balance.</p>
        </button>

        <button
          disabled={isPending}
          onClick={() =>
            run(async () => {
              const result = await syncProviderServicesAction();
              return result.success
                ? {
                    success: true,
                    message: `Synced ${result.synced} services (${result.deactivated} deactivated).`,
                  }
                : result;
            })
          }
          className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-violet disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900/50"
        >
          <p className="font-medium">Sync services now</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Pulls the full catalog and updates pricing/availability.
          </p>
        </button>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
          <p className="font-medium">Automatic scheduled sync</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Runs every 6 hours via Vercel Cron when enabled.
          </p>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoSync}
              disabled={isPending}
              onChange={(e) => {
                const next = e.target.checked;
                setAutoSync(next);
                run(() => setProviderAutoSyncAction(next));
              }}
            />
            Enabled
          </label>
        </div>
      </div>
    </div>
  );
}
