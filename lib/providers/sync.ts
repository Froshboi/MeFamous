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
 * upserts it into `services`, keyed on (provider, provider_service_id).
 */
export async function syncActiveProviderCatalog(): Promise<SyncResult> {
  const provider = await getActiveProvider();
  const services = await provider.getServices({ skipCache: true });
  const admin = createAdminClient();

  const { data: existing, error: fetchError } = await admin
    .from("services")
    .select("provider_service_id, markup_percent, is_active")
    .eq("provider", provider.key);
  
  if (fetchError) {
    console.error("Failed to fetch existing services:", fetchError);
    throw new Error(`Failed to fetch existing services: ${fetchError.message}`);
  }

  const existingByProviderServiceId = new Map(
    (existing ?? []).map((row) => [row.provider_service_id, row])
  );
  const seenIds = new Set<string>();

  const upserts = services.map((service) => {
    seenIds.add(service.providerServiceId);
    const prior = existingByProviderServiceId.get(service.providerServiceId);
    return {
      provider: provider.key,
      supports_refill: service.refill ?? false,
supports_cancel: service.cancel ?? false,
      provider_type: service.type,
      category: service.category,
      provider_rate: service.rate,
      markup_percent: prior?.markup_percent ?? 30,
      min_quantity: service.min,
      max_quantity: service.max,
      supports_refill: service.refill ?? false,   // ← coerce null to false
      supports_cancel: service.cancel ?? false,     // ← coerce null to false
      is_active: prior ? prior.is_active : true,
      synced_at: new Date().toISOString(),
    };
  });

  if (upserts.length > 0) {
    const { error } = await admin
      .from("services")
      .upsert(upserts, { onConflict: "provider,provider_service_id" });
    
    if (error) {
      console.error("Upsert failed:", error);
      throw new Error(`Failed to upsert services: ${error.message}`);
    }
  }

  const staleIds = [...existingByProviderServiceId.keys()].filter((id) => !seenIds.has(id));
  if (staleIds.length > 0) {
    const { error } = await admin
      .from("services")
      .update({ is_active: false })
      .eq("provider", provider.key)
      .in("provider_service_id", staleIds);
    
    if (error) {
      console.error("Deactivation failed:", error);
      throw new Error(`Failed to deactivate stale services: ${error.message}`);
    }
  }

  const { error: settingsError } = await admin
    .from("app_settings")
    .upsert({ 
      key: `${provider.key}_last_synced_at`, 
      value: new Date().toISOString() 
    });
  
  if (settingsError) {
    console.error("Failed to update last sync time:", settingsError);
  }

  return { provider: provider.key, synced: upserts.length, deactivated: staleIds.length };
}
