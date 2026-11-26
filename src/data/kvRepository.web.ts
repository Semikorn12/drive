import { memory } from './memoryBackend';

export async function kvGet<T>(key: string): Promise<T | null> {
  const v = memory.kv.get(key);
  return v ? (JSON.parse(v) as T) : null;
}

export async function kvSet(key: string, value: unknown) {
  memory.kv.set(key, JSON.stringify(value));
}
