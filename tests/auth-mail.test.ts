import { describe, expect, it } from "vitest";
import {
  classifyResendError,
  classifySignInError,
  classifySignupResult,
} from "@/lib/auth/mail";

describe("classifySignupResult", () => {
  it("sends a session to the app", () => {
    expect(
      classifySignupResult({
        session: { access_token: "t" },
        user: { identities: [{ id: "1" }] },
      }),
    ).toBe("app");
  });

  it("asks for confirm when there is no session", () => {
    expect(
      classifySignupResult({
        session: null,
        user: { identities: [{ id: "1" }] },
      }),
    ).toBe("confirm");
  });

  it("treats an empty identities list as already registered", () => {
    expect(
      classifySignupResult({
        session: null,
        user: { identities: [] },
      }),
    ).toBe("already-registered");
  });

  it("asks for confirm when identities are missing", () => {
    expect(
      classifySignupResult({
        session: null,
        user: { identities: undefined },
      }),
    ).toBe("confirm");
  });
});

describe("classifyResendError", () => {
  it("maps rate-limit wording", () => {
    expect(classifyResendError("email rate limit exceeded")).toBe(
      "rate-limited",
    );
    expect(
      classifyResendError(
        "For security purposes, you can only request this after 60 seconds.",
      ),
    ).toBe("rate-limited");
  });

  it("maps other errors to send-failed", () => {
    expect(classifyResendError("smtp timeout")).toBe("send-failed");
  });
});

describe("classifySignInError", () => {
  it("splits unconfirmed from a wrong password", () => {
    expect(classifySignInError("Email not confirmed")).toBe(
      "email-not-confirmed",
    );
    expect(classifySignInError("Invalid login credentials")).toBe(
      "invalid-credentials",
    );
  });
});
