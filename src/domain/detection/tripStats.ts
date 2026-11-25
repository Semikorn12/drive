import { effectiveSpeed } from './detector';
import { haversineM, msToKmh } from './geo';
import { DEFAULT_DETECTOR_CONFIG, type DetectorConfig, type LocationSample } from './types';

/** Below this GPS speed (m/s ≈ 2 km/h) we treat the phone as standing. */
const STANDING_MS = 0.6;
/** Ignore position changes smaller than this (GPS noise). */
const MIN_STEP_M = 4;

export interface TripStats {
  startedAt: number;
  endedAt: number;
  distanceM: number;
  durationS: number;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
}

/**
 * Summary of a trip from its points. Inaccurate fixes and GPS jumps are skipped;
 * the max speed uses a 3-point median so single GPS spikes don't count.
 */
export function computeTripStats(
  points: LocationSample[],
  endedAt?: number,
  config: DetectorConfig = DEFAULT_DETECTOR_CONFIG,
): TripStats | null {
  const good = points.filter((p) => p.accuracy == null || p.accuracy <= config.maxAccuracyM).sort((a, b) => a.t - b.t);
  if (good.length === 0) return null;

  let distanceM = 0;
  const speeds: number[] = [];
  let prev: LocationSample | null = null; // previous accepted fix (for speed)
  let anchor: LocationSample | null = null; // last point distance was measured from
  for (const p of good) {
    if (endedAt != null && p.t > endedAt) break;
    if (prev) {
      const dt = (p.t - prev.t) / 1000;
      const jump = haversineM(prev.lat, prev.lon, p.lat, p.lon);
      if (dt <= 0 || msToKmh(jump / dt) > config.maxPlausibleKmh) continue; // GPS jump → skip point
    }
    const v = effectiveSpeed(p, prev);
    if (v != null) speeds.push(msToKmh(v));
    if (!anchor) anchor = p;
    // Standing still: GPS positions wander a few metres – don't count that as distance.
    const standing = p.speed != null && p.speed >= 0 && p.speed < STANDING_MS;
    const d = haversineM(anchor.lat, anchor.lon, p.lat, p.lon);
    if (!standing && d >= MIN_STEP_M) {
      distanceM += d;
      anchor = p;
    }
    prev = p;
  }

  const startedAt = good[0].t;
  const end = endedAt ?? prev?.t ?? startedAt;
  const durationS = Math.max(0, Math.round((end - startedAt) / 1000));
  const avgSpeedKmh = durationS > 0 ? msToKmh(distanceM / durationS) : 0;

  let maxSpeedKmh = 0;
  for (let i = 1; i < speeds.length - 1; i++) {
    const median = [speeds[i - 1], speeds[i], speeds[i + 1]].sort((a, b) => a - b)[1];
    if (median <= config.maxPlausibleKmh) maxSpeedKmh = Math.max(maxSpeedKmh, median);
  }
  if (speeds.length > 0 && speeds.length < 3) maxSpeedKmh = Math.min(...speeds);

  return { startedAt, endedAt: end, distanceM, durationS, avgSpeedKmh, maxSpeedKmh };
}

export type TripVerdict = { keep: true } | { keep: false; reason: 'tooShort' };

/** Rule from the spec: trips under 500 m are discarded. */
export function judgeTrip(stats: TripStats, config: DetectorConfig = DEFAULT_DETECTOR_CONFIG): TripVerdict {
  return stats.distanceM < config.minTripMeters ? { keep: false, reason: 'tooShort' } : { keep: true };
}
