"use client";

import { useEffect, useState } from "react";

function useTodayHitFlip(hit: boolean, today: string): boolean {
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    if (!hit) {
      return;
    }
    const key = `today-hit-flip:${today}`;
    if (sessionStorage.getItem(key)) {
      return;
    }
    sessionStorage.setItem(key, "1");
    // Client-only: logSet reloads Today, then we flip once this session.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage gate
    setFlip(true);
  }, [hit, today]);

  return flip;
}

export function TodayHitHero({
  reps,
  status,
  hit,
  today,
}: {
  reps: number;
  status: string;
  hit: boolean;
  today: string;
}) {
  const flip = useTodayHitFlip(hit, today);
  return (
    <>
      <p
        className={`font-display text-7xl font-semibold tracking-tight ${
          flip ? "today-hit-flip" : ""
        }`}
        aria-live="polite"
      >
        {reps}
      </p>
      <p
        className={`text-lg text-zinc-600 dark:text-zinc-400 ${
          flip ? "today-hit-flip" : ""
        }`}
      >
        {status}
      </p>
    </>
  );
}
