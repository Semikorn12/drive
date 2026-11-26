import { effectiveSpeed } from '../detection/detector';
import { haversineM, msToKmh } from '../detection/geo';
import { DEFAULT_DETECTOR_CONFIG, type LocationSample } from '../detection/types';

export interface XY {
  x: number;
  y: number;
}

export interface ProjectedRoute {
  points: XY[];
  start: XY | null;
  end: XY | null;
}

/** Usable fixes only: accurate enough, sorted by time, without implausible GPS jumps. */
export function cleanRoute(points: LocationSample[], config = DEFAULT_DETECTOR_CONFIG): LocationSample[] {
  const sorted = points
    .filter((p) => p.accuracy == null || p.accuracy <= config.maxAccuracyM)
    .slice()
    .sort((a, b) => a.t - b.t);
  const out: LocationSample[] = [];
  for (const p of sorted) {
    const prev = out[out.length - 1];
    if (prev) {
      const dt = (p.t - prev.t) / 1000;
      if (dt <= 0) continue;
      if (msToKmh(haversineM(prev.lat, prev.lon, p.lat, p.lon) / dt) > config.maxPlausibleKmh) continue;
    }
    out.push(p);
  }
  return out;
}

/** Keep at most `max` points (evenly spaced), always including the first and last one. */
export function downsample<T>(items: T[], max: number): T[] {
  if (items.length <= max || max < 2) return items;
  const step = (items.length - 1) / (max - 1);
  return Array.from({ length: max }, (_, i) => items[Math.round(i * step)]);
}

/**
 * Fit a route into a width × height box (SVG coordinates, y pointing down).
 * Equirectangular projection around the route's mean latitude keeps the shape true
 * for trip-sized areas; the aspect ratio is preserved and the route is centred.
 */
export function projectRoute(
  points: LocationSample[],
  width: number,
  height: number,
  padding = 16,
  maxPoints = 400,
): ProjectedRoute {
  const pts = downsample(cleanRoute(points), maxPoints);
  if (pts.length === 0) return { points: [], start: null, end: null };

  const lat0 = (pts.reduce((s, p) => s + p.lat, 0) / pts.length) * (Math.PI / 180);
  const raw = pts.map((p) => ({ x: p.lon * Math.cos(lat0), y: -p.lat }));
  const xs = raw.map((p) => p.x);
  const ys = raw.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = maxX - minX;
  const spanY = maxY - minY;
  const innerW = Math.max(width - 2 * padding, 1);
  const innerH = Math.max(height - 2 * padding, 1);
  const span = Math.max(spanX / innerW, spanY / innerH);
  const scale = span > 0 ? 1 / span : 0;
  const offX = (width - spanX * scale) / 2;
  const offY = (height - spanY * scale) / 2;

  const projected = raw.map((p) => ({ x: offX + (p.x - minX) * scale, y: offY + (p.y - minY) * scale }));
  return { points: projected, start: projected[0], end: projected[projected.length - 1] };
}

/** "M x y L x y …" path for SVG. */
export function toSvgPath(points: XY[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
}

export interface SpeedPoint {
  /** Seconds since the first fix. */
  t: number;
  kmh: number;
}

/**
 * Speed over time for the chart: per-fix speed, averaged into at most `buckets` equal time slots.
 * Empty slots (tunnel, no GPS) are left out, so the line simply connects across the gap.
 */
export function speedSeries(points: LocationSample[], buckets = 60): SpeedPoint[] {
  const pts = cleanRoute(points);
  if (pts.length < 2) return [];
  const t0 = pts[0].t;
  const total = (pts[pts.length - 1].t - t0) / 1000;
  if (total <= 0) return [];

  const n = Math.max(1, Math.min(buckets, pts.length));
  const sums = new Array<number>(n).fill(0);
  const counts = new Array<number>(n).fill(0);
  let prev: LocationSample | null = null;
  for (const p of pts) {
    const v = effectiveSpeed(p, prev);
    prev = p;
    if (v == null) continue;
    const kmh = Math.min(msToKmh(v), DEFAULT_DETECTOR_CONFIG.maxPlausibleKmh);
    const i = Math.min(n - 1, Math.floor((((p.t - t0) / 1000) / total) * n));
    sums[i] += kmh;
    counts[i] += 1;
  }
  const out: SpeedPoint[] = [];
  for (let i = 0; i < n; i++) {
    if (counts[i] === 0) continue;
    out.push({ t: ((i + 0.5) / n) * total, kmh: sums[i] / counts[i] });
  }
  return out;
}
