import { createServerClient } from "@supabase/ssr";
import {
  attachAuthCookies,
  authCookieOptions,
  isAppGatePath,
  isLoggedOutOnlyPath,
  withAuthCookieOptions,
} from "@/lib/supabase/auth-cookie";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookieOptions: authCookieOptions(),
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(
            name,
            value,
            withAuthCookieOptions(options),
          );
        });
        Object.entries(headers).forEach(([headerKey, headerValue]) => {
          supabaseResponse.headers.set(headerKey, headerValue);
        });
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const path = request.nextUrl.pathname;
  const authed = Boolean(claims);

  if (!authed && isAppGatePath(path)) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    if (path.startsWith("/update-password")) {
      login.searchParams.set("error", "confirm-failed");
    }
    const redirect = NextResponse.redirect(login);
    return attachAuthCookies(supabaseResponse, redirect);
  }

  if (authed && isLoggedOutOnlyPath(path)) {
    const app = request.nextUrl.clone();
    app.pathname = "/app";
    app.search = "";
    const redirect = NextResponse.redirect(app);
    return attachAuthCookies(supabaseResponse, redirect);
  }

  return supabaseResponse;
}
