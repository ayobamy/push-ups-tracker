import { CheckIn, TodaySets } from "@/app/app/check-in";
import { OnboardingForm } from "@/app/app/onboarding-form";
import { BrandMark } from "@/components/brand-mark";
import { CeremonyGate } from "@/components/ceremony-gate";
import { TodayHitHero } from "@/components/today-hit";
import { TodayRoster } from "@/components/today-roster";
import { sortTodayBoard } from "@/lib/challenge/board";
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
import {
  challengeDayLine,
  previewTodayBoard,
  isFullTodayRoster,
  todayBoardListLabel,
  todayHitLine,
  todayStatus,
} from "@/lib/challenge/today-copy";
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
  searchParams: Promise<{ error?: string; roster?: string }>;
}) {
  const { error, roster } = await searchParams;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    redirect("/login");
  }

  const [{ data: profile, error: profileError }, { data: challenge }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, display_name, timezone")
        .eq("id", auth.user.id)
        .single(),
      supabase
        .from("challenges")
        .select("id, title, daily_goal, starts_on, duration_days")
        .eq("slug", "hundred-2026")
        .single(),
    ]);

  if (isMissingTable(profileError) || error === "schema-missing") {
    return (
      <main className="flex flex-col gap-6 px-6 py-10">
        <BrandMark />
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
        <BrandMark />
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

  const [{ data: sets }, { data: hits }, { data: members }, { data: totals }] =
    await Promise.all([
      supabase
        .from("sets")
        .select("id, reps, logged_at")
        .eq("user_id", auth.user.id)
        .eq("challenge_id", challenge.id)
        .eq("local_date", today)
        .order("logged_at", { ascending: true }),
      supabase
        .from("daily_totals")
        .select("local_date")
        .eq("user_id", auth.user.id)
        .eq("challenge_id", challenge.id)
        .eq("hit_goal", true),
      supabase
        .from("challenge_members")
        .select("user_id, profiles(display_name)")
        .eq("challenge_id", challenge.id),
      supabase
        .from("daily_totals")
        .select("user_id, total_reps, hit_goal, hit_at")
        .eq("challenge_id", challenge.id)
        .eq("local_date", today),
    ]);

  const todayReps = (sets ?? []).reduce(
    (sum, set) => sum + (set.reps as number),
    0,
  );
  const remaining = remainingToGoal(goal, todayReps);
  const surplus = surplusOverGoal(goal, todayReps);
  const hit = hitGoal(goal, todayReps);
  const nudge = eveningNudge(localHour(now, timeZone), goal, todayReps);
  const streak = currentStreak(
    (hits ?? []).map((row) => row.local_date as string),
    today,
  );
  const daysHit = (hits ?? []).length;
  const chips = earnedMilestones(daysHit);

  const totalByUser = new Map(
    (totals ?? []).map((row) => [
      row.user_id as string,
      {
        total: row.total_reps as number,
        hit: row.hit_goal as boolean,
        hitAt: (row.hit_at as string | null) ?? null,
      },
    ]),
  );

  const board = sortTodayBoard(
    (members ?? []).map((member) => {
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
        hitAt: stats?.hitAt ?? null,
        me: member.user_id === auth.user.id,
      };
    }),
  );

  const hitCount = board.filter((row) => row.hit).length;
  const showEveryone = isFullTodayRoster(roster);
  const listed = showEveryone ? board : previewTodayBoard(board);
  const status = todayStatus(todayReps, remaining, surplus, hit);
  const dayLine = challengeDayLine(
    dayNumber,
    duration,
    challenge.starts_on as string,
  );

  return (
    <main className="flex flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-3">
        <BrandMark />
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Today
        </h1>
        <p className="text-sm text-zinc-500">{dayLine}</p>
      </header>
      <TodayHitHero reps={todayReps} status={status} hit={hit} today={today} />
      {nudge ? (
        <p className="text-base text-amber-700 dark:text-amber-400">{nudge}</p>
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
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold">Today board</h2>
        <p className="font-display text-5xl font-semibold tracking-tight">
          {hitCount}
          <span className="text-2xl text-zinc-500"> / {board.length}</span>
        </p>
        <p className="text-sm text-zinc-500">
          {todayHitLine(hitCount, board.length)}
        </p>
        <TodayRoster
          rows={listed}
          label={todayBoardListLabel(listed.length, board.length)}
        />
        <Link
          href={showEveryone ? "/app" : "/app?roster=all"}
          className="w-fit text-sm underline"
          aria-label={
            showEveryone
              ? "Show the first five on today's board"
              : "See everyone on today's board"
          }
        >
          {showEveryone ? "Show five" : "See everyone"}
        </Link>
      </section>
      <CeremonyGate userId={auth.user.id} daysHit={daysHit} />
    </main>
  );
}
