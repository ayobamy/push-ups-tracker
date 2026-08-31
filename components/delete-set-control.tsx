"use client";

import { deleteSet } from "@/app/app/actions";
import { deleteSetPrompt } from "@/lib/challenge/set-edit";
import { useId, useRef } from "react";

export function DeleteSetControl({ id, reps }: { id: string; reps: number }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const prompt = deleteSetPrompt(reps);

  return (
    <>
      <button
        type="button"
        className="h-11 min-h-11 px-3 underline underline-offset-4 hover:text-amber-700 dark:hover:text-amber-400"
        onClick={() => dialog.current?.showModal()}
      >
        Delete
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        className="m-auto max-w-sm rounded-lg border border-zinc-300 bg-white p-6 text-zinc-900 shadow-lg backdrop:bg-black/50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
      >
        <p id={titleId} className="font-display text-lg font-semibold">
          {prompt}
        </p>
        <p className="mt-2 text-sm text-zinc-500">This cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <form method="dialog">
            <button
              type="submit"
              className="h-11 min-h-11 px-3 underline underline-offset-4 hover:text-amber-700 dark:hover:text-amber-400"
            >
              Cancel
            </button>
          </form>
          <form action={deleteSet}>
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="h-11 min-h-11 rounded-lg bg-red-700 px-4 text-base font-medium text-white hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:bg-red-600 dark:hover:bg-red-500"
            >
              Delete
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}
