"use client";

import { CalendarIcon } from "@/components/icons";
import {
  heatmapSwatch,
  heatmapTone,
  initialHeatmapDate,
} from "@/lib/challenge/heatmap";
import { useMemo, useState } from "react";

export type HeatDay = {
  date: string;
  reps: number;
  sets: { reps: number; loggedAt: string }[];
};

export function Heatmap({
  days,
  today,
  startsOn,
  endsOn,
}: {
  days: HeatDay[];
  today: string;
  startsOn: string;
  endsOn: string;
}) {
  const byDate = useMemo(
    () => new Map(days.map((day) => [day.date, day])),
    [days],
  );
  const gridStart = days[0]?.date ?? startsOn;
  const [selected, setSelected] = useState(() =>
    initialHeatmapDate(today, gridStart, endsOn),
  );
  const day = byDate.get(selected);

  return (
    <div className="flex flex-col gap-4">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}
        role="img"
        aria-label="365-day heatmap of daily totals"
      >
        {days.map((cell) => {
          const tone = heatmapTone(cell.reps);
          return (
            <button
              key={cell.date}
              type="button"
              title={`${cell.date}: ${cell.reps}`}
              aria-label={`${cell.date}: ${cell.reps} reps`}
              aria-pressed={selected === cell.date}
              data-tone={tone}
              onClick={() => setSelected(cell.date)}
              className={`h-4 w-4 appearance-none rounded-sm border-0 p-0 ${
                selected === cell.date ? "ring-1 ring-white" : ""
              }`}
              style={{ backgroundColor: heatmapSwatch(cell.reps) }}
            />
          );
        })}
      </div>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Pick a day
        <span className="relative block">
          <input
            type="date"
            min={gridStart}
            max={endsOn}
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            className="relative h-12 w-full rounded-lg border border-zinc-300 bg-white px-3 pr-12 text-base text-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <CalendarIcon className="pointer-events-none absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-zinc-700 dark:text-zinc-100" />
        </span>
      </label>
      {day ? (
        <section className="flex flex-col gap-2">
          <h2 className="font-display text-xl font-semibold">
            {day.date}: {day.reps} reps
            {day.reps >= 100 ? " · Hit" : ""}
          </h2>
          {day.date > today ? (
            <p className="text-sm text-zinc-500">
              Future days cannot be logged.
            </p>
          ) : day.sets.length === 0 ? (
            <p className="text-sm text-zinc-500">
              {day.date < today
                ? "Nothing logged that day. Past days stay closed."
                : "Nothing logged. Floor is 100."}
            </p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {day.sets.map((set, index) => (
                <li key={`${day.date}-${index}`}>{set.reps} reps</li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
