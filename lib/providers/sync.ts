import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { getActiveProvider } from "./registry";

export interface SyncResult {
  provider: string;
  synced: number;
  deactivated: number;
}

/**
 * Pulls the full catalog from whichever provider is currently active and
 * upserts it into `services`, keyed on (provider, provider_service_id) —
 * NOT on services.id, which is now just an internal identifier. Existing
 * rows keep their admin-set `markup_percent` / `is_active`. Services no
 * longer returned by the provider are deactivated, never deleted, so past
 * orders keep a valid foreign key. If the active provider changes,
 * services from the previously-active provider are left untouched (they
 * simply stop being kept in sync) — switching providers doesn't silently
 * wipe or reprice anything.
 */
export async function syncActiveProviderCatalog(): Promise<SyncResult> {
  const provider = await getActiveProvider();
  const services = await provider.getServices({ skipCache: true });
  const admin = createAdminClient();

  const { data: existing, error: fetchError } = await admin
    .from("services")
    .select("provider_service_id, markup_percent, is_active")
    .eq("provider", provider.key);
  if (fetchError) throw fetchError;

  const existingByProviderServiceId = new Map((existing ?? []).map((row) => [row.provider_service_id, row]));
  const seenIds = new Set<string>();

  const upserts = services.map((service) => {
    seenIds.add(service.providerServiceId);
    const prior = existingByProviderServiceId.get(service.providerServiceId);
    return {
      provider: provider.key,
      provider_service_id: service.providerServiceId,
      name: service.name,
      provider_type: service.type,
      category: service.category,
      provider_rate: service.rate,
      markup_percent: prior?.markup_percent ?? 30,
      min_quantity: service.min,
      max_quantity: service.max,
      supports_refill: service.refill,
      supports_cancel: service.cancel,
      is_active: prior ? prior.is_active : true,
      synced_at: new Date().toISOString(),
    };
  });

  if (upserts.length > 0) {
    const { error } = await admin
      .from("services")
      .upsert(upserts, { onConflict: "provider,provider_service_id" });
    if (error) throw error;
  }

  const staleIds = [...existingByProviderServiceId.keys()].filter((id) => !seenIds.has(id));
  if (staleIds.length > 0) {
    const { error } = await admin
      .from("services")
      .update({ is_active: false })
      .eq("provider", provider.key)
      .in("provider_service_id", staleIds);
    if (error) throw error;
  }

  await admin
    .from("app_settings")
    .upsert({ key: `${provider.key}_last_synced_at`, value: new Date().toISOString() });

  return { provider: provider.key, synced: upserts.length, deactivated: staleIds.length };
}
