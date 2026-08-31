import { OnboardingForm } from "@/app/app/onboarding-form";
import { setRemindersOptIn, signOut } from "@/app/app/actions";
import { DeleteAccountControl } from "@/components/delete-account-control";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const ERRORS: Record<string, string> = {
  "invalid-profile": "Name 2–32 characters, and a real timezone.",
  "name-taken": "That name is taken. Pick another.",
  "join-failed": "Could not join the challenge. Try again.",
  "delete-confirm": "Type DELETE to confirm.",
  "delete-failed": "Could not delete the account. Try again.",
  "schema-missing":
    "Database tables are missing. Apply the latest supabase/migrations in the SQL editor, then refresh.",
};

const PROFILE_ERRORS = new Set([
  "invalid-profile",
  "name-taken",
  "join-failed",
]);

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, timezone, reminders_opt_in")
    .eq("id", auth.user.id)
    .single();

  return (
    <main className="flex flex-col gap-8 px-6 py-10">
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        Settings
      </h1>
      <p className="text-sm text-zinc-500">
        Past days stay on the timezone they were logged in.
      </p>
      <p className="text-sm text-zinc-500">
        Add to home screen. iPhone: Share, then Add to Home Screen. Android:
        browser menu, Install app.
      </p>
      <OnboardingForm
        error={error && PROFILE_ERRORS.has(error) ? ERRORS[error] : undefined}
        submitLabel="Save"
        defaultName={profile?.display_name ?? ""}
        defaultTimezone={profile?.timezone ?? "UTC"}
        from="/app/settings"
      />
      <ThemeToggle variant="row" />
      <form action={setRemindersOptIn} className="flex flex-col gap-3">
        <label className="flex items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            name="reminders_opt_in"
            defaultChecked={profile?.reminders_opt_in !== false}
            className="h-5 w-5"
          />
          Evening reminder mail if I am still short at 20:00
        </label>
        <button
          type="submit"
          className="h-12 min-h-11 rounded-lg border border-zinc-300 px-4 text-base dark:border-zinc-700"
        >
          Save reminder setting
        </button>
      </form>
      <a
        href="/app/export"
        className="flex h-12 min-h-11 items-center justify-center rounded-lg border border-zinc-300 px-4 text-base dark:border-zinc-700"
      >
        Export my data
      </a>
      <form action={signOut}>
        <button
          type="submit"
          className="h-12 min-h-11 w-full rounded-lg border border-zinc-300 px-4 text-base dark:border-zinc-700"
        >
          Sign out
        </button>
      </form>
      {error === "delete-confirm" ||
      error === "delete-failed" ||
      error === "schema-missing" ? (
        <p className="text-sm text-red-700 dark:text-red-400" role="alert">
          {ERRORS[error]}
        </p>
      ) : null}
      <DeleteAccountControl />
    </main>
  );
}
