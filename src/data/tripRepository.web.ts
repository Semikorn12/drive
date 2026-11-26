import type { Trip, TripChange } from '../domain/trip';
import { memory } from './memoryBackend';

/** Web preview: same API as the SQLite repository, backed by memory. */
const store = memory.trips;

export const tripRepository = Object.assign(store, {
  async listTrips({ limit = 50, offset = 0, since, until }: { limit?: number; offset?: number; since?: number; until?: number } = {}) {
    return [...store.trips.values()]
      .filter((t) => t.status === 'completed' && t.startedAt >= (since ?? 0) && t.startedAt < (until ?? Number.MAX_SAFE_INTEGER))
      .sort((a, b) => b.startedAt - a.startedAt)
      .slice(offset, offset + limit) as Trip[];
  },
  async countTrips() {
    return [...store.trips.values()].filter((t) => t.status === 'completed').length;
  },
  async getChanges(_tripId: string): Promise<TripChange[]> {
    return [];
  },
});
