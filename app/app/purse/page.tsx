import { PurseStandings } from "@/components/purse-standings";
import { addCalendarDays, localDateFromInstant } from "@/lib/challenge/day";
import { hitPaceMs } from "@/lib/challenge/hit-at";
import { displayNameFromJoin, timezoneFromJoin } from "@/lib/challenge/profile";
import {
  HALF_POINTS,
  HIT_POINTS,
  RECOVERY_HITS,
  TOP_REDEEM,
  hitSequence,
  purseFromHits,
  sortPurse,
  type PurseStanding,
} from "@/lib/challenge/purse";
import { currentStreak } from "@/lib/challenge/streak";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Purse",
  robots: { index: false, follow: false },
};

type TotalsRow = {
  user_id: string;
  local_date: string;
  total_reps: number;
  hit_goal: boolean;
  hit_at: string | null;
};

export default async function PursePage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    redirect("/login");
  }

  const [{ data: challenge }, { data: profile }] = await Promise.all([
    supabase
      .from("challenges")
      .select("id, starts_on, duration_days")
      .eq("slug", "hundred-2026")
      .single(),
    supabase
      .from("profiles")
      .select("timezone")
      .eq("id", auth.user.id)
      .single(),
  ]);
  if (!challenge) {
    redirect("/app?error=no-challenge");
  }

  const today = localDateFromInstant(new Date(), profile?.timezone ?? "UTC");
  const startsOn = challenge.starts_on as string;
  const endsOn = addCalendarDays(
    startsOn,
    (challenge.duration_days as number) - 1,
  );
  const lastDay = today < endsOn ? today : endsOn;

  const [{ data: members }, { data: totals }] = await Promise.all([
    supabase
      .from("challenge_members")
      .select("user_id, profiles(display_name, timezone)")
      .eq("challenge_id", challenge.id),
    supabase
      .from("daily_totals")
      .select("user_id, local_date, total_reps, hit_goal, hit_at")
      .eq("challenge_id", challenge.id),
  ]);

  const byUser = new Map<
    string,
    { hits: string[]; reps: number; hitAts: string[] }
  >();
  for (const row of (totals ?? []) as TotalsRow[]) {
    const current = byUser.get(row.user_id) ?? {
      hits: [],
      reps: 0,
      hitAts: [],
    };
    current.reps += row.total_reps;
    if (row.hit_goal) {
      current.hits.push(row.local_date);
      if (row.hit_at) {
        current.hitAts.push(row.hit_at);
      }
    }
    byUser.set(row.user_id, current);
  }

  const rows: PurseStanding[] = sortPurse(
    (members ?? []).map((member) => {
      const stats = byUser.get(member.user_id as string);
      const hits = stats?.hits ?? [];
      const purse = purseFromHits(hitSequence(startsOn, lastDay, hits));
      const profiles = member.profiles as
        | { display_name: string | null; timezone?: string | null }
        | { display_name: string | null; timezone?: string | null }[]
        | null;
      return {
        id: member.user_id as string,
        name: displayNameFromJoin(profiles),
        points: purse.total,
        half: purse.half,
        recoveryHits: purse.recoveryHits,
        daysHit: hits.length,
        streak: currentStreak(hits, today),
        total: stats?.reps ?? 0,
        hitPaceMs: hitPaceMs(stats?.hitAts ?? [], timezoneFromJoin(profiles)),
        me: member.user_id === auth.user.id,
      };
    }),
  );

  return (
    <main className="flex flex-col gap-6 px-6 py-10">
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        Purse
      </h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        Hit 100: +{HIT_POINTS}. Miss: 0, then +{HALF_POINTS} until{" "}
        {RECOVERY_HITS} hits in a row. Extra reps do not buy points. Top{" "}
        {TOP_REDEEM} redeem offline: cash, airtime, merch. No shop in the app.
      </p>
      <PurseStandings rows={rows} />
    </main>
  );
}
