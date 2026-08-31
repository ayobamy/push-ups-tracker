import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, timezone, created_at")
    .eq("id", auth.user.id)
    .single();

  const { data: sets } = await supabase
    .from("sets")
    .select("id, reps, logged_at, local_date, note")
    .eq("user_id", auth.user.id)
    .order("logged_at", { ascending: true });

  const { data: totals } = await supabase
    .from("daily_totals")
    .select("local_date, total_reps, hit_goal")
    .eq("user_id", auth.user.id)
    .order("local_date", { ascending: true });

  const payload = {
    exported_at: new Date().toISOString(),
    email: auth.user.email,
    profile,
    sets: sets ?? [],
    daily_totals: totals ?? [],
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="100-a-day-export.json"',
      "Cache-Control": "no-store",
    },
  });
}
