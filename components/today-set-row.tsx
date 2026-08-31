"use client";

import { updateSet } from "@/app/app/actions";
import { DeleteSetControl } from "@/components/delete-set-control";
import { editSetDirty, SAVE_SET_LABEL } from "@/lib/challenge/set-edit";
import { useState } from "react";

type SetRow = {
  id: string;
  reps: number;
  logged_at: string;
};

export function TodaySetRow({
  set,
  timeLabel,
}: {
  set: SetRow;
  timeLabel: string;
}) {
  const [draft, setDraft] = useState(String(set.reps));
  const dirty = editSetDirty(set.reps, draft);

  return (
    <li className="flex flex-wrap items-center gap-2 text-sm">
      <form action={updateSet} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="id" value={set.id} />
        <label className="sr-only" htmlFor={`edit-${set.id}`}>
          Edit reps
        </label>
        <input
          id={`edit-${set.id}`}
          name="reps"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          inputMode="numeric"
          className="h-11 w-20 rounded-lg border border-zinc-300 px-2 dark:border-zinc-700"
        />
        <span>reps</span>
        <span className="text-zinc-500">{timeLabel}</span>
        {dirty ? (
          <button
            type="submit"
            className="h-11 min-h-11 px-3 underline underline-offset-4 hover:text-amber-700 dark:hover:text-amber-400"
          >
            {SAVE_SET_LABEL}
          </button>
        ) : null}
      </form>
      <DeleteSetControl id={set.id} reps={set.reps} />
    </li>
  );
}
