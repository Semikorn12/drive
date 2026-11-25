import type { DetectionLogger, LogLevel } from '../domain/recording/tripStore';
import { getDb } from './db';

export interface LogEntry {
  id: number;
  t: number;
  level: LogLevel;
  event: string;
  data: string | null;
}

const MAX_ENTRIES = 3000;
let writes = 0;

/** Writes to the detection log table (diagnostics page). Never throws. */
export const dbLogger: DetectionLogger = {
  log(event, data, level = 'info') {
    if (__DEV__) console.log(`[drive] ${event}`, data ?? '');
    void (async () => {
      try {
        const db = await getDb();
        await db.runAsync(
          'INSERT INTO detection_log (t, level, event, data) VALUES (?, ?, ?, ?)',
          Date.now(),
          level,
          event,
          data ? JSON.stringify(data) : null,
        );
        if (++writes % 100 === 0) {
          await db.runAsync(
            'DELETE FROM detection_log WHERE id <= (SELECT MAX(id) FROM detection_log) - ?',
            MAX_ENTRIES,
          );
        }
      } catch {
        // logging must never break detection
      }
    })();
  },
};

export async function readLog(limit = 500): Promise<LogEntry[]> {
  const db = await getDb();
  return db.getAllAsync<LogEntry>('SELECT * FROM detection_log ORDER BY id DESC LIMIT ?', limit);
}

export async function clearLog() {
  const db = await getDb();
  await db.runAsync('DELETE FROM detection_log');
}

export function formatLog(entries: LogEntry[]): string {
  return entries
    .map((e) => `${new Date(e.t).toISOString()} ${e.level.toUpperCase().padEnd(5)} ${e.event}${e.data ? ' ' + e.data : ''}`)
    .join('\n');
}
