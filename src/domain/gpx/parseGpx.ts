import type { LocationSample } from '../detection/types';

export class GpxError extends Error {}

/**
 * Minimal GPX 1.1 parser for <trkpt>/<rtept> (no XML library needed in React Native).
 * Reads lat, lon, <ele>, <time> and the optional <speed> extension (m/s).
 * Points without <time> get the previous time + 1 s.
 */
export function parseGpx(xml: string): LocationSample[] {
  const pointRe = /<(trkpt|rtept)\b([^>]*?)(\/>|>([\s\S]*?)<\/\1>)/g;
  const attr = (attrs: string, name: string) => {
    const m = new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`).exec(attrs);
    return m ? Number(m[1]) : NaN;
  };
  const tag = (body: string, name: string) => {
    const m = new RegExp(`<(?:\\w+:)?${name}>\\s*([^<]+?)\\s*</(?:\\w+:)?${name}>`).exec(body);
    return m ? m[1] : null;
  };

  const out: LocationSample[] = [];
  let m: RegExpExecArray | null;
  let lastT = 0;
  while ((m = pointRe.exec(xml))) {
    const lat = attr(m[2], 'lat');
    const lon = attr(m[2], 'lon');
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const body = m[4] ?? '';
    const time = tag(body, 'time');
    const parsedT = time ? Date.parse(time) : NaN;
    const t = Number.isFinite(parsedT) ? parsedT : lastT + 1000;
    lastT = t;
    const ele = tag(body, 'ele');
    const speed = tag(body, 'speed');
    out.push({
      t,
      lat,
      lon,
      altitude: ele != null ? Number(ele) : null,
      speed: speed != null && Number.isFinite(Number(speed)) ? Number(speed) : null,
      accuracy: 5,
    });
  }
  if (out.length < 2) throw new GpxError('GPX contains fewer than 2 track points');
  return out.sort((a, b) => a.t - b.t);
}

/** Shift a recorded track so it starts at `startAt` (keeps relative timing). */
export function retime(points: LocationSample[], startAt: number): LocationSample[] {
  const offset = startAt - points[0].t;
  return points.map((p) => ({ ...p, t: p.t + offset }));
}
