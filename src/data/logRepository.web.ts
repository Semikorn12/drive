import type { DetectionLogger, LogLevel } from '../domain/recording/tripStore';
import { memory } from './memoryBackend';

export interface LogEntry {
  id: number;
  t: number;
  level: LogLevel;
  event: string;
  data: string | null;
}

export const dbLogger: DetectionLogger = {
  log(event, data, level = 'info') {
    memory.log.push({ id: memory.nextLogId++, t: Date.now(), level, event, data: data ? JSON.stringify(data) : null });
    if (memory.log.length > 3000) memory.log.shift();
  },
};

export async function readLog(limit = 500): Promise<LogEntry[]> {
  return memory.log.slice(-limit).reverse();
}

export async function clearLog() {
  memory.log.length = 0;
}

export function formatLog(entries: LogEntry[]): string {
  return entries
    .map((e) => `${new Date(e.t).toISOString()} ${e.level.toUpperCase().padEnd(5)} ${e.event}${e.data ? ' ' + e.data : ''}`)
    .join('\n');
}
