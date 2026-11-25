/** One GPS fix, platform-independent (converted from expo-location or a GPX file). */
export interface LocationSample {
  /** Unix time in ms. */
  t: number;
  lat: number;
  lon: number;
  /** GPS speed in m/s; null/negative if unknown (then derived from positions). */
  speed: number | null;
  /** Horizontal accuracy in metres; null if unknown. */
  accuracy: number | null;
  altitude?: number | null;
  heading?: number | null;
}

/** Hint from the OS motion coprocessor (iOS "Motion & Fitness"). */
export type MotionHint = 'automotive' | 'cycling' | 'walking' | 'running' | 'stationary' | 'unknown';

export interface DetectorConfig {
  /** Speed that makes a car trip likely (km/h). */
  startSpeedKmh: number;
  /** How long the speed must stay above the threshold (s). */
  startDurationS: number;
  /** Short dips below the start speed (traffic light) that do not reset the timer (s). */
  startGraceS: number;
  /** Below this speed we count as "standing" (km/h). */
  stopSpeedKmh: number;
  /** Standing this long ends the trip (s). */
  stopDurationS: number;
  /** Trips shorter than this are discarded (m). */
  minTripMeters: number;
  /** Give up on a candidate after this long without a confirmed trip (s). */
  candidateTimeoutS: number;
  /** Ignore fixes worse than this for distance/speed (m). */
  maxAccuracyM: number;
  /** Implausible speed → GPS jump, ignored (km/h). */
  maxPlausibleKmh: number;
  /** Seconds of history before the start that are added to the trip (leaving the parking spot). */
  preStartBufferS: number;
  /** No GPS fix at all (tunnel, garage) → end the trip only after this long (s). */
  noSignalTimeoutS: number;
  /** A "cycling" hint from the OS blocks the start for this long (s)… */
  cyclingVetoS: number;
  /** …unless the speed is clearly above bicycle speed (km/h). */
  cyclingVetoMaxKmh: number;
}

export const DEFAULT_DETECTOR_CONFIG: DetectorConfig = {
  startSpeedKmh: 15,
  startDurationS: 60,
  startGraceS: 20,
  stopSpeedKmh: 5,
  stopDurationS: 180,
  minTripMeters: 500,
  candidateTimeoutS: 240,
  maxAccuracyM: 65,
  maxPlausibleKmh: 280,
  preStartBufferS: 90,
  noSignalTimeoutS: 900,
  cyclingVetoS: 600,
  cyclingVetoMaxKmh: 35,
};

/**
 * idle      – no GPS, only cheap geofence monitoring.
 * candidate – something moved; precise GPS runs briefly to check whether it is a car trip.
 * driving   – trip is being recorded.
 */
export type DetectorPhase = 'idle' | 'candidate' | 'driving';

export interface DetectorState {
  phase: DetectorPhase;
  /** When the current candidate phase began. */
  candidateSince: number | null;
  /** Since when speed is continuously above the start threshold (with grace). */
  fastSince: number | null;
  /** Last time speed was above the start threshold. */
  lastFastAt: number | null;
  /** Last time we were moving (speed ≥ stop threshold) – used for the trip end. */
  lastMovingAt: number | null;
  /** Last accepted sample (for derived speed). */
  last: LocationSample | null;
  /** Rolling buffer while candidate (becomes the start of the trip). */
  buffer: LocationSample[];
  /** Trip being recorded. */
  tripStartedAt: number | null;
  tripManual: boolean;
  /** Has a manual trip moved at all? Before that, it does not auto-end. */
  tripHasMoved: boolean;
  lastMotion: MotionHint | null;
  lastMotionAt: number | null;
}

export type DiscardReason = 'tooShort' | 'noMovement';

export type DetectorEvent =
  | { type: 'candidateStarted'; t: number }
  | { type: 'candidateTimeout'; t: number }
  | { type: 'tripStarted'; t: number; manual: boolean; points: LocationSample[] }
  | { type: 'tripPoints'; points: LocationSample[] }
  | { type: 'tripEnded'; t: number; endedAt: number; reason: 'stopped' | 'manual' }
  | { type: 'sampleRejected'; t: number; reason: 'accuracy' | 'jump' | 'outOfOrder' };

export function initialDetectorState(): DetectorState {
  return {
    phase: 'idle',
    candidateSince: null,
    fastSince: null,
    lastFastAt: null,
    lastMovingAt: null,
    last: null,
    buffer: [],
    tripStartedAt: null,
    tripManual: false,
    tripHasMoved: false,
    lastMotion: null,
    lastMotionAt: null,
  };
}
