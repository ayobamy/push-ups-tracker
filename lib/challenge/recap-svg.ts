import { heatmapTone } from "@/lib/challenge/heatmap";
import { recapLine } from "@/lib/challenge/recap";

export const RECAP_CARD_WIDTH = 840;

/** Dark-card heatmap. Matches html.dark tokens in app/globals.css. */
export const RECAP_HEAT = {
  hit: "#4ade80",
  progress: "#166534",
  zero: "#3f3f46",
} as const;

export type RecapExportCell = { date: string; reps: number };

export function recapHeatHex(reps: number, goal = 100): string {
  return RECAP_HEAT[heatmapTone(reps, goal)];
}

export function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function recapDownloadName(
  name: string,
  ext: "png" | "svg" | "jpg",
): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
  return `100-a-day-recap-${slug || "card"}.${ext}`;
}

export function recapCardSvg(input: {
  name: string;
  daysHit: number;
  longest: number;
  cells: RecapExportCell[];
}): string {
  const pad = 48;
  const cols = 14;
  const gap = 4;
  const inner = RECAP_CARD_WIDTH - pad * 2;
  const cell = (inner - gap * (cols - 1)) / cols;
  const rows = Math.max(1, Math.ceil(input.cells.length / cols));
  const gridTop = 202;
  const gridH = rows * cell + (rows - 1) * gap;
  const height = Math.ceil(gridTop + gridH + pad);
  const line = xmlEscape(recapLine(input.daysHit, input.longest));
  const name = xmlEscape(input.name);
  const rects = input.cells
    .map((item, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = pad + col * (cell + gap);
      const y = gridTop + row * (cell + gap);
      return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" rx="1" fill="${recapHeatHex(item.reps)}"/>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${RECAP_CARD_WIDTH}" height="${height}" viewBox="0 0 ${RECAP_CARD_WIDTH} ${height}" role="img" aria-label="${name} year recap">
  <rect width="100%" height="100%" rx="24" fill="#09090b"/>
  <text x="${pad}" y="66" fill="#f59e0b" font-size="14" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="600" letter-spacing="4">100 A DAY</text>
  <text x="${pad}" y="130" fill="#fafafa" font-size="44" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="600">${name}</text>
  <text x="${pad}" y="170" fill="#a1a1aa" font-size="20" font-family="ui-sans-serif, system-ui, sans-serif">${line}</text>
  ${rects}
</svg>`;
}
