import { forceStart, forceStop, handleTime, processSample, processSamples } from './detector';
import { computeTripStats, judgeTrip } from './tripStats';
import { DEFAULT_DETECTOR_CONFIG, initialDetectorState, type DetectorEvent, type LocationSample } from './types';
import { generateTrack, SAMPLE_TRACKS, type SampleTrackId } from '../gpx/sampleTracks';
import { simulate } from '../simulation/simulate';

const track = (id: SampleTrackId) => SAMPLE_TRACKS.find((t) => t.id === id)!;
const count = (events: DetectorEvent[], type: DetectorEvent['type']) => events.filter((e) => e.type === type).length;
const tripPointsOf = (events: DetectorEvent[]) =>
  events.flatMap((e) => (e.type === 'tripStarted' || e.type === 'tripPoints' ? e.points : []));

/** Straight line north, one fix per second at the given speeds (km/h). */
function line(speedsKmh: number[], start = 0): LocationSample[] {
  let lat = 50;
  return speedsKmh.map((kmh, i) => {
    lat += kmh / 3.6 / 111_320;
    return { t: start + i * 1000, lat, lon: 8, speed: kmh / 3.6, accuracy: 5 };
  });
}
const repeat = (kmh: number, s: number) => Array<number>(s).fill(kmh);

describe('trip start', () => {
  it('does not start before 60 s above 15 km/h', () => {
    const { state, events } = processSamples(initialDetectorState(), line([...repeat(30, 59)]));
    expect(state.phase).toBe('candidate');
    expect(count(events, 'tripStarted')).toBe(0);
  });

  it('starts after 60 s above 15 km/h', () => {
    const { state, events } = processSamples(initialDetectorState(), line([...repeat(30, 62)]));
    expect(state.phase).toBe('driving');
    expect(count(events, 'tripStarted')).toBe(1);
  });

  it('a short traffic-light dip does not reset the start timer', () => {
    const { state } = processSamples(initialDetectorState(), line([...repeat(30, 35), ...repeat(0, 12), ...repeat(30, 30)]));
    expect(state.phase).toBe('driving');
  });

  it('a long stop resets the start timer', () => {
    const { state } = processSamples(initialDetectorState(), line([...repeat(30, 35), ...repeat(0, 40), ...repeat(30, 30)]));
    expect(state.phase).toBe('candidate');
  });

  it('walking speed never starts a trip and the candidate times out', () => {
    const { state, events } = simulate(generateTrack(track('walk')), { tickEverySecond: true });
    expect(count(events, 'tripStarted')).toBe(0);
    expect(count(events, 'candidateTimeout')).toBeGreaterThanOrEqual(1);
    expect(state.phase === 'idle' || state.phase === 'candidate').toBe(true);
  });

  it('a stale walking hint does not block a car trip', () => {
    const r = simulate(generateTrack(track('cityDrive')), { motion: 'walking', tickEverySecond: true });
    expect(count(r.events, 'tripStarted')).toBe(1);
  });

  it('car-like speed overrules a cycling hint (iOS sometimes misreads)', () => {
    const r = simulate(generateTrack(track('tunnel')), { motion: 'cycling', tickEverySecond: true });
    expect(count(r.events, 'tripStarted')).toBe(1);
  });

  it('cycling is vetoed by the motion hint', () => {
    const r = simulate(generateTrack(track('bike')), { motion: 'cycling', tickEverySecond: true });
    expect(count(r.events, 'tripStarted')).toBe(0);
  });

  it('without motion hint, fast cycling is (known limitation) detected as a trip', () => {
    const r = simulate(generateTrack(track('bike')), { tickEverySecond: true });
    expect(count(r.events, 'tripStarted')).toBe(1);
  });

  it('includes the seconds before reaching 15 km/h (leaving the parking spot)', () => {
    const samples = line([...repeat(0, 20), ...repeat(10, 20), ...repeat(40, 70)]);
    const { events } = processSamples(initialDetectorState(), samples);
    const started = events.find((e) => e.type === 'tripStarted');
    expect(started && started.type === 'tripStarted' && started.points.length).toBeGreaterThan(60);
  });
});

