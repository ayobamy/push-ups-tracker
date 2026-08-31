import {
  AUTH_COOKIE_MAX_AGE,
  attachAuthCookies,
  authCookieOptions,
  isAppGatePath,
  isLoggedOutOnlyPath,
  withAuthCookieOptions,
} from "@/lib/supabase/auth-cookie";
import { NextResponse } from "next/server";
import { describe, expect, it } from "vitest";

describe("auth cookies", () => {
  it("persists 400 days, HttpOnly, Lax, Secure only in production", () => {
    const options = authCookieOptions();
    expect(options.maxAge).toBe(AUTH_COOKIE_MAX_AGE);
    expect(options.maxAge).toBe(400 * 24 * 60 * 60);
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
    expect(options.secure).toBe(process.env.NODE_ENV === "production");
  });

  it("keeps maxAge 0 so sign-out can delete the cookie", () => {
    expect(withAuthCookieOptions({ maxAge: 0 }).maxAge).toBe(0);
    expect(withAuthCookieOptions({ maxAge: 60 }).maxAge).toBe(
      AUTH_COOKIE_MAX_AGE,
    );
    expect(withAuthCookieOptions().httpOnly).toBe(true);
  });

  it("copies cookies onto a redirect so a refresh is not dropped", () => {
    const source = NextResponse.next();
    source.cookies.set("sb-auth", "refreshed");
    const target = NextResponse.redirect("http://localhost:3000/login");
    attachAuthCookies(source, target);
    expect(target.cookies.get("sb-auth")?.value).toBe("refreshed");
  });

  it("gates /app and password reset, and skips login when already in", () => {
    expect(isAppGatePath("/app")).toBe(true);
    expect(isAppGatePath("/app/purse")).toBe(true);
    expect(isAppGatePath("/update-password")).toBe(true);
    expect(isAppGatePath("/login")).toBe(false);
    expect(isLoggedOutOnlyPath("/login")).toBe(true);
    expect(isLoggedOutOnlyPath("/login/forgot")).toBe(true);
    expect(isLoggedOutOnlyPath("/signup")).toBe(true);
    expect(isLoggedOutOnlyPath("/app")).toBe(false);
  });
});
