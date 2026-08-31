import { Heatmap, type HeatDay } from "@/app/app/heatmap";
import { addCalendarDays, localDateFromInstant } from "@/lib/challenge/day";
import { heatmapGridStart } from "@/lib/challenge/heatmap";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function YouPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", auth.user.id)
    .single();
  const timeZone = profile?.timezone ?? "UTC";
  const today = localDateFromInstant(new Date(), timeZone);

  const { data: challenge } = await supabase
    .from("challenges")
    .select("id, starts_on, duration_days")
    .eq("slug", "hundred-2026")
    .single();
  if (!challenge) {
    redirect("/app?error=no-challenge");
  }

  const { data: totals } = await supabase
    .from("daily_totals")
    .select("local_date, total_reps")
    .eq("user_id", auth.user.id)
    .eq("challenge_id", challenge.id);

  const { data: sets } = await supabase
    .from("sets")
    .select("local_date, reps, logged_at")
    .eq("user_id", auth.user.id)
    .eq("challenge_id", challenge.id)
    .order("logged_at", { ascending: true });

  const byDate = new Map(
    (totals ?? []).map((row) => [
      row.local_date as string,
      row.total_reps as number,
    ]),
  );
  const setsByDate = new Map<string, { reps: number; loggedAt: string }[]>();
  for (const set of sets ?? []) {
    const date = set.local_date as string;
    const list = setsByDate.get(date) ?? [];
    list.push({ reps: set.reps as number, loggedAt: set.logged_at as string });
    setsByDate.set(date, list);
  }

  const duration = challenge.duration_days as number;
  const startsOn = challenge.starts_on as string;
  const endsOn = addCalendarDays(startsOn, duration - 1);
  const gridStart = heatmapGridStart(today, startsOn);
  const days: HeatDay[] = [];
  let cursor = gridStart;
  while (cursor <= endsOn) {
    days.push({
      date: cursor,
      reps: byDate.get(cursor) ?? 0,
      sets: setsByDate.get(cursor) ?? [],
    });
    cursor = addCalendarDays(cursor, 1);
  }

  return (
    <main className="flex flex-col gap-6 px-6 py-10">
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        You
      </h1>
      <p className="text-sm text-zinc-500">
        365 days from {startsOn}. Today is {today}. Past days cannot be logged.
      </p>
      <Heatmap days={days} today={today} startsOn={startsOn} endsOn={endsOn} />
    </main>
  );
}