describe('trip end', () => {
  it('ends after 3 minutes standing, end time = last movement', () => {
    const samples = line([...repeat(50, 120), ...repeat(0, 200)]);
    const { state, events } = processSamples(initialDetectorState(), samples);
    expect(state.phase).toBe('idle');
    const ended = events.find((e) => e.type === 'tripEnded');
    expect(ended).toBeDefined();
    if (ended?.type === 'tripEnded') {
      expect(ended.reason).toBe('stopped');
      expect(ended.endedAt).toBeLessThanOrEqual(samples[121].t);
      expect(ended.endedAt).toBeGreaterThanOrEqual(samples[115].t);
    }
  });

  it('does not end after 2:59 standing', () => {
    const { state } = processSamples(initialDetectorState(), line([...repeat(50, 120), ...repeat(0, 178)]));
    expect(state.phase).toBe('driving');
  });

  it('a GPS gap (tunnel) does not end the trip even with a running timer', () => {
    const r = simulate(generateTrack(track('tunnel')), { tickEverySecond: true, tailSeconds: 10 });
    expect(count(r.events, 'tripStarted')).toBe(1);
    expect(count(r.events, 'tripEnded')).toBe(1);
    const pts = tripPointsOf(r.events);
    const stats = computeTripStats(pts)!;
    expect(stats.distanceM / 1000).toBeGreaterThan(12); // ~13 km at 80 km/h for 10 min
  });

  it('losing GPS completely ends the trip after the no-signal timeout', () => {
    const { state } = processSamples(initialDetectorState(), line(repeat(50, 120)));
    const last = 119_000;
    expect(handleTime(state, last + 10 * 60_000).state.phase).toBe('driving');
    expect(handleTime(state, last + 16 * 60_000).state.phase).toBe('idle');
  });
});

describe('sample tracks', () => {
  it('city drive: one trip, traffic lights do not split it, plausible numbers', () => {
    const r = simulate(generateTrack(track('cityDrive')), { motion: 'automotive', tickEverySecond: true });
    expect(count(r.events, 'tripStarted')).toBe(1);
    expect(count(r.events, 'tripEnded')).toBe(1);
    const ended = r.events.find((e) => e.type === 'tripEnded');
    const stats = computeTripStats(tripPointsOf(r.events), ended?.type === 'tripEnded' ? ended.endedAt : undefined)!;
    expect(stats.distanceM).toBeGreaterThan(8_000);
    expect(stats.distanceM).toBeLessThan(10_500);
    expect(stats.maxSpeedKmh).toBeGreaterThan(85);
    expect(stats.maxSpeedKmh).toBeLessThan(105);
    expect(judgeTrip(stats).keep).toBe(true);
  });

  it('short hop (< 500 m) is detected but judged too short', () => {
    const r = simulate(generateTrack(track('shortHop')), { tickEverySecond: true });
    expect(count(r.events, 'tripStarted')).toBe(1);
    const stats = computeTripStats(tripPointsOf(r.events))!;
    expect(stats.distanceM).toBeLessThan(DEFAULT_DETECTOR_CONFIG.minTripMeters);
    expect(judgeTrip(stats)).toEqual({ keep: false, reason: 'tooShort' });
  });
});

describe('bad GPS data', () => {
  it('rejects inaccurate fixes and position jumps', () => {
    const samples = line(repeat(50, 70));
    samples[65] = { ...samples[65], lat: samples[65].lat + 0.05, speed: null }; // 5.5 km jump
    samples[66] = { ...samples[66], accuracy: 500 };
    const { events } = processSamples(initialDetectorState(), samples);
    expect(events.filter((e) => e.type === 'sampleRejected').length).toBe(2);
  });

  it('rejects out-of-order fixes', () => {
    const s = line(repeat(30, 3));
    const r = processSamples(initialDetectorState(), [s[0], s[2], s[1]]);
    expect(r.events.some((e) => e.type === 'sampleRejected' && e.reason === 'outOfOrder')).toBe(true);
  });

  it('GPS wander while parked adds (almost) no distance', () => {
    const base = line(repeat(0, 600));
    let seed = 1;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5) * 0.0001; // ±5 m
    const noisy = base.map((p) => ({ ...p, lat: p.lat + rnd(), lon: p.lon + rnd(), speed: 0.1 }));
    expect(computeTripStats(noisy)!.distanceM).toBeLessThan(30);
  });

  it('max speed ignores a single GPS speed spike', () => {
    const samples = line(repeat(50, 30));
    samples[10] = { ...samples[10], speed: 70 }; // 252 km/h spike
    expect(computeTripStats(samples)!.maxSpeedKmh).toBeLessThan(55);
  });
});

describe('manual start / stop', () => {
  it('manual trip does not auto-end before it has moved', () => {
    let { state } = forceStart(initialDetectorState(), 0);
    state = processSamples(state, line(repeat(0, 400), 1000)).state;
    expect(state.phase).toBe('driving');
  });

  it('manual trip auto-ends after driving and 3 min standing', () => {
    let { state } = forceStart(initialDetectorState(), 0);
    state = processSamples(state, line([...repeat(40, 60), ...repeat(0, 200)], 1000)).state;
    expect(state.phase).toBe('idle');
  });

  it('manual stop ends the trip', () => {
    let { state } = forceStart(initialDetectorState(), 0);
    state = processSamples(state, line(repeat(40, 60), 1000)).state;
    const r = forceStop(state, 70_000);
    expect(r.state.phase).toBe('idle');
    expect(r.events[0]).toMatchObject({ type: 'tripEnded', reason: 'manual' });
  });

  it('a moving fix while idle begins a candidate, a standing one does not', () => {
    expect(processSample(initialDetectorState(), line([20])[0]).state.phase).toBe('candidate');
    expect(processSample(initialDetectorState(), line([0])[0]).state.phase).toBe('idle');
  });
});
