import {
  AUTH_CONFIRM_PATH,
  authConfirmUrl,
  authRedirectTo,
  parseSiteOrigin,
} from "@/lib/auth/site-url";
import { describe, expect, it } from "vitest";

describe("parseSiteOrigin", () => {
  it("keeps a bare origin", () => {
    expect(parseSiteOrigin("http://localhost:3000")).toBe(
      "http://localhost:3000",
    );
    expect(parseSiteOrigin("https://hundred.example")).toBe(
      "https://hundred.example",
    );
  });

  it("strips a path if someone pastes the confirm URL", () => {
    expect(
      parseSiteOrigin("https://hundred.example/auth/confirm?next=/app"),
    ).toBe("https://hundred.example");
  });

  it("rejects empty or junk", () => {
    expect(parseSiteOrigin("")).toBeNull();
    expect(parseSiteOrigin("  ")).toBeNull();
    expect(parseSiteOrigin("localhost:3000")).toBeNull();
  });
});

describe("authConfirmUrl", () => {
  it("appends /auth/confirm to the origin", () => {
    expect(authConfirmUrl("http://localhost:3000")).toBe(
      "http://localhost:3000/auth/confirm",
    );
    expect(AUTH_CONFIRM_PATH).toBe("/auth/confirm");
  });

  it("puts reset next on the query string", () => {
    const url = new URL(
      authConfirmUrl("https://hundred.example", "/update-password"),
    );
    expect(url.pathname).toBe("/auth/confirm");
    expect(url.searchParams.get("next")).toBe("/update-password");
  });
});

describe("authRedirectTo", () => {
  it("returns undefined when the env is missing", () => {
    expect(authRedirectTo(undefined)).toBeUndefined();
  });

  it("builds the confirm URL from the base env value", () => {
    expect(authRedirectTo("http://localhost:3000")).toBe(
      "http://localhost:3000/auth/confirm",
    );
  });
});
