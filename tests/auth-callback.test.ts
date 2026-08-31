import { describe, expect, it } from "vitest";
import { parseAuthCallback } from "@/lib/auth/callback";

describe("parseAuthCallback", () => {
  it("reads PKCE code from the default Supabase redirect", () => {
    const url = new URL("http://localhost:3000/auth/confirm?code=abc123");
    expect(parseAuthCallback(url)).toEqual({
      kind: "pkce",
      code: "abc123",
      next: "/app",
    });
  });

  it("reads token_hash OTP links", () => {
    const url = new URL(
      "http://localhost:3000/auth/confirm?token_hash=h&type=email&next=/app",
    );
    expect(parseAuthCallback(url)).toEqual({
      kind: "otp",
      tokenHash: "h",
      type: "email",
      next: "/app",
    });
  });

  it("rejects a bare confirm URL", () => {
    const url = new URL("http://localhost:3000/auth/confirm");
    expect(parseAuthCallback(url)).toEqual({ kind: "invalid" });
  });
});
