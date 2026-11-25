import { create } from 'zustand';

import type { DetectorPhase } from '../../domain/detection/types';

/** Live, non-persisted tracking info for the UI (tacho, diagnostics). */
export interface LiveState {
  phase: DetectorPhase;
  speedKmh: number | null;
  tripStartedAt: number | null;
  tripDistanceM: number;
  lastFixAt: number | null;
  lastAccuracyM: number | null;
  simulation: { running: boolean; trackName: string | null; progress: number };
  set: (p: Partial<Omit<LiveState, 'set'>>) => void;
}

export const useLive = create<LiveState>()((set) => ({
  phase: 'idle',
  speedKmh: null,
  tripStartedAt: null,
  tripDistanceM: 0,
  lastFixAt: null,
  lastAccuracyM: null,
  simulation: { running: false, trackName: null, progress: 0 },
  set: (p) => set(p),
}));
