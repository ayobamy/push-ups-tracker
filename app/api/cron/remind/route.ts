import { sendEveningReminders } from "@/lib/mail/send-evening";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return false;
  }
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

async function run() {
  const result = await sendEveningReminders({ env: process.env });
  return NextResponse.json(result);
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return run();
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return run();
}
