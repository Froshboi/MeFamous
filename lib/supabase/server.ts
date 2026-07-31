import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Server-side Supabase client for use inside Server Components,
 * Route Handlers, and Server Actions. Reads/writes the auth cookie
 * via Next's cookies() API so sessions stay in sync across requests.
 *
 * Uses the getAll/setAll cookie contract (the current @supabase/ssr
 * API) rather than the older per-cookie get/set/remove methods.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component — proxy.ts will refresh
            // the session cookie on the next request. Safe to ignore.
          }
        },
      },
    }
  );
}

/**
 * Admin client using the service role key. Bypasses RLS entirely —
 * only ever import this inside trusted server code (webhook handlers,
 * admin-only API routes, Server Actions). Never import into client
 * components, and never call it from code that also runs in the browser.
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set — admin client unavailable.");
  }

  return createSupabaseJsClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
