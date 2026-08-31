export type SignupNext = "app" | "confirm" | "already-registered";

export function classifySignupResult(data: {
  session: unknown | null;
  user: { identities?: unknown[] | null } | null;
}): SignupNext {
  if (data.session) {
    return "app";
  }
  const identities = data.user?.identities;
  if (identities && identities.length === 0) {
    return "already-registered";
  }
  return "confirm";
}

export type MailStatus = "resent" | "rate-limited" | "send-failed";

export function classifyResendError(message: string): MailStatus {
  if (/rate limit|too many|429|after \d+ seconds/i.test(message)) {
    return "rate-limited";
  }
  return "send-failed";
}

export type SignInError = "invalid-credentials" | "email-not-confirmed";

export function classifySignInError(message: string): SignInError {
  if (/not confirmed/i.test(message)) {
    return "email-not-confirmed";
  }
  return "invalid-credentials";
}
