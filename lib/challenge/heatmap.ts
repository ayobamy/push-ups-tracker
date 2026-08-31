import type { IsoDate } from "@/lib/challenge/day";

export type HeatTone = "hit" | "progress" | "zero";

export function heatmapTone(reps: number, goal = 100): HeatTone {
  if (reps >= goal) {
    return "hit";
  }
  if (reps > 0) {
    return "progress";
  }
  return "zero";
}

export function heatmapSwatch(reps: number, goal = 100): string {
  return `var(--heatmap-${heatmapTone(reps, goal)})`;
}

export function heatmapGridStart(today: IsoDate, startsOn: IsoDate): IsoDate {
  return today < startsOn ? today : startsOn;
}

export function initialHeatmapDate(
  today: IsoDate,
  gridStart: IsoDate,
  endsOn: IsoDate,
): IsoDate {
  if (today < gridStart) {
    return gridStart;
  }
  if (today > endsOn) {
    return endsOn;
  }
  return today;
}
