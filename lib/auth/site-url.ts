export const AUTH_CONFIRM_PATH = "/auth/confirm";

export function parseSiteOrigin(raw: string | undefined | null): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return null;
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

export function authConfirmUrl(origin: string, next?: string): string {
  const url = new URL(AUTH_CONFIRM_PATH, `${origin}/`);
  if (next) {
    url.searchParams.set("next", next);
  }
  return url.toString();
}

export function authRedirectTo(
  rawOrigin: string | undefined | null,
  next?: string,
): string | undefined {
  const origin = parseSiteOrigin(rawOrigin);
  if (!origin) {
    return undefined;
  }
  return authConfirmUrl(origin, next);
}
