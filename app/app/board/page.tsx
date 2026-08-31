import { BoardList } from "@/app/app/board-list";
import { dailySurplus, type BoardRow } from "@/lib/challenge/board";
import { localDateFromInstant } from "@/lib/challenge/day";
import { displayNameFromJoin } from "@/lib/challenge/profile";
import { currentStreak } from "@/lib/challenge/streak";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type TotalsRow = {
  user_id: string;
  local_date: string;
  total_reps: number;
  hit_goal: boolean;
};

export default async function BoardPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    redirect("/login");
  }

  const { data: challenge } = await supabase
    .from("challenges")
    .select("id, daily_goal, starts_on")
    .eq("slug", "hundred-2026")
    .single();
  if (!challenge) {
    redirect("/app?error=no-challenge");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", auth.user.id)
    .single();
  const today = localDateFromInstant(new Date(), profile?.timezone ?? "UTC");

  const { data: members } = await supabase
    .from("challenge_members")
    .select("user_id, profiles(display_name)")
    .eq("challenge_id", challenge.id);

  const { data: totals } = await supabase
    .from("daily_totals")
    .select("user_id, local_date, total_reps, hit_goal")
    .eq("challenge_id", challenge.id);

  const byUser = new Map<
    string,
    { hits: string[]; reps: number; surplus: number }
  >();
  for (const row of (totals ?? []) as TotalsRow[]) {
    const current = byUser.get(row.user_id) ?? {
      hits: [],
      reps: 0,
      surplus: 0,
    };
    current.reps += row.total_reps;
    current.surplus += dailySurplus(
      challenge.daily_goal as number,
      row.total_reps,
    );
    if (row.hit_goal) {
      current.hits.push(row.local_date);
    }
    byUser.set(row.user_id, current);
  }

  const rows: BoardRow[] = (members ?? []).map((member) => {
    const stats = byUser.get(member.user_id as string);
    return {
      id: member.user_id as string,
      name: displayNameFromJoin(
        member.profiles as
          | { display_name: string | null }
          | { display_name: string | null }[]
          | null,
      ),
      daysHit: stats?.hits.length ?? 0,
      streak: currentStreak(stats?.hits ?? [], today),
      total: stats?.reps ?? 0,
      surplus: stats?.surplus ?? 0,
      me: member.user_id === auth.user.id,
    };
  });

  return (
    <main className="flex flex-col gap-6 px-6 py-10">
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        Board
      </h1>
      <BoardList rows={rows} />
    </main>
  );
}
