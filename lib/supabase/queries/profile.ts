import { createClient } from "@/lib/supabase/server";
import type { AppUser, UserRole } from "@/types/index";

/**
 * Fetches the signed-in user plus their `profiles` row. Returns null when
 * there's no session — callers in protected routes should treat that as
 * "not authenticated" (proxy.ts already redirects unauthenticated visits,
 * this is the defense-in-depth check inside the page itself).
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, avatar_url, created_at")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Profile row hasn't been created yet (trigger delay or edge case) —
    // fall back to auth metadata so the UI still has a name/role to render.
    return {
      id: user.id,
      email: user.email ?? "",
      fullName: (user.user_metadata?.full_name as string | undefined) ?? null,
      role: ((user.app_metadata?.role as UserRole | undefined) ?? "customer"),
      avatarUrl: null,
      createdAt: user.created_at,
    };
  }

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role as UserRole,
    avatarUrl: profile.avatar_url,
    createdAt: profile.created_at,
  };
}
