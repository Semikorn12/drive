import * as Crypto from 'expo-crypto';
import * as Location from 'expo-location';

import { kvGet, kvSet } from '../../data/kvRepository';
import { dbLogger } from '../../data/logRepository';
import { tripRepository } from '../../data/tripRepository';
import {
  beginCandidate,
  forceStart,
  forceStop,
  handleTime,
  processSample,
  setMotionHint,
  type StepResult,
} from '../../domain/detection/detector';
import { haversineM, msToKmh } from '../../domain/detection/geo';
import { initialDetectorState, type DetectorState, type LocationSample, type MotionHint } from '../../domain/detection/types';
import { applyEvents, type RecorderOutcome } from '../../domain/recording/tripRecorder';
import { batteryPercent } from './battery';
import { GEOFENCE_RADII_M } from './constants';
import { toMotionHint, toSample } from './convert';
import { useLive } from './liveStore';
import {
  isGeofenceActive,
  setParkingGeofence,
  startPreciseTracking,
  stopPreciseTracking,
  type TrackingMode,
} from './locationModes';

/**
 * The tracking engine: glue between OS callbacks (background tasks), the pure detector,
 * the recorder (SQLite) and the location power modes.
 *
 * Everything runs through one queue, so overlapping wake-ups can't corrupt the state.
 * The state is persisted after every step, because iOS may kill the app between wake-ups.
 */
interface PersistedState {
  detector: DetectorState;
  tripId: string | null;
  mode: TrackingMode;
  /** Consecutive wake-ups that were not a drive (grows the geofence). */
  misses: number;
  /** Rejected fixes since the last log line. */
  rejected: number;
}

const STATE_KEY = 'tracking.state.v1';
const fresh = (): PersistedState => ({ detector: initialDetectorState(), tripId: null, mode: 'idle', misses: 0, rejected: 0 });

let queue: Promise<unknown> = Promise.resolve();
let cached: PersistedState | null = null;
const outcomeListeners = new Set<(o: RecorderOutcome) => void>();

/** Phase 4 hooks in here (achievements, notifications). */
export function onTripOutcome(fn: (o: RecorderOutcome) => void) {
  outcomeListeners.add(fn);
  return () => outcomeListeners.delete(fn);
}

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch((e) => dbLogger.log('engine.error', { message: String(e?.message ?? e) }, 'error'));
  return run;
}

async function load(): Promise<PersistedState> {
  if (!cached) cached = { ...fresh(), ...((await kvGet<PersistedState>(STATE_KEY)) ?? {}) };
  return cached;
}

async function save(s: PersistedState) {
  cached = s;
  await kvSet(STATE_KEY, s);
}

/** Apply a detector step: store trip data, switch power mode, update UI. */
async function commit(s: PersistedState, r: StepResult, anchor: LocationSample | null): Promise<PersistedState> {
  const recorded = await applyEvents({ store: tripRepository, logger: dbLogger, newId: () => Crypto.randomUUID() }, s.tripId, r.events);
  let next: PersistedState = { ...s, detector: r.state, tripId: recorded.tripId };

  for (const o of recorded.outcomes) {
    if (o.type === 'saved' || o.type === 'started') next.misses = 0;
    outcomeListeners.forEach((fn) => fn(o));
  }
  if (r.events.some((e) => e.type === 'candidateTimeout')) next.misses = Math.min(next.misses + 1, GEOFENCE_RADII_M.length - 1);
  next.rejected += r.events.filter((e) => e.type === 'sampleRejected').length;

  const wanted: TrackingMode = r.state.phase;
  if (wanted !== s.mode) {
    next = await switchMode(next, wanted, anchor ?? r.state.last);
  }
  await save(next);
  publishLive(next);
  return next;
}

async function switchMode(s: PersistedState, mode: TrackingMode, anchor: LocationSample | null): Promise<PersistedState> {
  const battery = await batteryPercent();
  try {
    if (mode === 'idle') {
      await stopPreciseTracking();
      if (anchor) {
        const radius = GEOFENCE_RADII_M[s.misses];
        await setParkingGeofence(anchor.lat, anchor.lon, radius);
        dbLogger.log('mode.idle', { radius, battery, rejectedFixes: s.rejected });
      } else {
        dbLogger.log('mode.idle', { radius: null, battery, note: 'no position for geofence' }, 'warn');
      }
    } else {
      await startPreciseTracking(mode);
      dbLogger.log(`mode.${mode}`, { battery });
    }
  } catch (e) {
    dbLogger.log('mode.error', { mode, message: String((e as Error)?.message ?? e) }, 'error');
  }
  return { ...s, mode, rejected: mode === 'idle' ? 0 : s.rejected };
}

