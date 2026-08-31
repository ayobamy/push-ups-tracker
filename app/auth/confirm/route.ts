import { parseAuthCallback } from "@/lib/auth/callback";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const parsed = parseAuthCallback(requestUrl);
  const origin = requestOrigin(request, requestUrl.origin);

  if (parsed.kind === "invalid") {
    return NextResponse.redirect(
      new URL("/login?error=confirm-failed", origin),
    );
  }

  const supabase = await createClient();
  const error =
    parsed.kind === "pkce"
      ? (await supabase.auth.exchangeCodeForSession(parsed.code)).error
      : (
          await supabase.auth.verifyOtp({
            type: parsed.type as EmailOtpType,
            token_hash: parsed.tokenHash,
          })
        ).error;

  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=confirm-failed", origin),
    );
  }

  return NextResponse.redirect(new URL(parsed.next, origin));
}

function requestOrigin(request: Request, fallback: string): string {
  const host = request.headers.get("x-forwarded-host");
  if (host && process.env.NODE_ENV !== "development") {
    return `https://${host}`;
  }
  return fallback;
}
