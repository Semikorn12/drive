import { memory, saveNow } from './memoryBackend';

/** Web version: no SQLite. See memoryBackend.ts. */
export function getDb(): never {
  throw new Error('SQLite is not used in the web preview');
}

export async function wipeLocalDatabase() {
  memory.trips.trips.clear();
  memory.trips.points.clear();
  memory.log.length = 0;
  memory.kv.clear();
  saveNow();
}
