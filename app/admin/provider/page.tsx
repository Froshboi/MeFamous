import { createAdminClient } from "@/lib/supabase/server";
import { getActiveProviderKey, listProviders } from "@/lib/providers/registry";
import { ProviderControlPanel } from "@/components/admin/provider-control-panel";

export default async function AdminProviderPage() {
  const admin = createAdminClient();
  const activeProviderKey = await getActiveProviderKey();
  const availableProviders = listProviders().map((p) => ({ key: p.key, displayName: p.displayName }));

  const { data: autoSyncSetting } = await admin
    .from("app_settings")
    .select("value")
    .eq("key", "provider_auto_sync_enabled")
    .single();

  const { data: lastSyncedSetting } = await admin
    .from("app_settings")
    .select("value")
    .eq("key", `${activeProviderKey}_last_synced_at`)
    .single();

  const { data: logs } = await admin
    .from("provider_api_logs")
    .select("id, provider, action, success, http_status, error_message, duration_ms, created_at")
    .order("created_at", { ascending: false })
    .limit(25);

  const lastSyncedAt = lastSyncedSetting?.value as string | undefined;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">SMM provider</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Last catalog sync: {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : "never"}.
        </p>
      </div>

      <ProviderControlPanel
        autoSyncEnabled={autoSyncSetting?.value === true}
        availableProviders={availableProviders}
        activeProviderKey={activeProviderKey}
      />

      <div>
        <h2 className="mb-3 text-lg font-medium">Recent API activity</h2>
        {!logs || logs.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No requests logged yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500 dark:bg-slate-900/70 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">When</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-4 py-3 text-xs capitalize">{log.provider}</td>
                    <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
                    <td className="px-4 py-3">
                      {log.success ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                          success
                        </span>
                      ) : (
                        <span
                          title={log.error_message ?? undefined}
                          className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700 dark:bg-red-500/20 dark:text-red-400"
                        >
                          failed{log.http_status ? ` (${log.http_status})` : ""}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{log.duration_ms ?? "—"}ms</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
