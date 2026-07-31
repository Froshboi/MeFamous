import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/account"];
const ADMIN_ONLY_PREFIXES = ["/admin"];
const RESELLER_ONLY_PREFIXES = ["/dashboard/reseller"];

/**
 * Next.js 16 proxy convention.
 * Keeps Supabase session cookies synced and protects routes by role.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  /**
   * Redirect helper that preserves refreshed Supabase cookies.
   * Do not use NextResponse.redirect() directly after auth refresh.
   */
  const redirect = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url);

    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(
        cookie.name,
        cookie.value,
        cookie
      );
    });

    return redirectResponse;
  };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  const isProtected = PROTECTED_PREFIXES.some((p) =>
    path.startsWith(p)
  );

  const isAdminOnly = ADMIN_ONLY_PREFIXES.some((p) =>
    path.startsWith(p)
  );

  const isResellerOnly = RESELLER_ONLY_PREFIXES.some((p) =>
    path.startsWith(p)
  );

  if (isProtected && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", path);

    return redirect(redirectUrl);
  }

  if (user && (isAdminOnly || isResellerOnly)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = (profile?.role as string | undefined) ?? "customer";

    if (
      isAdminOnly &&
      role !== "admin" &&
      role !== "super_admin"
    ) {
      return redirect(new URL("/dashboard", request.url));
    }

    if (
      isResellerOnly &&
      role !== "reseller" &&
      role !== "admin" &&
      role !== "super_admin"
    ) {
      return redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
};
