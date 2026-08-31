"use client";

import { deleteAccount } from "@/app/app/actions";
import {
  DELETE_ACCOUNT_CONFIRM,
  deleteAccountPrompt,
} from "@/lib/challenge/account";
import { useId, useRef } from "react";

export function DeleteAccountControl() {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const confirmId = useId();

  return (
    <>
      <button
        type="button"
        className="h-12 min-h-11 w-full rounded-lg border border-red-700 px-4 text-base text-red-700 dark:border-red-500 dark:text-red-400"
        onClick={() => dialog.current?.showModal()}
      >
        Delete my account
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        className="m-auto max-w-sm rounded-lg border border-zinc-300 bg-white p-6 text-zinc-900 shadow-lg backdrop:bg-black/50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
      >
        <p id={titleId} className="font-display text-lg font-semibold">
          {deleteAccountPrompt()}
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          This cannot be undone. Type {DELETE_ACCOUNT_CONFIRM} to confirm.
        </p>
        <form action={deleteAccount} className="mt-6 flex flex-col gap-3">
          <label htmlFor={confirmId} className="text-sm font-medium">
            Confirm
          </label>
          <input
            id={confirmId}
            name="confirm"
            autoComplete="off"
            className="h-12 min-h-11 rounded-lg border border-zinc-300 px-3 dark:border-zinc-700 dark:bg-zinc-950"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="h-11 min-h-11 px-3 underline underline-offset-4 hover:text-amber-700 dark:hover:text-amber-400"
              onClick={() => dialog.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-11 min-h-11 rounded-lg bg-red-700 px-4 text-base font-medium text-white hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:bg-red-600 dark:hover:bg-red-500"
            >
              Delete
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
