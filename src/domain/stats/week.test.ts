import { startOfWeek, weekSummary } from './week';

const at = (month: number, day: number, h = 12) => new Date(2026, month, day, h).getTime();
const trip = (t: number, km: number, min = 20) => ({ startedAt: t, distanceM: km * 1000, durationS: min * 60 });

describe('weekSummary', () => {
  // Thursday, 26 Nov 2026
  const now = at(10, 26, 18);

  it('week starts on Monday', () => {
    expect(new Date(startOfWeek(now)).getDate()).toBe(23);
    expect(new Date(startOfWeek(at(10, 29))).getDate()).toBe(23); // Sunday belongs to the same week
    expect(new Date(startOfWeek(at(10, 30))).getDate()).toBe(30); // next Monday
  });

  it('sums this week and splits by day', () => {
    const s = weekSummary([trip(at(10, 26, 8), 10), trip(at(10, 26, 17), 5), trip(at(10, 23), 20, 30), trip(at(10, 20), 99)], now);
    expect(s.trips).toBe(3);
    expect(s.distanceM).toBe(35_000);
    expect(s.durationS).toBe(70 * 60);
    expect(s.days.map((d) => d.distanceM / 1000)).toEqual([20, 0, 0, 15, 0, 0, 0]);
  });

  it('streak counts back from today, or from yesterday if nothing today yet', () => {
    const days = [26, 25, 24, 22].map((d) => trip(at(10, d), 1));
    expect(weekSummary(days, now).streakDays).toBe(3);
    expect(weekSummary(days.slice(1), now).streakDays).toBe(2); // none today: 25, 24
    expect(weekSummary([trip(at(10, 20), 1)], now).streakDays).toBe(0);
  });

  it('streak crosses month boundaries', () => {
    const s = weekSummary([trip(at(11, 1), 1), trip(at(10, 30), 1), trip(at(10, 29), 1)], at(11, 1, 20));
    expect(s.streakDays).toBe(3);
  });
});
