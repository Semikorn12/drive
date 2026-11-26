/** Local midnight of the day that contains `t` (ms). */
export function startOfDay(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export interface DayGroup<T> {
  /** Local midnight (ms). */
  day: number;
  items: T[];
}

/** Group items by local calendar day, keeping the input order (lists are newest first). */
export function groupByDay<T>(items: T[], getTime: (item: T) => number): DayGroup<T>[] {
  const groups: DayGroup<T>[] = [];
  for (const item of items) {
    const day = startOfDay(getTime(item));
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(item);
    else groups.push({ day, items: [item] });
  }
  return groups;
}

/** 'today' | 'yesterday' | null (older) – relative to `now`. */
export function relativeDay(day: number, now = Date.now()): 'today' | 'yesterday' | null {
  const today = startOfDay(now);
  if (day === today) return 'today';
  const y = new Date(today);
  y.setDate(y.getDate() - 1);
  if (day === y.getTime()) return 'yesterday';
  return null;
}
