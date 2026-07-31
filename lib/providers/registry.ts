import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { OwletProvider } from "./owlet-provider";
import type { SmmProvider } from "./types";

/**
 * Register every implemented adapter here. Adding a new provider means
 * writing one file that implements SmmProvider (see owlet-provider.ts for
 * the pattern) and adding one line below — nothing else in the app
 * changes.
 */
const REGISTRY: Record<string, SmmProvider> = {
  owlet: new OwletProvider(),
};

export function listProviders(): SmmProvider[] {
  return Object.values(REGISTRY);
}

export function getProvider(key: string): SmmProvider {
  const provider = REGISTRY[key];
  if (!provider) {
    throw new Error(
      `Provider "${key}" is not implemented. Add an adapter in lib/providers/ and register it in lib/providers/registry.ts.`
    );
  }
  return provider;
}

/**
 * Which provider new orders/syncs use — stored in app_settings so it can
 * change from the admin panel without a redeploy. Defaults to "owlet" if
 * unset (fresh database, migration not yet run, etc).
 */
export async function getActiveProviderKey(): Promise<string> {
  const admin = createAdminClient();
  const { data } = await admin.from("app_settings").select("value").eq("key", "active_provider").single();
  return typeof data?.value === "string" ? data.value : "owlet";
}

export async function getActiveProvider(): Promise<SmmProvider> {
  const key = await getActiveProviderKey();
  return getProvider(key);
}

export async function setActiveProvider(key: string): Promise<void> {
  // Throws if `key` isn't registered — never let app_settings point at a
  // provider that doesn't actually exist in code.
  getProvider(key);

  const admin = createAdminClient();
  const { error } = await admin.from("app_settings").upsert({ key: "active_provider", value: key });
  if (error) throw error;
}
