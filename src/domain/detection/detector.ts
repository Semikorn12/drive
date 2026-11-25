import { haversineM, kmhToMs } from './geo';
import {
  DEFAULT_DETECTOR_CONFIG,
  type DetectorConfig,
  type DetectorEvent,
  type DetectorState,
  type LocationSample,
  type MotionHint,
} from './types';

/**
 * Pure trip-detection state machine. No timers, no I/O: feed it samples (and ticks),
 * get back the new state plus events. Everything here is unit-tested.
 */
export interface StepResult {
  state: DetectorState;
  events: DetectorEvent[];
}

/** Effective speed (m/s) for a sample: GPS speed if available, else derived from the previous fix. */
export function effectiveSpeed(sample: LocationSample, prev: LocationSample | null): number | null {
  if (sample.speed != null && sample.speed >= 0) return sample.speed;
  if (!prev) return null;
  const dt = (sample.t - prev.t) / 1000;
  if (dt <= 0) return null;
  return haversineM(prev.lat, prev.lon, sample.lat, sample.lon) / dt;
}

/** Wake-up from the OS (geofence exit etc.): start checking whether this is a drive. */
export function beginCandidate(state: DetectorState, t: number): StepResult {
  if (state.phase !== 'idle') return { state, events: [] };
  return {
    state: { ...state, phase: 'candidate', candidateSince: t, fastSince: null, lastFastAt: null, buffer: [] },
    events: [{ type: 'candidateStarted', t }],
  };
}

/** Latest activity from the OS motion coprocessor. Unknown readings don't overwrite a known one. */
export function setMotionHint(state: DetectorState, hint: MotionHint, t: number): DetectorState {
  if (hint === 'unknown') return state;
  return { ...state, lastMotion: hint, lastMotionAt: t };
}

/**
 * Only "cycling" can block a start (walking/running at > 15 km/h for a minute is impossible,
 * so such a hint is simply outdated). The veto expires and is overruled by car-like speeds.
 */
function isVetoed(state: DetectorState, t: number, speedMs: number, config: DetectorConfig): boolean {
  if (state.lastMotion !== 'cycling' || state.lastMotionAt == null) return false;
  if (t - state.lastMotionAt > config.cyclingVetoS * 1000) return false;
  return speedMs < kmhToMs(config.cyclingVetoMaxKmh);
}

export function processSample(
  state: DetectorState,
  sample: LocationSample,
  config: DetectorConfig = DEFAULT_DETECTOR_CONFIG,
): StepResult {
  const events: DetectorEvent[] = [];
  let s = state;

  if (s.last && sample.t <= s.last.t) {
    return { state: s, events: [{ type: 'sampleRejected', t: sample.t, reason: 'outOfOrder' }] };
  }

  // A moving fix while idle means we are awake anyway → check for a drive.
  // Standing fixes while idle (e.g. right after a trip ended) are ignored.
  if (s.phase === 'idle') {
    const v0 = effectiveSpeed(sample, s.last);
    if (v0 == null || v0 < kmhToMs(config.stopSpeedKmh)) return { state: { ...s, last: sample }, events };
    const r = beginCandidate(s, sample.t);
    s = r.state;
    events.push(...r.events);
  }

  const inaccurate = sample.accuracy != null && sample.accuracy > config.maxAccuracyM;
  const speed = effectiveSpeed(sample, s.last);
  const jump = speed != null && speed > kmhToMs(config.maxPlausibleKmh);

  if (inaccurate || jump) {
    events.push({ type: 'sampleRejected', t: sample.t, reason: inaccurate ? 'accuracy' : 'jump' });
    // Still let time pass (for stop / timeout detection), but don't use the position.
    const r = handleTime(s, sample.t, config);
    return { state: r.state, events: [...events, ...r.events] };
  }

  const v = speed ?? 0;
  const isFast = v >= kmhToMs(config.startSpeedKmh);
  const isMoving = v >= kmhToMs(config.stopSpeedKmh);
  const t = sample.t;

  if (s.phase === 'candidate') {
    let { fastSince, lastFastAt } = s;
    if (isFast) {
      if (fastSince == null || (lastFastAt != null && t - lastFastAt > config.startGraceS * 1000)) fastSince = t;
      lastFastAt = t;
    } else if (lastFastAt != null && t - lastFastAt > config.startGraceS * 1000) {
      fastSince = null; // dip lasted too long → start over
    }

    const buffer = [...s.buffer, sample].filter((p) => p.t >= t - (config.startDurationS + config.preStartBufferS) * 1000);
    s = { ...s, fastSince, lastFastAt, buffer, last: sample, lastMovingAt: isMoving ? t : s.lastMovingAt };

    const vetoed = isVetoed(s, t, v, config);
    if (fastSince != null && t - fastSince >= config.startDurationS * 1000 && !vetoed) {
      const tripPoints = buffer.filter((p) => p.t >= fastSince - config.preStartBufferS * 1000);
      const startedAt = tripPoints[0]?.t ?? fastSince;
      s = {
        ...s,
        phase: 'driving',
        tripStartedAt: startedAt,
        tripManual: false,
        tripHasMoved: true,
        lastMovingAt: t,
        buffer: [],
        candidateSince: null,
      };
      events.push({ type: 'tripStarted', t: startedAt, manual: false, points: tripPoints });
      return { state: s, events };
    }
    const r = handleTime(s, t, config);
    return { state: r.state, events: [...events, ...r.events] };
  }

  // driving
  s = {
    ...s,
    last: sample,
    lastMovingAt: isMoving ? t : s.lastMovingAt,
    tripHasMoved: s.tripHasMoved || isFast,
  };
  events.push({ type: 'tripPoints', points: [sample] });
  const r = handleTime(s, t, config);
  return { state: r.state, events: [...events, ...r.events] };
}

