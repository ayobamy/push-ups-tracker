import { AUTH_CONFIRM_PATH } from "@/lib/auth/site-url";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Auth mail redirects use NEXT_PUBLIC_SITE_URL as origin only.
 * /auth/confirm is appended in code. Pass threshold: every case.
 */
describe("eval: auth site origin", () => {
  it("env example documents the public origin, not the confirm path", () => {
    const example = readFileSync(".env.example", "utf8");
    expect(example).toMatch(/^NEXT_PUBLIC_SITE_URL=http:\/\/localhost:3000$/m);
    expect(example).not.toMatch(/SITE_URL=.*auth\/confirm/);
    expect(example).toMatch(/No path/);
  });

  it("signup and reset append confirm in code from that env key", () => {
    const actions = readFileSync("app/login/actions.ts", "utf8");
    expect(actions).toContain("authRedirectTo");
    expect(actions).toContain("NEXT_PUBLIC_SITE_URL");
    expect(actions).not.toContain("x-forwarded-host");
    expect(AUTH_CONFIRM_PATH).toBe("/auth/confirm");
  });
});
