import { describe, expect, it } from "vitest";
import {
  parseCredentials,
  parseEmail,
  parsePassword,
} from "@/lib/auth/credentials";

describe("parseCredentials", () => {
  it("accepts a normal signup pair", () => {
    expect(
      parseCredentials("Ahmed@Example.com ", "secret123", "secret123"),
    ).toEqual({
      ok: true,
      email: "ahmed@example.com",
      password: "secret123",
    });
  });

  it("rejects a short password", () => {
    expect(parseCredentials("a@b.co", "short", "short")).toEqual({
      ok: false,
      error: "short-password",
    });
  });

  it("rejects a mismatch on signup", () => {
    expect(parseCredentials("a@b.co", "secret123", "secret124")).toEqual({
      ok: false,
      error: "password-mismatch",
    });
  });
});

describe("parseEmail", () => {
  it("normalises a valid address", () => {
    expect(parseEmail("  Ahmed@Example.com ")).toEqual({
      ok: true,
      email: "ahmed@example.com",
    });
  });

  it("rejects a bare word", () => {
    expect(parseEmail("nope")).toEqual({
      ok: false,
      error: "invalid-email",
    });
  });
});

describe("parsePassword", () => {
  it("rejects a short password", () => {
    expect(parsePassword("short")).toEqual({
      ok: false,
      error: "short-password",
    });
  });
});
