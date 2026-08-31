import { requestPasswordReset } from "@/app/login/actions";
import { BrandMark } from "@/components/brand-mark";
import { StoicFooter } from "@/components/stoic-footer";
import { NOINDEX } from "@/lib/seo/site";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Reset password", ...NOINDEX };

const ERRORS: Record<string, string> = {
  "invalid-email": "Enter a real email address.",
  "not-configured":
    "Supabase keys are missing. Copy .env.example to .env.local.",
};

const fieldClass =
  "h-12 rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

export default async function ForgotPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string }>;
}) {
  const { error, email } = await searchParams;
  const message = error ? ERRORS[error] : undefined;

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col px-6 pt-16 pb-6">
      <div className="flex flex-1 flex-col justify-center gap-8">
        <div>
          <BrandMark />
          <h1 className="font-display mt-6 text-4xl font-semibold tracking-tight">
            Reset password
          </h1>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
            We will email a reset link. Then pick a new password.
          </p>
        </div>
        <form action={requestPasswordReset} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Email
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              defaultValue={email ?? ""}
              className={fieldClass}
            />
          </label>
          {message ? (
            <p className="text-sm text-red-700 dark:text-red-400" role="alert">
              {message}
            </p>
          ) : null}
          <button
            type="submit"
            className="h-12 min-h-11 rounded-lg bg-zinc-900 px-4 text-base font-medium text-white dark:bg-amber-500 dark:text-zinc-950"
          >
            Send reset link
          </button>
        </form>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/login" className="underline underline-offset-4">
            Back to log in
          </Link>
        </p>
      </div>
      <StoicFooter path="/login/forgot" />
    </main>
  );
}
