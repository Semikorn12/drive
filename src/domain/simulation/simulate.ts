import { handleTime, processSample, setMotionHint } from '../detection/detector';
import {
  DEFAULT_DETECTOR_CONFIG,
  initialDetectorState,
  type DetectorConfig,
  type DetectorEvent,
  type DetectorState,
  type LocationSample,
  type MotionHint,
} from '../detection/types';

export interface SimulationOptions {
  motion?: MotionHint;
  config?: DetectorConfig;
  /** Also advance time every second between fixes (like a foreground timer). */
  tickEverySecond?: boolean;
  /** Extra seconds after the last fix (lets the stop timer run out). */
  tailSeconds?: number;
}

/** Runs the detector over a whole track instantly. Used by tests and "instant" simulation. */
export function simulate(samples: LocationSample[], opts: SimulationOptions = {}) {
  const config = opts.config ?? DEFAULT_DETECTOR_CONFIG;
  let state: DetectorState = initialDetectorState();
  let lastHintAt = -Infinity;
  const events: DetectorEvent[] = [];
  let prevT: number | null = null;

  const push = (r: { state: DetectorState; events: DetectorEvent[] }) => {
    state = r.state;
    events.push(...r.events);
  };

  for (const s of samples) {
    // The OS reports the activity roughly every minute while the app is awake.
    if (opts.motion && s.t - lastHintAt >= 60_000) {
      state = setMotionHint(state, opts.motion, s.t);
      lastHintAt = s.t;
    }
    if (opts.tickEverySecond && prevT != null) {
      for (let t = prevT + 1000; t < s.t; t += 1000) push(handleTime(state, t, config));
    }
    push(processSample(state, s, config));
    prevT = s.t;
  }
  if (prevT != null && opts.tailSeconds) {
    for (let t = prevT + 1000; t <= prevT + opts.tailSeconds * 1000; t += 1000) push(handleTime(state, t, config));
  }
  return { state, events };
}
