export type IsoDate = string;

export function localDateFromInstant(instant: Date, timeZone: string): IsoDate {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);

  const year = takePart(parts, "year");
  const month = takePart(parts, "month");
  const day = takePart(parts, "day");
  return `${year}-${month}-${day}`;
}

export function addCalendarDays(iso: IsoDate, delta: number): IsoDate {
  const [year, month, day] = iso.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + delta));
  return utc.toISOString().slice(0, 10);
}

function takePart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  const part = parts.find((item) => item.type === type);
  if (!part) {
    throw new Error(`missing date part: ${type}`);
  }
  return part.value.padStart(2, "0");
}
