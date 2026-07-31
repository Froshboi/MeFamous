"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getActiveProvider, listProviders, setActiveProvider } from "@/lib/providers/registry";
import { syncActiveProviderCatalog } from "@/lib/providers/sync";
import { ProviderApiError } from "@/lib/providers/types";

export type ProviderActionState = {
  error?: string;
  success?: boolean;
  message?: string;
};

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;
  if (role !== "admin" && role !== "super_admin") {
    throw new Error("Admin access required");
  }
}

function describeError(err: unknown): string {
  if (err instanceof ProviderApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred";
}

/** Admin panel "Test connectivity" button — tests whichever provider is currently active. */
export async function testProviderConnectivityAction(): Promise<ProviderActionState> {
  try {
    await requireAdmin();
    const provider = await getActiveProvider();
    const start = Date.now();
    const balance = await provider.getBalance();
    return {
      success: true,
      message: `Connected to ${provider.displayName} — ${Date.now() - start}ms round trip. Balance: $${balance.balance} ${balance.currency}.`,
    };
  } catch (err) {
    return { error: describeError(err) };
  }
}

/** Admin panel "View provider balance" widget. */
export async function getProviderBalanceAction(): Promise<
  ProviderActionState & { balance?: number; currency?: string }
> {
  try {
    await requireAdmin();
    const provider = await getActiveProvider();
    const balance = await provider.getBalance();
    return { success: true, balance: balance.balance, currency: balance.currency };
  } catch (err) {
    return { error: describeError(err) };
  }
}

/**
 * Pulls the full catalog from whichever provider is active and upserts it
 * into `services` — see lib/providers/sync.ts for the exact merge
 * behaviour (admin-set markup/active flags are preserved).
 */
export async function syncProviderServicesAction(): Promise<
  ProviderActionState & { synced?: number; deactivated?: number }
> {
  try {
    await requireAdmin();
    const result = await syncActiveProviderCatalog();

    revalidatePath("/admin/provider");
    revalidatePath("/dashboard/services");

    return { success: true, ...result };
  } catch (err) {
    return { error: describeError(err) };
  }
}

export async function setProviderAutoSyncAction(enabled: boolean): Promise<ProviderActionState> {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const { error } = await admin
      .from("app_settings")
      .upsert({ key: "provider_auto_sync_enabled", value: enabled });

    if (error) throw error;

    revalidatePath("/admin/provider");
    return { success: true, message: enabled ? "Auto-sync enabled." : "Auto-sync disabled." };
  } catch (err) {
    return { error: describeError(err) };
  }
}

/**
 * Switches which provider new orders/syncs use. Existing services keep
 * whichever provider they were originally synced from until re-synced —
 * switching here doesn't retroactively reassign anything, so in-flight
 * orders always resolve against the provider that actually took them.
 */
export async function setActiveProviderAction(providerKey: string): Promise<ProviderActionState> {
  try {
    await requireAdmin();
    await setActiveProvider(providerKey);
    revalidatePath("/admin/provider");
    return { success: true, message: `Active provider set to ${providerKey}.` };
  } catch (err) {
    return { error: describeError(err) };
  }
}

export async function listAvailableProvidersAction(): Promise<
  { key: string; displayName: string }[]
> {
  await requireAdmin();
  return listProviders().map((p) => ({ key: p.key, displayName: p.displayName }));
}
