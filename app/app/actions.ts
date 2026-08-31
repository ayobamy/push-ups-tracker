"use server";

import { localDateFromInstant } from "@/lib/challenge/day";
import { appReturnPath } from "@/lib/challenge/paths";
import {
  isIanaTimeZone,
  parseDisplayName,
  isDisplayNameTakenError,
} from "@/lib/challenge/profile";
import { parseReps } from "@/lib/challenge/reps";
import { isMissingTable } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function revalidateApp() {
  revalidatePath("/app");
  revalidatePath("/app/board");
  revalidatePath("/app/you");
  revalidatePath("/app/settings");
}

async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    redirect("/login");
  }
  return { supabase, user: data.user };
}

async function activeChallengeId(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string> {
  const { data, error } = await supabase
    .from("challenges")
    .select("id")
    .eq("slug", "hundred-2026")
    .single();
  if (error || !data) {
    redirect("/app?error=no-challenge");
  }
  return data.id as string;
}

export async function completeProfile(formData: FormData) {
  const next = appReturnPath(formData.get("from"));
  const parsed = parseDisplayName(String(formData.get("display_name") ?? ""));
  const timeZone = String(formData.get("timezone") ?? "");
  if (!parsed.ok || !isIanaTimeZone(timeZone)) {
    redirect(`${next}?error=invalid-profile`);
  }

  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    display_name: parsed.displayName,
    timezone: timeZone,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    if (isMissingTable(error)) {
      redirect(`${next}?error=schema-missing`);
    }
    const taken = isDisplayNameTakenError(error);
    redirect(
      taken ? `${next}?error=name-taken` : `${next}?error=invalid-profile`,
    );
  }

  const joined = await supabase.rpc("join_active_challenge");
  if (joined.error) {
    if (isMissingTable(joined.error)) {
      redirect(`${next}?error=schema-missing`);
    }
    redirect(`${next}?error=join-failed`);
  }

  revalidateApp();
  redirect(next);
}

export async function logSet(formData: FormData) {
  const parsed = parseReps(String(formData.get("reps") ?? ""));
  if (!parsed.ok) {
    redirect("/app?error=invalid-reps");
  }

  const { supabase, user } = await requireUser();
  const challengeId = await activeChallengeId(supabase);
  await supabase.rpc("join_active_challenge");

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .single();
  const today = localDateFromInstant(new Date(), profile?.timezone ?? "UTC");

  const { error } = await supabase.from("sets").insert({
    user_id: user.id,
    challenge_id: challengeId,
    reps: parsed.reps,
    local_date: today,
  });

  if (error) {
    redirect("/app?error=log-failed");
  }

  revalidateApp();
  redirect("/app");
}

export async function updateSet(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const parsed = parseReps(String(formData.get("reps") ?? ""));
  if (!id || !parsed.ok) {
    redirect("/app?error=invalid-reps");
  }

  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("sets")
    .update({ reps: parsed.reps })
    .eq("id", id);

  if (error) {
    redirect("/app?error=log-failed");
  }

  revalidateApp();
  redirect("/app");
}

export async function deleteSet(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    redirect("/app");
  }

  const { supabase } = await requireUser();
  const { error } = await supabase.from("sets").delete().eq("id", id);
  if (error) {
    redirect("/app?error=log-failed");
  }

  revalidateApp();
  redirect("/app");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function setRemindersOptIn(formData: FormData) {
  const { supabase, user } = await requireUser();
  const enabled = String(formData.get("reminders_opt_in")) === "on";
  const { error } = await supabase
    .from("profiles")
    .update({
      reminders_opt_in: enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) {
    redirect("/app/settings?error=invalid-profile");
  }
  revalidatePath("/app/settings");
  redirect("/app/settings");
}
