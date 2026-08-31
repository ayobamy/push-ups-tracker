export type AuthCallback =
  | { kind: "pkce"; code: string; next: string }
  | { kind: "otp"; tokenHash: string; type: string; next: string }
  | { kind: "invalid" };

export function parseAuthCallback(url: URL): AuthCallback {
  const next = url.searchParams.get("next") ?? "/app";
  const code = url.searchParams.get("code");
  if (code) {
    return { kind: "pkce", code, next };
  }
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  if (tokenHash && type) {
    return { kind: "otp", tokenHash, type, next };
  }
  return { kind: "invalid" };
}
