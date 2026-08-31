import type { CookieOptions } from "@supabase/ssr";
import type { NextResponse } from "next/server";

/** Chrome persistent-cookie cap. Same default as @supabase/ssr. */
export const AUTH_COOKIE_MAX_AGE = 400 * 24 * 60 * 60;

export function authCookieOptions(): CookieOptions {
  return {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: AUTH_COOKIE_MAX_AGE,
  };
}

export function withAuthCookieOptions(
  options: CookieOptions = {},
): CookieOptions {
  const deleting = options.maxAge === 0;
  return {
    ...options,
    path: options.path ?? "/",
    sameSite: options.sameSite ?? "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: deleting ? 0 : AUTH_COOKIE_MAX_AGE,
  };
}

export function isAppGatePath(pathname: string): boolean {
  return pathname.startsWith("/app") || pathname.startsWith("/update-password");
}

export function isLoggedOutOnlyPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/login/")
  );
}

export function attachAuthCookies(
  source: NextResponse,
  target: NextResponse,
): NextResponse {
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie);
  }
  return target;
}
