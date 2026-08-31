export function shouldSendEveningReminder(input: {
  optIn: boolean;
  alreadySent: boolean;
  localHour: number;
  todayReps: number;
  goal: number;
  localDate: string;
  startsOn: string;
  durationDays: number;
}): boolean {
  if (!input.optIn || input.alreadySent) {
    return false;
  }
  if (input.localHour !== 20) {
    return false;
  }
  if (input.todayReps >= input.goal) {
    return false;
  }
  if (input.localDate < input.startsOn) {
    return false;
  }
  const endExclusive = addDaysIso(input.startsOn, input.durationDays);
  if (input.localDate >= endExclusive) {
    return false;
  }
  return true;
}

function addDaysIso(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return utc.toISOString().slice(0, 10);
}

export function reminderCopy(remaining: number): {
  subject: string;
  body: string;
  cta: string;
} {
  return {
    subject: `Still ${remaining} short today`,
    body: `Still ${remaining} short before midnight. Floor is 100.`,
    cta: "Log a set",
  };
}
