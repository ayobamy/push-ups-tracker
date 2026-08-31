"use client";

import {
  ceremonyCopy,
  ceremonyStorageKey,
  pendingCeremony,
} from "@/lib/challenge/ceremony";
import { useEffect, useRef, useState } from "react";

export function CeremonyGate({
  userId,
  daysHit,
}: {
  userId: string;
  daysHit: number;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [kind, setKind] = useState<100 | 365 | null>(null);
  const copy = kind ? ceremonyCopy(kind) : null;

  useEffect(() => {
    const key = ceremonyStorageKey(userId);
    let seen: number[] = [];
    try {
      seen = JSON.parse(localStorage.getItem(key) ?? "[]") as number[];
    } catch {
      seen = [];
    }
    const next = pendingCeremony(daysHit, seen);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage gate
    setKind(next);
    if (next) {
      dialog.current?.showModal();
    }
  }, [userId, daysHit]);

  function dismiss() {
    if (!kind) {
      return;
    }
    const key = ceremonyStorageKey(userId);
    let seen: number[] = [];
    try {
      seen = JSON.parse(localStorage.getItem(key) ?? "[]") as number[];
    } catch {
      seen = [];
    }
    if (!seen.includes(kind)) {
      seen.push(kind);
      localStorage.setItem(key, JSON.stringify(seen));
    }
    dialog.current?.close();
    setKind(null);
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="ceremony-title"
      className="m-auto max-w-sm rounded-lg border border-zinc-300 bg-white p-6 text-zinc-900 shadow-lg backdrop:bg-black/50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
    >
      {copy ? (
        <>
          <p
            id="ceremony-title"
            className="font-display text-3xl font-semibold tracking-tight"
          >
            {copy.title}
          </p>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
            {copy.body}
          </p>
          <form method="dialog" className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={dismiss}
              className="h-11 min-h-11 rounded-lg bg-zinc-900 px-4 text-base font-medium text-white dark:bg-amber-500 dark:text-zinc-950"
            >
              Back to Today
            </button>
          </form>
        </>
      ) : null}
    </dialog>
  );
}
