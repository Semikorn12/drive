import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { tripRepository } from '../data/tripRepository';
import { computeWeekStats, startOfWeek, type WeekStats } from '../domain/stats/week';
import { useLive } from '../services/tracking/liveStore';

/** Week numbers for the overview. Reloads when the screen is focused and after a trip ends. */
export function useWeekStats(): WeekStats | null {
  const [stats, setStats] = useState<WeekStats | null>(null);

  const load = useCallback(async () => {
    try {
      const since = startOfWeek(Date.now()) - 60 * 86_400_000; // enough for a 2-month streak
      const trips = await tripRepository.listTrips({ since, limit: 2000 });
      setStats(computeWeekStats(trips));
    } catch {
      setStats(computeWeekStats([]));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  // Reload when a trip has just ended.
  useEffect(
    () =>
      useLive.subscribe((s, prev) => {
        if (s.phase === 'idle' && prev.phase !== 'idle') void load();
      }),
    [load],
  );

  return stats;
}
