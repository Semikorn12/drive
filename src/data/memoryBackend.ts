import { MemoryTripStore } from '../domain/recording/tripStore';
import type { LogEntry } from './logRepository';

/**
 * In-memory data for the browser preview (GitHub Pages). SQLite needs special server headers
 * that GitHub Pages cannot send, so the web build keeps everything in memory until reload.
 */
export const memory = {
  trips: new MemoryTripStore(),
  log: [] as LogEntry[],
  kv: new Map<string, string>(),
  nextLogId: 1,
};