function publishLive(s: PersistedState) {
  const d = s.detector;
  useLive.getState().set({
    phase: d.phase,
    tripStartedAt: d.tripStartedAt,
    lastFixAt: d.last?.t ?? null,
    lastAccuracyM: d.last?.accuracy ?? null,
    ...(d.phase === 'driving' ? {} : { tripDistanceM: 0 }),
  });
}

// ---------------------------------------------------------------------------
// Entry points (called from background tasks, the UI and deep links)
// ---------------------------------------------------------------------------

export function handleLocations(locations: Location.LocationObject[]) {
  return enqueue(async () => {
    let s = await load();
    const samples = locations.map(toSample).sort((a, b) => a.t - b.t);
    for (const sample of samples) {
      const prev = s.detector.last;
      const r = processSample(s.detector, sample);
      s = await commit(s, r, sample);
      updateLiveSpeed(sample, prev, r.state.phase === 'driving');
    }
    if (s.detector.phase === 'candidate') maybeRefreshMotion();
  });
}

/**
 * While checking a possible drive, ask the motion coprocessor about once a minute
 * (the app is awake anyway because GPS runs). Runs outside the queue – it may take a moment.
 */
let lastMotionQuery = 0;
function maybeRefreshMotion() {
  const now = Date.now();
  if (now - lastMotionQuery < 60_000) return;
  lastMotionQuery = now;
  void currentMotionHint().then((hint) => {
    if (hint === 'unknown') return;
    void enqueue(async () => {
      const s = await load();
      if (hint !== s.detector.lastMotion) dbLogger.log('motion.hint', { hint });
      await save({ ...s, detector: setMotionHint(s.detector, hint, Date.now()) });
    });
  });
}

function updateLiveSpeed(sample: LocationSample, prev: LocationSample | null, driving: boolean) {
  const live = useLive.getState();
  const speed = sample.speed != null ? msToKmh(sample.speed) : null;
  let dist = live.tripDistanceM;
  if (driving && prev && (sample.speed == null || sample.speed > 0.6)) {
    dist += haversineM(prev.lat, prev.lon, sample.lat, sample.lon);
  }
  live.set({ speedKmh: speed, tripDistanceM: driving ? dist : 0 });
}

export function handleGeofenceExit() {
  return enqueue(async () => {
    const s = await load();
    dbLogger.log('geofence.exit', { battery: await batteryPercent() });
    let detector = s.detector;
    const hint = await currentMotionHint();
    if (hint !== 'unknown') {
      detector = setMotionHint(detector, hint, Date.now());
      dbLogger.log('motion.hint', { hint });
    }
    await commit(s, beginCandidate(detector, Date.now()), null);
  });
}

/** Lets time pass (foreground timer) – ends trips / candidates even if no fix arrives. */
export function tick() {
  return enqueue(async () => {
    const s = await load();
    if (s.detector.phase === 'idle') return;
    const r = handleTime(s.detector, Date.now());
    if (r.events.length) await commit(s, r, null);
  });
}

export function manualStart() {
  return enqueue(async () => {
    const s = await load();
    dbLogger.log('manual.start');
    await commit(s, forceStart(s.detector, Date.now()), null);
  });
}

export function manualStop() {
  return enqueue(async () => {
    const s = await load();
    dbLogger.log('manual.stop');
    await commit(s, forceStop(s.detector, Date.now()), null);
  });
}

/**
 * Called on app start (foreground): makes sure monitoring is armed.
 * If we are idle but no geofence exists (fresh install, after reboot), place one at the current position.
 */
export function ensureMonitoring() {
  return enqueue(async () => {
    const s = await load();
    publishLive(s);
    const bg = await Location.getBackgroundPermissionsAsync().catch(() => null);
    if (bg?.status !== 'granted') {
      dbLogger.log('monitoring.notArmed', { reason: 'no background permission' }, 'warn');
      return;
    }
    if (s.mode === 'idle') {
      if (!(await isGeofenceActive())) {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).catch(() => null);
        if (pos) {
          const anchor = toSample(pos);
          await setParkingGeofence(anchor.lat, anchor.lon, GEOFENCE_RADII_M[0]);
          dbLogger.log('monitoring.armed', { radius: GEOFENCE_RADII_M[0] });
        }
      }
    } else {
      // Re-assert the precise mode (e.g. after the user force-quit the app during a drive).
      await startPreciseTracking(s.mode).catch(() => {});
    }
  });
}

/** Full reset (used by "delete data"). */
export function resetEngine() {
  return enqueue(async () => {
    await stopPreciseTracking().catch(() => {});
    await save(fresh());
    publishLive(fresh());
  });
}

async function currentMotionHint(): Promise<MotionHint> {
  try {
    const perm = await Location.getMotionActivityPermissionsAsync();
    if (perm.status !== 'granted') return 'unknown';
    const activity = await Promise.race([
      Location.getMotionActivityAsync(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
    ]);
    return toMotionHint(activity);
  } catch {
    return 'unknown';
  }
}
