import { kmToMiles } from '../domain/detection/geo';
import type { SpeedUnit } from '../state/settingsStore';

/** "12,3 km" / "7.6 mi" – locale-aware decimal separator. */
export function formatDistance(meters: number, unit: SpeedUnit, locale?: string): string {
  const km = meters / 1000;
  const value = unit === 'mph' ? kmToMiles(km) : km;
  const digits = value < 100 ? 1 : 0;
  return `${value.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits })} ${unit === 'mph' ? 'mi' : 'km'}`;
}

export function formatSpeed(kmh: number | null, unit: SpeedUnit): string {
  if (kmh == null) return '–';
  const v = unit === 'mph' ? kmToMiles(kmh) : kmh;
  return `${Math.round(v)} ${unit === 'mph' ? 'mph' : 'km/h'}`;
}

/** 4500 s → "1:15 h", 300 s → "5 min" */
export function formatDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')} h`;
}

/** 14:05 */
export function formatClock(t: number | null, locale?: string): string {
  if (t == null) return '–';
  return new Date(t).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

/** 1234 s → "20:34", 4000 s → "1:06:40" (live stopwatch). */
export function formatStopwatch(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

/** "Montag, 23. November" */
export function formatDay(t: number, locale?: string): string {
  return new Date(t).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
}

export function formatTime(t: number | null, locale?: string): string {
  if (t == null) return '–';
  return new Date(t).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
