import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function optOut(token: string | null): Promise<boolean> {
  if (!token || !UUID.test(token)) {
    return false;
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("unsubscribe_reminders", { token });
  return !error;
}

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  await optOut(token);
  return new NextResponse(null, { status: 202 });
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const ok = await optOut(token);
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Reminders</title></head>
<body style="font-family:system-ui;padding:2rem;max-width:32rem;">
<h1>${ok ? "Evening reminders are off." : "That unsubscribe link is invalid."}</h1>
<p><a href="/login">Log in</a></p>
</body></html>`;
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
