import type { LocationSample } from '../detection/types';
import { generateTrack, SAMPLE_TRACKS } from '../gpx/sampleTracks';
import { cleanRoute, downsample, projectRoute, speedSeries, toSvgPath } from './route';

const p = (t: number, lat: number, lon: number, speed: number | null = null, accuracy: number | null = 5): LocationSample => ({
  t,
  lat,
  lon,
  speed,
  accuracy,
});

describe('route', () => {
  it('drops inaccurate fixes and GPS jumps', () => {
    const pts = [
      p(0, 50, 8),
      p(1000, 50.0001, 8, null, 500), // inaccurate
      p(2000, 50.0002, 8),
      p(3000, 51, 8), // ~110 km in 1 s → jump
      p(4000, 50.0004, 8),
    ];
    expect(cleanRoute(pts).map((x) => x.t)).toEqual([0, 2000, 4000]);
  });

  it('downsamples but keeps first and last', () => {
    const items = Array.from({ length: 1000 }, (_, i) => i);
    const d = downsample(items, 10);
    expect(d).toHaveLength(10);
    expect(d[0]).toBe(0);
    expect(d[9]).toBe(999);
    expect(downsample([1, 2, 3], 10)).toEqual([1, 2, 3]);
  });

  it('fits the route into the box, keeping the aspect ratio', () => {
    // Straight line north → tall shape, should be centred horizontally.
    const pts = Array.from({ length: 20 }, (_, i) => p(i * 1000, 50 + i * 0.0002, 8));
    const r = projectRoute(pts, 300, 200, 20);
    for (const q of r.points) {
      expect(q.x).toBeGreaterThanOrEqual(19.9);
      expect(q.x).toBeLessThanOrEqual(280.1);
      expect(q.y).toBeGreaterThanOrEqual(19.9);
      expect(q.y).toBeLessThanOrEqual(180.1);
    }
    expect(r.start!.x).toBeCloseTo(150, 1);
    // North is up: the start (south) is at the bottom.
    expect(r.start!.y).toBeGreaterThan(r.end!.y);
    expect(r.end!.y).toBeCloseTo(20, 1);
  });

  it('handles empty and single-point routes', () => {
    expect(projectRoute([], 100, 100).points).toEqual([]);
    const one = projectRoute([p(0, 50, 8)], 100, 100);
    expect(one.start).toEqual({ x: 50, y: 50 });
    expect(toSvgPath(one.points)).toBe('M50.0 50.0');
  });

  it('builds a speed series from a sample drive', () => {
    const def = SAMPLE_TRACKS.find((s) => s.id === 'cityDrive')!;
    const series = speedSeries(generateTrack(def), 40);
    expect(series.length).toBeGreaterThan(10);
    expect(series.length).toBeLessThanOrEqual(40);
    for (let i = 1; i < series.length; i++) expect(series[i].t).toBeGreaterThan(series[i - 1].t);
    const max = Math.max(...series.map((s) => s.kmh));
    expect(max).toBeGreaterThan(20);
    expect(max).toBeLessThan(150);
  });

  it('speed series derives speed from positions when GPS speed is missing', () => {
    // ~11.1 m per second → ~40 km/h
    const pts = Array.from({ length: 30 }, (_, i) => p(i * 1000, 50 + i * 0.0001, 8));
    const s = speedSeries(pts, 5);
    expect(s).toHaveLength(5);
    expect(s[2].kmh).toBeCloseTo(40, 0);
  });
});
