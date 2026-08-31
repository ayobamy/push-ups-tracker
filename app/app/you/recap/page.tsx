import { RecapCard } from "@/components/recap-card";
import { RecapExport } from "@/components/recap-export";
import { RecapShare } from "@/components/recap-share";
import { addCalendarDays, localDateFromInstant } from "@/lib/challenge/day";
import { heatmapGridStart } from "@/lib/challenge/heatmap";
import { recapLine } from "@/lib/challenge/recap";
import { longestStreak } from "@/lib/challenge/streak";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Recap" };

export default async function RecapPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: challenge }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, timezone")
      .eq("id", auth.user.id)
      .single(),
    supabase
      .from("challenges")
      .select("id, starts_on, duration_days")
      .eq("slug", "hundred-2026")
      .single(),
  ]);
  if (!challenge) {
    redirect("/app?error=no-challenge");
  }

  const timeZone = profile?.timezone ?? "UTC";
  const today = localDateFromInstant(new Date(), timeZone);

  const { data: totals } = await supabase
    .from("daily_totals")
    .select("local_date, total_reps, hit_goal")
    .eq("user_id", auth.user.id)
    .eq("challenge_id", challenge.id);

  const duration = challenge.duration_days as number;
  const startsOn = challenge.starts_on as string;
  const endsOn = addCalendarDays(startsOn, duration - 1);
  const gridStart = heatmapGridStart(today, startsOn);
  const byDate = new Map(
    (totals ?? []).map((row) => [
      row.local_date as string,
      row.total_reps as number,
    ]),
  );
  const cells: { date: string; reps: number }[] = [];
  let cursor = gridStart;
  while (cursor <= endsOn) {
    cells.push({ date: cursor, reps: byDate.get(cursor) ?? 0 });
    cursor = addCalendarDays(cursor, 1);
  }

  const hitDates = (totals ?? [])
    .filter((row) => row.hit_goal)
    .map((row) => row.local_date as string);
  const daysHit = hitDates.length;
  const longest = longestStreak(hitDates);
  const name = profile?.display_name ?? "Unnamed";
  const line = recapLine(daysHit, longest);

  return (
    <main className="flex flex-col gap-6 px-6 py-10">
      <p className="text-sm">
        <Link href="/app/you" className="underline underline-offset-4">
          Back to You
        </Link>
      </p>
      <RecapCard
        name={name}
        daysHit={daysHit}
        longest={longest}
        cells={cells}
      />
      <RecapExport
        name={name}
        daysHit={daysHit}
        longest={longest}
        cells={cells}
      />
      <RecapShare text={`${name}. ${line} 100 a Day.`} />
    </main>
  );
}
