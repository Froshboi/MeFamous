import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveProvider } from "@/lib/providers/registry";
import { ProviderApiError } from "@/lib/providers/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/provider/health — admin-only. Confirms MeFamous can currently
 * reach whichever SMM provider is active, without exposing which one (or
 * any credentials) to non-admins.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && profile?.role !== "super_admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const startedAt = Date.now();
  try {
    const provider = await getActiveProvider();
    await provider.getBalance();
    return NextResponse.json({ status: "ok", provider: provider.key, latencyMs: Date.now() - startedAt });
  } catch (err) {
    const message = err instanceof ProviderApiError ? err.message : "Unknown error";
    return NextResponse.json(
      { status: "down", latencyMs: Date.now() - startedAt, error: message },
      { status: 502 }
    );
  }
}
