import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Browser-side Supabase client. Uses only the public anon key —
 * safe to import in client components. RLS policies enforce access
 * control at the database layer, so this client never bypasses them.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
