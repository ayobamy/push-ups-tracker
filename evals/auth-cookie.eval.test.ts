import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Session lives in first-party cookies, not localStorage.
 * Pass threshold: every case.
 */
describe("eval: persistent auth cookies", () => {
  it("does not store auth tokens in localStorage", () => {
    const client = readFileSync("lib/supabase/client.ts", "utf8");
    const server = readFileSync("lib/supabase/server.ts", "utf8");
    const proxy = readFileSync("lib/supabase/proxy.ts", "utf8");
    expect(client).not.toContain("localStorage");
    expect(server).not.toContain("localStorage");
    expect(proxy).not.toContain("localStorage");
    expect(client).toContain("persistSession: true");
    expect(server).toContain("authCookieOptions");
    expect(proxy).toContain("attachAuthCookies");
    expect(proxy).toContain("withAuthCookieOptions");
  });

  it("uses HttpOnly cookies with a 400-day max age", () => {
    const src = readFileSync("lib/supabase/auth-cookie.ts", "utf8");
    expect(src).toContain("httpOnly: true");
    expect(src).toContain("400 * 24 * 60 * 60");
    expect(src).toContain('sameSite: "lax"');
  });
});
