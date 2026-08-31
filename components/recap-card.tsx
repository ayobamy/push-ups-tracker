import { heatmapSwatch } from "@/lib/challenge/heatmap";
import { recapLine } from "@/lib/challenge/recap";

export function RecapCard({
  name,
  daysHit,
  longest,
  cells,
}: {
  name: string;
  daysHit: number;
  longest: number;
  cells: { date: string; reps: number }[];
}) {
  return (
    <article className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-zinc-950 p-6 text-zinc-50 dark:border-zinc-800">
      <p className="font-display text-sm uppercase tracking-[0.2em] text-amber-500">
        100 a Day
      </p>
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        {name}
      </h1>
      <p className="text-lg text-zinc-400">{recapLine(daysHit, longest)}</p>
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}
        role="img"
        aria-label="Year heatmap"
      >
        {cells.map((cell) => (
          <span
            key={cell.date}
            className="block aspect-square rounded-[1px]"
            style={{ backgroundColor: heatmapSwatch(cell.reps) }}
            title={`${cell.date}: ${cell.reps}`}
          />
        ))}
      </div>
    </article>
  );
}
