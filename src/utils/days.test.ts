import { groupByDay, relativeDay, startOfDay } from './days';
import { formatStopwatch } from './format';

describe('days', () => {
  const at = (d: number, h: number) => new Date(2026, 10, d, h, 15).getTime();

  it('groups newest-first items by local day', () => {
    const items = [at(26, 18), at(26, 8), at(25, 22), at(23, 7)];
    const g = groupByDay(items, (x) => x);
    expect(g.map((x) => x.items.length)).toEqual([2, 1, 1]);
    expect(g[0].day).toBe(new Date(2026, 10, 26).getTime());
  });

  it('today / yesterday / older', () => {
    const now = at(26, 12);
    expect(relativeDay(startOfDay(at(26, 1)), now)).toBe('today');
    expect(relativeDay(startOfDay(at(25, 23)), now)).toBe('yesterday');
    expect(relativeDay(startOfDay(at(24, 12)), now)).toBeNull();
    // Across a month boundary
    expect(relativeDay(new Date(2026, 10, 30).getTime(), new Date(2026, 11, 1, 9).getTime())).toBe('yesterday');
  });

  it('stopwatch', () => {
    expect(formatStopwatch(0)).toBe('0:00');
    expect(formatStopwatch(1234)).toBe('20:34');
    expect(formatStopwatch(4000)).toBe('1:06:40');
  });
});
