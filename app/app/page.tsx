import { CheckIn, TodaySets } from "@/app/app/check-in";
import { OnboardingForm } from "@/app/app/onboarding-form";
import { localDateFromInstant } from "@/lib/challenge/day";
import { displayNameFromJoin } from "@/lib/challenge/profile";
import {
  eveningNudge,
  hitGoal,
  remainingToGoal,
  surplusOverGoal,
} from "@/lib/challenge/remaining";
import { challengeDayNumber, localHour } from "@/lib/challenge/schedule";
import { currentStreak } from "@/lib/challenge/streak";
import { earnedMilestones } from "@/lib/challenge/milestones";
import { challengeDayLine, todayStatus } from "@/lib/challenge/today-copy";
import { isMissingTable } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

const ERRORS: Record<string, string> = {
  "invalid-reps": "Enter a whole number between 1 and 1000.",
  "invalid-profile": "Name 2–32 characters, and a real timezone.",
  "name-taken": "That name is taken. Pick another.",
  "join-failed": "Could not join the challenge. Try again.",
  "log-failed": "Could not save that set. Try again.",
  "no-challenge": "Challenge is not seeded in this project.",
  "schema-missing":
    "Database tables are missing. Apply supabase/migrations/20260831000000_init.sql in the Supabase SQL editor, then refresh.",
};

export default async function AppHome({
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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, timezone")
    .eq("id", auth.user.id)
    .single();

  if (isMissingTable(profileError) || error === "schema-missing") {
    return (
      <main className="flex flex-col gap-6 px-6 py-10">
        <p className="font-display text-sm uppercase tracking-[0.2em] text-amber-700">
          100 a day
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Database is not set up
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400" role="alert">
          {ERRORS["schema-missing"]}
        </p>
      </main>
    );
  }

  if (!profile?.display_name) {
    return (
      <main className="flex flex-col gap-6 px-6 py-10">
        <p className="font-display text-sm uppercase tracking-[0.2em] text-amber-700">
          100 a day
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Your name and day
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400">
          Your day rolls at midnight in this timezone. Pick the place you
          actually sleep.
        </p>
        <OnboardingForm error={error ? ERRORS[error] : undefined} />
      </main>
    );
  }

  const { error: joinError } = await supabase.rpc("join_active_challenge");

  const { data: challenge } = await supabase
    .from("challenges")
    .select("id, title, daily_goal, starts_on, duration_days")
    .eq("slug", "hundred-2026")
    .single();

  if (!challenge) {
    return (
      <main className="px-6 py-10">
        <p role="alert">{ERRORS["no-challenge"]}</p>
      </main>
    );
  }

  const timeZone = profile.timezone ?? "UTC";
  const now = new Date();
  const today = localDateFromInstant(now, timeZone);
  const goal = challenge.daily_goal as number;
  const dayNumber = challengeDayNumber(challenge.starts_on as string, today);
  const duration = challenge.duration_days as number;

  const { data: sets } = await supabase
    .from("sets")
    .select("id, reps, logged_at")
    .eq("user_id", auth.user.id)
    .eq("challenge_id", challenge.id)
    .eq("local_date", today)
    .order("logged_at", { ascending: true });

  const todayReps = (sets ?? []).reduce(
    (sum, set) => sum + (set.reps as number),
    0,
  );
  const remaining = remainingToGoal(goal, todayReps);
  const surplus = surplusOverGoal(goal, todayReps);
  const hit = hitGoal(goal, todayReps);
  const nudge = eveningNudge(localHour(now, timeZone), goal, todayReps);

  const { data: hits } = await supabase
    .from("daily_totals")
    .select("local_date")
    .eq("user_id", auth.user.id)
    .eq("challenge_id", challenge.id)
    .eq("hit_goal", true);
  const streak = currentStreak(
    (hits ?? []).map((row) => row.local_date as string),
    today,
  );
  const daysHit = (hits ?? []).length;
  const chips = earnedMilestones(daysHit);

  const { data: members } = await supabase
    .from("challenge_members")
    .select("user_id, profiles(display_name)")
    .eq("challenge_id", challenge.id);

  const { data: totals } = await supabase
    .from("daily_totals")
    .select("user_id, total_reps, hit_goal")
    .eq("challenge_id", challenge.id)
    .eq("local_date", today);

  const totalByUser = new Map(
    (totals ?? []).map((row) => [
      row.user_id as string,
      {
        total: row.total_reps as number,
        hit: row.hit_goal as boolean,
      },
    ]),
  );

  const board = (members ?? [])
    .map((member) => {
      const stats = totalByUser.get(member.user_id as string);
      return {
        id: member.user_id as string,
        name: displayNameFromJoin(
          member.profiles as
            | { display_name: string | null }
            | { display_name: string | null }[]
            | null,
        ),
        total: stats?.total ?? 0,
        hit: stats?.hit ?? false,
      };
    })
    .sort((a, b) => {
      if (a.hit !== b.hit) {
        return a.hit ? -1 : 1;
      }
      return b.total - a.total;
    });

  const preview = board.slice(0, 8);
  const status = todayStatus(todayReps, remaining, surplus, hit);
  const dayLine = challengeDayLine(
    dayNumber,
    duration,
    challenge.starts_on as string,
  );

  return (
    <main className="flex flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-2">
        <p className="font-display text-sm uppercase tracking-[0.2em] text-amber-700">
          100 a day
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Today
        </h1>
        <p className="text-sm text-zinc-500">{dayLine}</p>
      </header>
      <p
        className="font-display text-7xl font-semibold tracking-tight"
        aria-live="polite"
      >
        {todayReps}
      </p>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">{status}</p>
      {nudge ? (
        <p className="text-base text-amber-700 dark:text-amber-400">{nudge}</p>
      ) : null}
      {joinError ? (
        <p className="text-sm text-red-700 dark:text-red-400" role="alert">
          {ERRORS["join-failed"]}
        </p>
      ) : null}
      {streak > 0 ? (
        <p className="text-sm text-zinc-500">Streak {streak}</p>
      ) : null}
      {chips.length > 0 ? (
        <p className="text-sm text-zinc-500">
          {chips.map((n) => `${n}`).join(" / ")} days hit
        </p>
      ) : null}
      <CheckIn error={error ? ERRORS[error] : undefined} />
      <TodaySets sets={sets ?? []} timeZone={timeZone} />
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold">Today board</h2>
          <Link href="/app/board" className="text-sm underline">
            See all
          </Link>
        </div>
        <ul className="flex flex-col gap-2 text-sm">
          {preview.map((row) => (
            <li key={row.id} className="flex justify-between">
              <span>{row.name}</span>
              <span className="text-zinc-500">
                {row.hit ? "Hit" : row.total}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
