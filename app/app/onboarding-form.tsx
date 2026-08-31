"use client";

import { completeProfile } from "@/app/app/actions";
import type { AppReturnPath } from "@/lib/challenge/paths";
import { useMemo, useState } from "react";

const fieldClass =
  "h-12 rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

export function OnboardingForm({
  error,
  submitLabel = "Join the challenge",
  defaultName = "",
  defaultTimezone,
  from = "/app",
}: {
  error?: string;
  submitLabel?: string;
  defaultName?: string;
  defaultTimezone?: string;
  from?: AppReturnPath;
}) {
  const zones = useMemo(() => {
    let list: string[];
    try {
      list = Intl.supportedValuesOf("timeZone");
    } catch {
      list = ["UTC", "Europe/London", "Africa/Lagos", "America/New_York"];
    }
    if (defaultTimezone && !list.includes(defaultTimezone)) {
      return [defaultTimezone, ...list];
    }
    return list;
  }, [defaultTimezone]);
  const [timeZone, setTimeZone] = useState(() => {
    if (defaultTimezone) {
      return defaultTimezone;
    }
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "UTC";
    }
  });

  return (
    <form action={completeProfile} className="flex flex-col gap-4">
      <input type="hidden" name="from" value={from} />
      <label className="flex flex-col gap-2 text-sm font-medium">
        Display name
        <input
          name="display_name"
          required
          minLength={2}
          maxLength={32}
          autoComplete="nickname"
          defaultValue={defaultName}
          className={fieldClass}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Timezone
        <select
          name="timezone"
          value={timeZone}
          onChange={(event) => setTimeZone(event.target.value)}
          className={fieldClass}
        >
          {zones.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
      </label>
      {error ? (
        <p className="text-sm text-red-700 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        className="h-12 min-h-11 rounded-lg bg-zinc-900 px-4 text-base font-medium text-white dark:bg-amber-500 dark:text-zinc-950"
      >
        {submitLabel}
      </button>
    </form>
  );
}
