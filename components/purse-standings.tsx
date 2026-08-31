import { purseLane } from "@/lib/challenge/purse-lane";
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
      <ol className="flex flex-col gap-3" aria-label="Purse standings">
        {rows.map((row, index) => {
          const lane = purseLane(index);
          const place = index + 1;
          const meRing = row.me
            ? lane
              ? "ring-2 ring-zinc-950 ring-offset-2 ring-offset-[var(--background)] dark:ring-amber-400"
              : "ring-2 ring-amber-500"
            : "";
          const shell = lane
            ? "border-0"
            : row.me
              ? ""
              : "border border-zinc-200 dark:border-zinc-800";
          return (
            <li
              key={row.id}
              className={`flex items-center gap-3 rounded-2xl px-3 ${
                lane ? "py-4" : "py-3"
              } ${meRing} ${shell}`}
              style={
                lane
                  ? { backgroundColor: lane.background, color: lane.ink }
                  : undefined
              }
            >
              <span
                className={`w-8 shrink-0 font-display ${
                  lane ? "text-lg font-semibold" : "text-zinc-500"
                }`}
              >
                {place}.
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate font-medium ${
                    lane ? "font-display text-lg tracking-tight" : ""
                  }`}
                >
                  {row.name}
                  {row.me ? " (you)" : ""}
                </p>
                <p className={lane ? "text-sm" : "text-sm text-zinc-500"}>
                  {row.daysHit} days · streak {row.streak}
                  {row.half ? " · half" : ""}
                </p>
              </div>
              <p
                className={`font-display font-semibold tabular-nums ${
                  lane ? "text-2xl" : "text-xl"
                }`}
              >
                {row.points}
              </p>
            </li>
          );
        })}
      </ol>
      {rows.length > TOP_REDEEM ? (
        <p className="text-sm text-zinc-500">
          Places 1-{TOP_REDEEM} redeem after day 365.
        </p>
      ) : null}
    </div>
  );
}
