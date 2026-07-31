import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/account"];
const ADMIN_ONLY_PREFIXES = ["/admin"];
const RESELLER_ONLY_PREFIXES = ["/dashboard/reseller"];

/**
 * Next.js 16 renamed the middleware.ts convention to proxy.ts (the exported
 * function must be named `proxy`, not `middleware`). Functionally this still
 * runs on every matched request before rendering, so it's where we keep the
 * Supabase session cookie in sync and gate protected routes by role.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));
  const isAdminOnly = ADMIN_ONLY_PREFIXES.some((p) => path.startsWith(p));
  const isResellerOnly = RESELLER_ONLY_PREFIXES.some((p) => path.startsWith(p));

  if (isProtected && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", path);
    return NextResponse.redirect(redirectUrl);
  }

  // Only hit the DB for role-gated paths — every other protected route
  // just needs "is there a user", which the check above already covers.
  if (user && (isAdminOnly || isResellerOnly)) {
    // role lives in the `profiles` table, NOT user.app_metadata — nothing
    // in this codebase ever sets app_metadata.role, so reading it here
    // would always silently fall back to "customer" and lock real
    // admins/resellers out of their own routes.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = (profile?.role as string | undefined) ?? "customer";

    if (isAdminOnly && role !== "admin" && role !== "super_admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (isResellerOnly && role !== "reseller" && role !== "admin" && role !== "super_admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};
