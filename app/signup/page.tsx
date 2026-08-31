import { signUp } from "@/app/login/actions";
import { StoicFooter } from "@/components/stoic-footer";
import { PasswordField } from "@/components/password-field";
import Link from "next/link";

const ERRORS: Record<string, string> = {
  "invalid-email": "Enter a real email address.",
  "short-password": "Password must be at least 8 characters.",
  "password-mismatch": "Those passwords do not match.",
  "not-configured":
    "Supabase keys are missing. Copy .env.example to .env.local.",
  "sign-up-failed": "Could not create the account. Try again.",
};

const fieldClass =
  "h-12 rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = error ? ERRORS[error] : undefined;

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col px-6 py-16">
      <div className="flex flex-1 flex-col justify-center gap-8">
        <div>
          <p className="font-display text-sm uppercase tracking-[0.2em] text-amber-700">
            100 a day
          </p>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
            Email and a password, at least 8 characters. Already in?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Log in
            </Link>
            .
          </p>
        </div>
        <form action={signUp} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Email
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className={fieldClass}
            />
          </label>
          <PasswordField
            name="password"
            label="Password"
            autoComplete="new-password"
          />
          <PasswordField
            name="confirm"
            label="Confirm password"
            autoComplete="new-password"
            fieldName="confirm password"
          />
          {message ? (
            <p className="text-sm text-red-700 dark:text-red-400" role="alert">
              {message}
            </p>
          ) : null}
          <button
            type="submit"
            className="h-12 min-h-11 rounded-lg bg-zinc-900 px-4 text-base font-medium text-white dark:bg-amber-500 dark:text-zinc-950"
          >
            Create account
          </button>
        </form>
      </div>
      <StoicFooter path="/signup" />
    </main>
  );
}