/** Advance time without a new position (also used by background wake-ups). */
export function handleTime(state: DetectorState, now: number, config: DetectorConfig = DEFAULT_DETECTOR_CONFIG): StepResult {
  if (state.phase === 'candidate' && state.candidateSince != null) {
    const drivingLikely = state.fastSince != null;
    if (!drivingLikely && now - state.candidateSince >= config.candidateTimeoutS * 1000) {
      return { state: toIdle(state), events: [{ type: 'candidateTimeout', t: now }] };
    }
  }
  if (state.phase === 'driving') {
    const canAutoEnd = !state.tripManual || state.tripHasMoved;
    const lastMove = state.lastMovingAt ?? state.tripStartedAt ?? now;
    // Only "standing" if we still get fixes. Without any fix (tunnel) we wait much longer.
    const receivingFixes = state.last != null && now - state.last.t < 30_000;
    const limitS = receivingFixes ? config.stopDurationS : config.noSignalTimeoutS;
    if (canAutoEnd && now - lastMove >= limitS * 1000) {
      return {
        state: toIdle(state),
        events: [{ type: 'tripEnded', t: now, endedAt: lastMove, reason: 'stopped' }],
      };
    }
  }
  return { state, events: [] };
}

/** Manual start (button / Shortcut). */
export function forceStart(state: DetectorState, t: number): StepResult {
  if (state.phase === 'driving') return { state, events: [] };
  return {
    state: {
      ...state,
      phase: 'driving',
      tripStartedAt: t,
      tripManual: true,
      tripHasMoved: false,
      lastMovingAt: t,
      candidateSince: null,
      buffer: [],
    },
    events: [{ type: 'tripStarted', t, manual: true, points: [] }],
  };
}

/** Manual stop. */
export function forceStop(state: DetectorState, t: number): StepResult {
  if (state.phase !== 'driving') return { state: toIdle(state), events: [] };
  const endedAt = state.tripHasMoved && state.lastMovingAt ? state.lastMovingAt : t;
  return { state: toIdle(state), events: [{ type: 'tripEnded', t, endedAt, reason: 'manual' }] };
}

function toIdle(state: DetectorState): DetectorState {
  return {
    ...state,
    phase: 'idle',
    candidateSince: null,
    fastSince: null,
    lastFastAt: null,
    buffer: [],
    tripStartedAt: null,
    tripManual: false,
    tripHasMoved: false,
  };
}

/** Convenience: feed many samples in order. */
export function processSamples(
  state: DetectorState,
  samples: LocationSample[],
  config: DetectorConfig = DEFAULT_DETECTOR_CONFIG,
): StepResult {
  let s = state;
  const events: DetectorEvent[] = [];
  for (const sample of samples) {
    const r = processSample(s, sample, config);
    s = r.state;
    events.push(...r.events);
  }
  return { state: s, events };
}
