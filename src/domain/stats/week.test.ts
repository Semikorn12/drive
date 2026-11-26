import type { Trip } from '../trip';
import { computeWeekStats, startOfWeek } from './week';

const trip = (iso: string, km: number): Trip =>
  ({ id: iso, startedAt: new Date(iso).getTime(), distanceM: km * 1000, durationS: 600, status: 'completed' }) as Trip;

describe('week stats', () => {
  const now = new Date('2026-11-26T18:00:00').getTime(); // Thursday

  it('week starts on Monday', () => {
    expect(new Date(startOfWeek(now)).getDay()).toBe(1);
  });

  it('sums this week and last week separately', () => {
    const s = computeWeekStats([trip('2026-11-24T08:00:00', 10), trip('2026-11-26T08:00:00', 5), trip('2026-11-20T08:00:00', 7)], now);
    expect(s.distanceM).toBe(15000);
    expect(s.trips).toBe(2);
    expect(s.prevDistanceM).toBe(7000);
    expect(s.lastTrip?.id).toBe('2026-11-26T08:00:00');
  });

  it('streak counts consecutive days, today optional', () => {
    const s = computeWeekStats([trip('2026-11-25T08:00:00', 1), trip('2026-11-24T08:00:00', 1), trip('2026-11-22T08:00:00', 1)], now);
    expect(s.streakDays).toBe(2);
  });
});
