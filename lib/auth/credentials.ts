export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

export type CredentialError =
  "invalid-email" | "short-password" | "password-mismatch";

export type ParsedCredentials =
  | { ok: true; email: string; password: string }
  | { ok: false; error: CredentialError };

export function parseEmail(
  emailRaw: string,
): { ok: true; email: string } | { ok: false; error: "invalid-email" } {
  const email = emailRaw.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "invalid-email" };
  }
  return { ok: true, email };
}

export function parsePassword(
  passwordRaw: string,
  confirmRaw?: string,
):
  | { ok: true; password: string }
  | { ok: false; error: Exclude<CredentialError, "invalid-email"> } {
  if (passwordRaw.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: "short-password" };
  }
  if (confirmRaw !== undefined && confirmRaw !== passwordRaw) {
    return { ok: false, error: "password-mismatch" };
  }
  return { ok: true, password: passwordRaw };
}

export function parseCredentials(
  emailRaw: string,
  passwordRaw: string,
  confirmRaw?: string,
): ParsedCredentials {
  const parsedEmail = parseEmail(emailRaw);
  if (!parsedEmail.ok) {
    return parsedEmail;
  }
  const parsedPassword = parsePassword(passwordRaw, confirmRaw);
  if (!parsedPassword.ok) {
    return parsedPassword;
  }
  return {
    ok: true,
    email: parsedEmail.email,
    password: parsedPassword.password,
  };
}
