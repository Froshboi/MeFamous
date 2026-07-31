import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCronRequest } from "@/lib/cron/verify";
import { createAdminClient } from "@/lib/supabase/server";
import { syncActiveProviderCatalog } from "@/lib/providers/sync";

export const dynamic = "force-dynamic";

/**
 * Scheduled by .github/workflows/cron.yml, which hits this on schedule; we
 * check the `provider_auto_sync_enabled` app_settings flag ourselves so the
 * admin toggle can turn syncing on/off without redeploying the cron
 * config. Syncs whichever provider is currently active — not hardcoded
 * to any one provider.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: setting } = await admin
    .from("app_settings")
    .select("value")
    .eq("key", "provider_auto_sync_enabled")
    .single();

  if (setting?.value !== true) {
    return NextResponse.json({ skipped: true, reason: "auto-sync disabled" });
  }

  try {
    const result = await syncActiveProviderCatalog();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 502 }
    );
  }
}
