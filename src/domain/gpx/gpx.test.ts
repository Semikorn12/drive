import { generateTrack, SAMPLE_TRACKS } from './sampleTracks';
import { GpxError, parseGpx, retime } from './parseGpx';
import { toGpx } from './toGpx';

describe('GPX', () => {
  it('round-trips generated tracks', () => {
    const pts = generateTrack(SAMPLE_TRACKS[0]);
    const parsed = parseGpx(toGpx(pts));
    expect(parsed).toHaveLength(pts.length);
    expect(parsed[10].lat).toBeCloseTo(pts[10].lat, 5);
    expect(parsed[10].t).toBe(pts[10].t);
    expect(parsed[10].speed).toBeCloseTo(pts[10].speed!, 1);
  });

  it('parses common GPX from other apps (namespaces, self-closing, no speed)', () => {
    const xml = `<?xml version="1.0"?><gpx xmlns="http://www.topografix.com/GPX/1/1"><trk><trkseg>
      <trkpt lat='50.1' lon="8.6"><ele>100</ele><time>2026-01-01T10:00:00Z</time></trkpt>
      <trkpt lat="50.101" lon="8.6"><time>2026-01-01T10:00:10Z</time><extensions><gpxtpx:speed>11</gpxtpx:speed></extensions></trkpt>
      <trkpt lat="50.102" lon="8.6"/>
    </trkseg></trk></gpx>`;
    const pts = parseGpx(xml);
    expect(pts).toHaveLength(3);
    expect(pts[0].speed).toBeNull();
    expect(pts[1].speed).toBe(11);
  });

  it('rejects files without track points', () => {
    expect(() => parseGpx('<gpx></gpx>')).toThrow(GpxError);
  });

  it('retime keeps spacing', () => {
    const pts = retime(generateTrack(SAMPLE_TRACKS[0]), 1000);
    expect(pts[0].t).toBe(1000);
    expect(pts[5].t).toBe(6000);
  });
});
