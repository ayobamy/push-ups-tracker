import { requestPasswordReset } from "@/app/login/actions";
import { BrandMark } from "@/components/brand-mark";
import { ResendConfirmation } from "@/components/resend-confirmation";
import { StoicFooter } from "@/components/stoic-footer";
import { NOINDEX } from "@/lib/seo/site";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Check your email", ...NOINDEX };

const STATUS: Record<string, string> = {
  resent: "Sent again. Check inbox and spam.",
  "reset-sent": "Reset link sent. Check inbox and spam.",
  "rate-limited":
    "Too many mails just now. Wait a minute, then try again. Check spam too.",
  "send-failed": "Could not send. Wait a minute and try again.",
  already:
    "This email already has an account. Confirmation mail will not send again. Log in, or reset the password.",
};

export default async function SentPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; status?: string }>;
}) {
  const { email, status } = await searchParams;
  const already = status === "already";
  const notice = status ? STATUS[status] : undefined;
  const resetHref = email
    ? `/login/forgot?email=${encodeURIComponent(email)}`
    : "/login/forgot";

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col px-6 pt-16 pb-6">
      <div className="flex flex-1 flex-col justify-center gap-8">
        <div>
          <BrandMark />
          <h1 className="font-display mt-6 text-4xl font-semibold tracking-tight">
            {already ? "Account already exists" : "Confirm your email"}
          </h1>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
            {status === "rate-limited"
              ? "The mail did not go out yet. Wait a minute, then try again."
              : already
                ? email
                  ? `${email} is already signed up. Log in with your password.`
                  : "That email is already signed up. Log in with your password."
                : status === "reset-sent"
                  ? email
                    ? `We sent a reset link to ${email}. Open it, then pick a new password.`
                    : "We sent a reset link. Open it, then pick a new password."
                  : email
                    ? `We sent a confirmation link to ${email}. Open it, then log in.`
                    : "We sent a confirmation link. Open it, then log in."}
          </p>
          {status === "rate-limited" || already ? null : (
            <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
              Check spam if it is not there. Give it a minute, then resend.
            </p>
          )}
        </div>
        {notice ? (
          <p className="text-sm text-zinc-800 dark:text-zinc-200" role="status">
            {notice}
          </p>
        ) : null}
        {already && email ? (
          <form action={requestPasswordReset}>
            <input type="hidden" name="email" value={email} />
            <button
              type="submit"
              className="h-12 min-h-11 w-full rounded-lg bg-zinc-900 px-4 text-base font-medium text-white dark:bg-amber-500 dark:text-zinc-950"
            >
              Reset password
            </button>
          </form>
        ) : status === "reset-sent" && email ? (
          <form action={requestPasswordReset}>
            <input type="hidden" name="email" value={email} />
            <button
              type="submit"
              className="h-12 min-h-11 w-full rounded-lg bg-zinc-900 px-4 text-base font-medium text-white dark:bg-amber-500 dark:text-zinc-950"
            >
              Send reset link again
            </button>
          </form>
        ) : email ? (
          <ResendConfirmation
            email={email}
            startCooldown={status === "resent" || status === "reset-sent"}
          />
        ) : (
          <Link
            href="/signup"
            className="h-12 min-h-11 inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 text-base font-medium text-white dark:bg-amber-500 dark:text-zinc-950"
          >
            Back to sign up
          </Link>
        )}
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {already ? (
            <>
              <Link href="/login" className="underline underline-offset-4">
                Log in
              </Link>
              {" · "}
              <Link href={resetHref} className="underline underline-offset-4">
                Reset password
              </Link>
            </>
          ) : (
            <>
              Already confirmed?{" "}
              <Link href="/login" className="underline underline-offset-4">
                Log in
              </Link>
              .
            </>
          )}
        </p>
      </div>
      <StoicFooter path="/login/sent" />
    </main>
  );
}
