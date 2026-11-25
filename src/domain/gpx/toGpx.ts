import type { LocationSample } from '../detection/types';

/** Serialise samples to GPX 1.1 (used for sample tracks and, later, export). */
export function toGpx(points: LocationSample[], name = 'Dr!ve track'): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const pts = points
    .map(
      (p) =>
        `      <trkpt lat="${p.lat.toFixed(6)}" lon="${p.lon.toFixed(6)}">` +
        (p.altitude != null ? `<ele>${p.altitude.toFixed(1)}</ele>` : '') +
        `<time>${new Date(p.t).toISOString()}</time>` +
        (p.speed != null ? `<extensions><speed>${p.speed.toFixed(2)}</speed></extensions>` : '') +
        `</trkpt>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Dr!ve" xmlns="http://www.topografix.com/GPX/1/1">
  <trk><name>${esc(name)}</name><trkseg>
${pts}
  </trkseg></trk>
</gpx>
`;
}
