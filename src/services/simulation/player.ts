import * as Crypto from 'expo-crypto';

import { dbLogger } from '../../data/logRepository';
import { tripRepository } from '../../data/tripRepository';
import { handleTime, processSample, setMotionHint } from '../../domain/detection/detector';
import { haversineM, msToKmh } from '../../domain/detection/geo';
import { DEFAULT_DETECTOR_CONFIG, initialDetectorState, type LocationSample, type MotionHint } from '../../domain/detection/types';
import { retime } from '../../domain/gpx/parseGpx';
import { applyEvents, type RecorderOutcome } from '../../domain/recording/tripRecorder';
import { useLive } from '../tracking/liveStore';

export interface PlayOptions {
  name: string;
  /** Time-lapse factor (1 = real time). 0 = instant. */
  speed: number;
  motion?: MotionHint;
}

let cancelRequested = false;

export function stopSimulation() {
  cancelRequested = true;
}

/**
 * Plays a track through the REAL detector + recorder (trips are saved with source "simulation").
 * Runs independently of the real background detection.
 */
export async function playTrack(points: LocationSample[], opts: PlayOptions): Promise<RecorderOutcome[]> {
  if (useLive.getState().simulation.running) throw new Error('Simulation already running');
  cancelRequested = false;

  const duration = points[points.length - 1].t - points[0].t;
  const factor = opts.speed > 0 ? opts.speed : Infinity;
  const wallDuration = Number.isFinite(factor) ? duration / factor : 0;
  // Timestamps end "now" when playback ends → the trip shows up as just driven.
  const samples = retime(points, Date.now() + wallDuration - duration);
  const t0 = samples[0].t;

  const live = useLive.getState();
  live.set({ simulation: { running: true, trackName: opts.name, progress: 0 } });
  dbLogger.log('simulation.start', { name: opts.name, speed: opts.speed, points: samples.length });

  let state = initialDetectorState();
  let tripId: string | null = null;
  let lastHint = -Infinity;
  let dist = 0;
  let prev: LocationSample | null = null;
  const outcomes: RecorderOutcome[] = [];
  const ctx = { store: tripRepository, logger: dbLogger, newId: () => Crypto.randomUUID(), sourceOverride: 'simulation' as const };

  const startWall = Date.now();
  try {
    for (let i = 0; i < samples.length; i++) {
      if (cancelRequested) break;
      const s = samples[i];
      if (Number.isFinite(factor)) {
        const due = startWall + (s.t - t0) / factor;
        const wait = due - Date.now();
        if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      }
      if (opts.motion && s.t - lastHint >= 60_000) {
        state = setMotionHint(state, opts.motion, s.t);
        lastHint = s.t;
      }
      const r = processSample(state, s);
      state = r.state;
      const res = await applyEvents(ctx, tripId, r.events);
      tripId = res.tripId;
      outcomes.push(...res.outcomes);

      if (state.phase === 'driving' && prev) dist += haversineM(prev.lat, prev.lon, s.lat, s.lon);
      prev = s;
      if (i % 5 === 0 || i === samples.length - 1) {
        useLive.getState().set({
          phase: state.phase,
          speedKmh: s.speed != null ? msToKmh(s.speed) : null,
          tripStartedAt: state.tripStartedAt,
          tripDistanceM: state.phase === 'driving' ? dist : 0,
          lastFixAt: s.t,
          simulation: { running: true, trackName: opts.name, progress: (i + 1) / samples.length },
        });
      }
    }
    // Let the stop timer run out after the last fix.
    if (!cancelRequested && state.phase !== 'idle') {
      const r = handleTime(state, samples[samples.length - 1].t + (DEFAULT_DETECTOR_CONFIG.stopDurationS + 1) * 1000);
      state = r.state;
      const res = await applyEvents(ctx, tripId, r.events);
      tripId = res.tripId;
      outcomes.push(...res.outcomes);
    }
    // Cancelled mid-trip → remove the half trip.
    if (cancelRequested && tripId) await tripRepository.deleteTrip(tripId);
  } finally {
    dbLogger.log('simulation.end', {
      name: opts.name,
      cancelled: cancelRequested,
      outcomes: outcomes.map((o) => o.type).join(','),
    });
    useLive.getState().set({
      phase: 'idle',
      speedKmh: null,
      tripStartedAt: null,
      tripDistanceM: 0,
      simulation: { running: false, trackName: null, progress: 0 },
    });
  }
  return outcomes;
}
