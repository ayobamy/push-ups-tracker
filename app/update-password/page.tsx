import { updatePassword } from "@/app/login/actions";
import { StoicFooter } from "@/components/stoic-footer";
import { PasswordField } from "@/components/password-field";
import Link from "next/link";

const ERRORS: Record<string, string> = {
  "short-password": "Password must be at least 8 characters.",
  "password-mismatch": "Those passwords do not match.",
  "update-failed": "Could not save the new password. Request a new link.",
};

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = error ? ERRORS[error] : undefined;

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col px-6 pt-16 pb-6">
      <div className="flex flex-1 flex-col justify-center gap-8">
        <div>
          <p className="font-display text-sm uppercase tracking-[0.2em] text-amber-700">
            100 a day
          </p>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight">
            New password
          </h1>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
            Pick a password, at least 8 characters.
          </p>
        </div>
        <form action={updatePassword} className="flex flex-col gap-4">
          <PasswordField
            name="password"
            label="New password"
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
            Save password
          </button>
        </form>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/login" className="underline underline-offset-4">
            Back to log in
          </Link>
        </p>
      </div>
      <StoicFooter path="/update-password" />
    </main>
  );
}
