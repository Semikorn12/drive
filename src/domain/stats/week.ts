import type { Trip } from '../trip';

const DAY = 86_400_000;

/** Monday 00:00 (local time) of the week containing `t`. */
export function startOfWeek(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  const dow = (d.getDay() + 6) % 7; // Mon = 0
  d.setDate(d.getDate() - dow);
  return d.getTime();
}

function dayKey(t: number) {
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export interface WeekStats {
  weekStart: number;
  distanceM: number;
  trips: number;
  durationS: number;
  prevDistanceM: number;
  /** Consecutive days with at least one trip, ending today (or yesterday if no trip yet today). */
  streakDays: number;
  lastTrip: Trip | null;
}

/** `trips` = completed trips of at least the last two weeks + enough history for the streak. */
export function computeWeekStats(trips: Trip[], now = Date.now()): WeekStats {
  const weekStart = startOfWeek(now);
  const prevStart = startOfWeek(weekStart - DAY);
  const thisWeek = trips.filter((t) => t.startedAt >= weekStart && t.startedAt <= now);
  const prevWeek = trips.filter((t) => t.startedAt >= prevStart && t.startedAt < weekStart);

  const days = new Set(trips.map((t) => dayKey(t.startedAt)));
  let streak = 0;
  const cursor = new Date(now);
  cursor.setHours(12, 0, 0, 0);
  if (!days.has(dayKey(cursor.getTime()))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dayKey(cursor.getTime()))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const sorted = [...trips].sort((a, b) => b.startedAt - a.startedAt);
  return {
    weekStart,
    distanceM: thisWeek.reduce((s, t) => s + t.distanceM, 0),
    trips: thisWeek.length,
    durationS: thisWeek.reduce((s, t) => s + t.durationS, 0),
    prevDistanceM: prevWeek.reduce((s, t) => s + t.distanceM, 0),
    streakDays: streak,
    lastTrip: sorted[0] ?? null,
  };
}
