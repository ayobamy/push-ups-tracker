import { BoardList } from "@/app/app/board-list";
import { TodayRoster } from "@/components/today-roster";
import {
  dailySurplus,
  sortTodayBoard,
  type BoardRow,
} from "@/lib/challenge/board";
import { localDateFromInstant } from "@/lib/challenge/day";
import { hitPaceMs } from "@/lib/challenge/hit-at";
import { displayNameFromJoin, timezoneFromJoin } from "@/lib/challenge/profile";
import { currentStreak } from "@/lib/challenge/streak";
import { todayHitLine } from "@/lib/challenge/today-copy";
import {
  mondayOfWeek,
  weekPerfectNames,
  weekScoreLine,
} from "@/lib/challenge/week";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type TotalsRow = {
  user_id: string;
  local_date: string;
  total_reps: number;
  hit_goal: boolean;
  hit_at: string | null;
};

export default async function BoardPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    redirect("/login");
  }

  const [{ data: challenge }, { data: profile }] = await Promise.all([
    supabase
      .from("challenges")
      .select("id, daily_goal, starts_on")
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
    { hits: string[]; reps: number; surplus: number; hitAts: string[] }
  >();
  for (const row of (totals ?? []) as TotalsRow[]) {
    const current = byUser.get(row.user_id) ?? {
      hits: [],
      reps: 0,
      surplus: 0,
      hitAts: [],
    };
    current.reps += row.total_reps;
    current.surplus += dailySurplus(
      challenge.daily_goal as number,
      row.total_reps,
    );
    if (row.hit_goal) {
      current.hits.push(row.local_date);
      if (row.hit_at) {
        current.hitAts.push(row.hit_at);
      }
    }
    byUser.set(row.user_id, current);
  }

  const rows: BoardRow[] = (members ?? []).map((member) => {
    const stats = byUser.get(member.user_id as string);
    const profiles = member.profiles as
      | { display_name: string | null; timezone?: string | null }
      | { display_name: string | null; timezone?: string | null }[]
      | null;
    return {
      id: member.user_id as string,
      name: displayNameFromJoin(profiles),
      daysHit: stats?.hits.length ?? 0,
      streak: currentStreak(stats?.hits ?? [], today),
      total: stats?.reps ?? 0,
      surplus: stats?.surplus ?? 0,
      hitPaceMs: hitPaceMs(stats?.hitAts ?? [], timezoneFromJoin(profiles)),
      me: member.user_id === auth.user.id,
    };
  });

  const todayByUser = new Map(
    ((totals ?? []) as TotalsRow[])
      .filter((row) => row.local_date === today)
      .map((row) => [
        row.user_id,
        {
          total: row.total_reps,
          hit: row.hit_goal,
          hitAt: row.hit_at,
        },
      ]),
  );
  const todayRows = sortTodayBoard(
    (members ?? []).map((member) => {
      const stats = todayByUser.get(member.user_id as string);
      const profiles = member.profiles as
        | { display_name: string | null }
        | { display_name: string | null }[]
        | null;
      return {
        id: member.user_id as string,
        name: displayNameFromJoin(profiles),
        total: stats?.total ?? 0,
        hit: stats?.hit ?? false,
        hitAt: stats?.hitAt ?? null,
        me: member.user_id === auth.user.id,
      };
    }),
  );
  const todayHitCount = todayRows.filter((row) => row.hit).length;

  const monday = mondayOfWeek(today);
  const perfectWeek = weekPerfectNames(
    rows.map((row) => ({
      name: row.name,
      hits: byUser.get(row.id)?.hits ?? [],
    })),
    monday,
    today,
  );
  const weekLine = weekScoreLine(monday, today);

  return (
    <main className="flex flex-col gap-6 px-6 py-10">
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        Board
      </h1>
      <section
        id="today"
        tabIndex={-1}
        className="flex scroll-mt-16 flex-col gap-4"
      >
        <h2 className="font-display text-xl font-semibold">Today</h2>
        <p className="text-sm text-zinc-500">
          {todayHitLine(todayHitCount, todayRows.length)}
        </p>
        <TodayRoster rows={todayRows} label="Everyone today" />
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="font-display text-xl font-semibold">This week</h2>
        <p className="text-sm text-zinc-500">{weekLine}</p>
        {perfectWeek.length === 0 ? (
          <p className="text-sm text-zinc-500">Nobody has every day yet.</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {perfectWeek.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        )}
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold">Year</h2>
        <BoardList rows={rows} />
      </section>
    </main>
  );
}
