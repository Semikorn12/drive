import { MemoryTripStore } from '../domain/recording/tripStore';
import type { Trip } from '../domain/trip';
import type { LocationSample } from '../domain/detection/types';
import type { LogEntry } from './logRepository';

/**
 * Data store for the browser version (GitHub Pages). SQLite needs server headers GitHub Pages
 * can't send, so trips are kept in memory and saved in the browser's own storage
 * (localStorage) on THIS device. Nothing is uploaded.
 */
const STORAGE_KEY = 'drive.web.v1';

export const memory = {
  trips: new MemoryTripStore(),
  log: [] as LogEntry[],
  kv: new Map<string, string>(),
  nextLogId: 1,
};

interface Saved {
  trips: Trip[];
  points: Record<string, [number, number, number, number | null, number | null][]>;
  kv: Record<string, string>;
}

function storage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

/** Load once at startup. */
(function load() {
  const raw = storage()?.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const saved = JSON.parse(raw) as Saved;
    for (const t of saved.trips) memory.trips.trips.set(t.id, t);
    for (const [id, pts] of Object.entries(saved.points)) {
      memory.trips.points.set(
        id,
        pts.map(([t, lat, lon, speed, accuracy]): LocationSample => ({ t, lat, lon, speed, accuracy })),
      );
    }
    for (const [k, v] of Object.entries(saved.kv)) memory.kv.set(k, v);
  } catch {
    // corrupt data → start fresh
  }
})();

let timer: ReturnType<typeof setTimeout> | null = null;

export function saveNow() {
  if (timer) clearTimeout(timer);
  timer = null;
  const s = storage();
  if (!s) return;
  const round = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;
  const data: Saved = {
    trips: [...memory.trips.trips.values()],
    points: Object.fromEntries(
      [...memory.trips.points.entries()].map(([id, pts]) => [
        id,
        pts.map((p) => [
          p.t,
          round(p.lat, 6),
          round(p.lon, 6),
          p.speed == null ? null : round(p.speed, 2),
          p.accuracy == null ? null : Math.round(p.accuracy),
        ]),
      ]),
    ),
    kv: Object.fromEntries(memory.kv),
  };
  try {
    s.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full – keep working in memory
  }
}

/** Save shortly after changes (batched). */
export function scheduleSave() {
  if (timer) return;
  timer = setTimeout(saveNow, 5000);
}

if (typeof window !== 'undefined') window.addEventListener('pagehide', saveNow);
