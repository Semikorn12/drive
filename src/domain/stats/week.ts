import { startOfDay } from '../../utils/days';

export interface TripLike {
  startedAt: number;
  distanceM: number;
  durationS: number;
}

export interface DayStat {
  /** Local midnight (ms). */
  day: number;
  distanceM: number;
  trips: number;
}

export interface WeekSummary {
  /** Monday 00:00 local time (ms). */
  weekStart: number;
  /** Local midnight of "now" when the summary was made. */
  today: number;
  /** Monday … Sunday. */
  days: DayStat[];
  distanceM: number;
  trips: number;
  durationS: number;
  /** Consecutive days with at least one trip, ending today (or yesterday if there's no trip yet today). */
  streakDays: number;
}

function addDays(day: number, n: number): number {
  const d = new Date(day);
  d.setDate(d.getDate() + n);
  return d.getTime();
}

/** Local Monday 00:00 of the week containing `t`. */
export function startOfWeek(t: number): number {
  const day = startOfDay(t);
  const weekday = (new Date(day).getDay() + 6) % 7; // Monday = 0
  return addDays(day, -weekday);
}

/** Week numbers for the overview. `trips` may contain older trips – they only count for the streak. */
export function weekSummary(trips: TripLike[], now = Date.now()): WeekSummary {
  const weekStart = startOfWeek(now);
  const days: DayStat[] = Array.from({ length: 7 }, (_, i) => ({ day: addDays(weekStart, i), distanceM: 0, trips: 0 }));
  const weekEnd = addDays(weekStart, 7);
  let durationS = 0;
  const activeDays = new Set<number>();

  for (const trip of trips) {
    const day = startOfDay(trip.startedAt);
    activeDays.add(day);
    if (trip.startedAt < weekStart || trip.startedAt >= weekEnd) continue;
    const slot = days.find((d) => d.day === day);
    if (!slot) continue;
    slot.distanceM += trip.distanceM;
    slot.trips += 1;
    durationS += trip.durationS;
  }

  let cursor = startOfDay(now);
  if (!activeDays.has(cursor)) cursor = addDays(cursor, -1);
  let streakDays = 0;
  while (activeDays.has(cursor)) {
    streakDays += 1;
    cursor = addDays(cursor, -1);
  }

  return {
    weekStart,
    today: startOfDay(now),
    days,
    distanceM: days.reduce((s, d) => s + d.distanceM, 0),
    trips: days.reduce((s, d) => s + d.trips, 0),
    durationS,
    streakDays,
  };
}
