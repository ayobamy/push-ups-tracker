import { logSet } from "@/app/app/actions";
import { TodaySetRow } from "@/components/today-set-row";

const PRESETS = [10, 20, 25, 50];

const presetClass =
  "h-12 min-h-11 min-w-11 rounded-lg border border-zinc-300 px-4 text-base font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-zinc-700";

const fieldClass =
  "h-12 w-28 rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

export function CheckIn({ error }: { error?: string }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-2">
        {PRESETS.map((reps) => (
          <form action={logSet} key={reps}>
            <input type="hidden" name="reps" value={reps} />
            <button type="submit" className={`${presetClass} w-full`}>
              Log {reps}
            </button>
          </form>
        ))}
      </div>
      <form action={logSet} className="flex gap-2">
        <label className="sr-only" htmlFor="custom-reps">
          Custom reps
        </label>
        <input
          id="custom-reps"
          name="reps"
          inputMode="numeric"
          pattern="[1-9][0-9]*"
          required
          placeholder="Custom"
          className={fieldClass}
        />
        <button
          type="submit"
          className="h-12 min-h-11 rounded-lg bg-zinc-900 px-4 text-base font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:bg-amber-500 dark:text-zinc-950"
        >
          Log
        </button>
      </form>
      {error ? (
        <p className="text-sm text-red-700 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}

type SetRow = {
  id: string;
  reps: number;
  logged_at: string;
};

export function TodaySets({
  sets,
  timeZone,
}: {
  sets: SetRow[];
  timeZone: string;
}) {
  if (sets.length === 0) {
    return null;
  }

  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <ul className="flex flex-col gap-3">
      {sets.map((set) => (
        <TodaySetRow
          key={set.id}
          set={set}
          timeLabel={time.format(new Date(set.logged_at))}
        />
      ))}
    </ul>
  );
}
