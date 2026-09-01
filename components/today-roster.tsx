import type { TodayBoardRow } from "@/lib/challenge/board";

export function TodayRoster({
  rows,
  label,
}: {
  rows: readonly TodayBoardRow[];
  label: string;
}) {
  return (
    <ul className="flex flex-col gap-2 text-sm" aria-label={label}>
      {rows.map((row) => (
        <li key={row.id} className="flex justify-between gap-3">
          <span className="min-w-0 truncate">
            {row.name}
            {row.me ? " (you)" : ""}
          </span>
          <span
            className={row.hit ? "font-medium" : "text-zinc-500"}
            style={row.hit ? { color: "var(--heatmap-hit)" } : undefined}
          >
            {row.hit ? "Hit" : row.total}
          </span>
        </li>
      ))}
    </ul>
  );
}
