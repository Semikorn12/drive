import type * as Location from 'expo-location';

import type { LocationSample, MotionHint } from '../../domain/detection/types';

export function toSample(l: Location.LocationObject): LocationSample {
  return {
    t: l.timestamp,
    lat: l.coords.latitude,
    lon: l.coords.longitude,
    speed: l.coords.speed != null && l.coords.speed >= 0 ? l.coords.speed : null,
    accuracy: l.coords.accuracy ?? null,
    altitude: l.coords.altitude ?? null,
    heading: l.coords.heading != null && l.coords.heading >= 0 ? l.coords.heading : null,
  };
}

/** Picks the detected activity from an expo-location MotionActivityObject. */
export function toMotionHint(activity: Location.MotionActivityObject | null | undefined): MotionHint {
  if (!activity) return 'unknown';
  const order: MotionHint[] = ['automotive', 'cycling', 'running', 'walking', 'stationary'];
  for (const k of order) {
    const state = (activity.activities as Record<string, { detected: boolean } | undefined>)[k];
    if (state?.detected) return k;
  }
  return 'unknown';
}
