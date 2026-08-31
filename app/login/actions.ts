"use server";

import {
  parseCredentials,
  parseEmail,
  parsePassword,
} from "@/lib/auth/credentials";
import {
  classifyResendError,
  classifySignInError,
  classifySignupResult,
} from "@/lib/auth/mail";
import { authRedirectTo } from "@/lib/auth/site-url";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function requireConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    redirect("/login?error=not-configured");
  }
}

function siteRedirect(next?: string): string | undefined {
  return authRedirectTo(process.env.NEXT_PUBLIC_SITE_URL, next);
}

export async function signUp(formData: FormData) {
  requireConfig();
  const parsed = parseCredentials(
    String(formData.get("email") ?? ""),
    String(formData.get("password") ?? ""),
    String(formData.get("confirm") ?? ""),
  );
  if (!parsed.ok) {
    redirect(`/signup?error=${parsed.error}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.email,
    password: parsed.password,
    options: {
      emailRedirectTo: siteRedirect(),
    },
  });

  const sent = `/login/sent?email=${encodeURIComponent(parsed.email)}`;

  if (error) {
    if (/already/i.test(error.message)) {
      redirect(`${sent}&status=already`);
    }
    if (classifyResendError(error.message) === "rate-limited") {
      redirect(`${sent}&status=rate-limited`);
    }
    redirect("/signup?error=sign-up-failed");
  }

  const next = classifySignupResult(data);
  if (next === "app") {
    redirect("/app");
  }
  if (next === "already-registered") {
    redirect(`${sent}&status=already`);
  }
  redirect(sent);
}

export async function resendConfirmation(formData: FormData) {
  requireConfig();
  const parsed = parseEmail(String(formData.get("email") ?? ""));
  if (!parsed.ok) {
    redirect("/signup?error=invalid-email");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.email,
    options: {
      emailRedirectTo: siteRedirect(),
    },
  });

  const sent = `/login/sent?email=${encodeURIComponent(parsed.email)}`;
  if (error) {
    redirect(`${sent}&status=${classifyResendError(error.message)}`);
  }
  redirect(`${sent}&status=resent`);
}

export async function signIn(formData: FormData) {
  requireConfig();
  const parsed = parseCredentials(
    String(formData.get("email") ?? ""),
    String(formData.get("password") ?? ""),
  );
  if (!parsed.ok) {
    redirect(`/login?error=${parsed.error}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.email,
    password: parsed.password,
  });

  if (error) {
    redirect(`/login?error=${classifySignInError(error.message)}`);
  }

  redirect("/app");
}

export async function requestPasswordReset(formData: FormData) {
  requireConfig();
  const parsed = parseEmail(String(formData.get("email") ?? ""));
  if (!parsed.ok) {
    redirect("/login/forgot?error=invalid-email");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.email, {
    redirectTo: siteRedirect("/update-password"),
  });

  const sent = `/login/sent?email=${encodeURIComponent(parsed.email)}`;
  if (error) {
    redirect(`${sent}&status=${classifyResendError(error.message)}`);
  }
  redirect(`${sent}&status=reset-sent`);
}

export async function updatePassword(formData: FormData) {
  requireConfig();
  const parsed = parsePassword(
    String(formData.get("password") ?? ""),
    String(formData.get("confirm") ?? ""),
  );
  if (!parsed.ok) {
    redirect(`/update-password?error=${parsed.error}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.password,
  });
  if (error) {
    redirect("/update-password?error=update-failed");
  }
  redirect("/app");
}
