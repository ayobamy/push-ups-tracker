import {
  HIT_POINTS,
  RECOVERY_HITS,
  TOP_REDEEM,
  type PurseStanding,
} from "@/lib/challenge/purse";

export function PurseStandings({ rows }: { rows: PurseStanding[] }) {
  const mine = rows.find((row) => row.me);

  return (
    <div className="flex flex-col gap-6">
      {mine ? (
        <section className="flex flex-col gap-1">
          <p className="font-display text-5xl font-semibold tracking-tight">
            {mine.points}
          </p>
          <p className="text-sm text-zinc-500">
            {mine.half
              ? `Half rate. ${mine.recoveryHits} of ${RECOVERY_HITS} makeup hits.`
              : `Full rate. Hit 100 for +${HIT_POINTS}.`}
          </p>
        </section>
      ) : null}
      <ol className="flex flex-col gap-3">
        {rows.map((row, index) => (
          <li
            key={row.id}
            className={`flex items-center gap-3 rounded-2xl border px-3 py-3 ${
              row.me
                ? "border-amber-500"
                : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <span className="w-8 shrink-0 text-zinc-500">{index + 1}.</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {row.name}
                {row.me ? " (you)" : ""}
              </p>
              <p className="text-sm text-zinc-500">
                {row.daysHit} days · streak {row.streak}
                {row.half ? " · half" : ""}
              </p>
            </div>
            <p className="font-display text-xl font-semibold tabular-nums">
              {row.points}
            </p>
          </li>
        ))}
      </ol>
      {rows.length > TOP_REDEEM ? (
        <p className="text-sm text-zinc-500">
          Places 1-{TOP_REDEEM} redeem after day 365.
        </p>
      ) : null}
    </div>
  );
}
