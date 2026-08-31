"use client";

import { PodiumMedal, podiumWash } from "@/components/podium-medal";
import {
  sortBoard,
  type BoardRow,
  type BoardSort,
} from "@/lib/challenge/board";
import { podiumPlace } from "@/lib/challenge/podium";
import { useMemo, useState } from "react";

const chips: { id: BoardSort; label: string }[] = [
  { id: "days", label: "Days" },
  { id: "streak", label: "Streak" },
  { id: "total", label: "Total" },
];

export function BoardList({ rows }: { rows: BoardRow[] }) {
  const [sort, setSort] = useState<BoardSort>("days");
  const ranked = useMemo(() => sortBoard(rows, sort), [rows, sort]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2" role="group" aria-label="Sort board">
        {chips.map((chip) => {
          const selected = sort === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setSort(chip.id)}
              className={`h-12 min-h-11 rounded-lg px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                selected
                  ? "bg-zinc-900 text-white dark:bg-amber-500 dark:text-zinc-950"
                  : "border border-zinc-300 dark:border-zinc-700"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
      <ol className="flex flex-col gap-3">
        {ranked.map((row, index) => {
          const place = podiumPlace(index);
          const meRing = row.me
            ? "ring-2 ring-amber-500"
            : "border border-zinc-200 dark:border-zinc-800";
          return (
            <li
              key={row.id}
              className={`flex flex-col gap-2 rounded-2xl px-3 py-3 ${meRing} ${
                place ? "py-4" : "text-sm"
              }`}
              style={place ? { background: podiumWash(place) } : undefined}
            >
              <div className="flex items-center gap-3">
                {place ? (
                  <PodiumMedal place={place} />
                ) : (
                  <span className="w-8 shrink-0 text-zinc-500">
                    {index + 1}.
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate font-medium ${
                      place === 1
                        ? "font-display text-2xl tracking-tight"
                        : place
                          ? "font-display text-lg"
                          : ""
                    }`}
                  >
                    {row.name}
                    {row.me ? " (you)" : ""}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {row.daysHit} days · streak {row.streak} · {row.total} reps
                    · surplus {row.surplus}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
