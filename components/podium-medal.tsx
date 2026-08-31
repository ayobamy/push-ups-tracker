import { podiumLabel, type PodiumPlace } from "@/lib/challenge/podium";

const METAL: Record<PodiumPlace, { fill: string; ring: string; wash: string }> =
  {
    1: { fill: "#E8C547", ring: "#8A6A12", wash: "rgba(232, 197, 71, 0.18)" },
    2: { fill: "#C5CDD6", ring: "#4B5563", wash: "rgba(197, 205, 214, 0.16)" },
    3: { fill: "#C67B3A", ring: "#6B3A14", wash: "rgba(198, 123, 58, 0.16)" },
  };

export function PodiumMedal({ place }: { place: PodiumPlace }) {
  const metal = METAL[place];

  return (
    <span
      aria-label={podiumLabel(place)}
      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-xl font-semibold text-zinc-950"
      style={{
        background: `radial-gradient(circle at 32% 24%, rgba(255,255,255,0.72), ${metal.fill} 58%)`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.55), 0 0 0 2px ${metal.ring}, 0 8px 18px ${metal.wash}`,
      }}
    >
      {place}
    </span>
  );
}

export function podiumWash(place: PodiumPlace): string {
  return METAL[place].wash;
}
