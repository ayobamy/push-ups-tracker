import { TOP_REDEEM } from "@/lib/challenge/purse";

export type PurseLane = {
  background: string;
  ink: string;
};

/** Gold to deep bronze. Same metal family as the Board podium. */
export const PURSE_LANES: readonly PurseLane[] = [
  { background: "#E8C547", ink: "#1A1408" },
  { background: "#DCB03C", ink: "#1A1408" },
  { background: "#D09A34", ink: "#1A1408" },
  { background: "#C48430", ink: "#1A1408" },
  { background: "#B86E2C", ink: "#1A1408" },
  { background: "#9A4026", ink: "#FFF6EE" },
  { background: "#8A3824", ink: "#FFF6EE" },
  { background: "#7A3020", ink: "#FFF6EE" },
  { background: "#68281C", ink: "#FFF6EE" },
  { background: "#542018", ink: "#FFF6EE" },
];

export function purseLane(placeIndex: number): PurseLane | null {
  if (placeIndex < 0 || placeIndex >= TOP_REDEEM) {
    return null;
  }
  return PURSE_LANES[placeIndex] ?? null;
}
