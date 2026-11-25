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

export function formatTime(t: number | null, locale?: string): string {
  if (t == null) return '–';
  return new Date(t).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
