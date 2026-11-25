import type { LocationSample } from '../detection/types';

/**
 * Synthetic test tracks (1 fix per second) for the simulation mode and unit tests.
 * Each segment: duration in s, target speed in km/h. Speeds ramp smoothly; small GPS noise is added.
 * Positions are made up (start near a fictional point), not anybody's real route.
 */
interface Segment {
  seconds: number;
  kmh: number;
}

export type SampleTrackId = 'cityDrive' | 'shortHop' | 'walk' | 'bike' | 'tunnel';

export interface SampleTrack {
  id: SampleTrackId;
  /** i18n key suffix: diagnostics.samples.<id> */
  expected: 'trip' | 'discarded' | 'none';
  /** Motion hint the simulator reports (as iOS would). */
  motion: 'automotive' | 'walking' | 'cycling';
  segments: Segment[];
  /** Seconds without any GPS fix inside the track: [startSecond, length]. */
  gap?: [number, number];
}

export const SAMPLE_TRACKS: SampleTrack[] = [
  {
    id: 'cityDrive',
    expected: 'trip',
    motion: 'automotive',
    segments: [
      { seconds: 40, kmh: 4 }, // walk to the car
      { seconds: 30, kmh: 0 }, // get in
      { seconds: 120, kmh: 45 },
      { seconds: 35, kmh: 0 }, // traffic light
      { seconds: 240, kmh: 50 },
      { seconds: 150, kmh: 95 },
      { seconds: 25, kmh: 0 }, // traffic light
      { seconds: 90, kmh: 35 },
      { seconds: 240, kmh: 0 }, // parked → trip ends after 3 min
    ],
  },
  {
    id: 'shortHop',
    expected: 'discarded',
    motion: 'automotive',
    segments: [
      { seconds: 10, kmh: 0 },
      { seconds: 75, kmh: 18 }, // ~375 m → below 500 m
      { seconds: 220, kmh: 0 },
    ],
  },
  {
    id: 'walk',
    expected: 'none',
    motion: 'walking',
    segments: [{ seconds: 360, kmh: 5 }],
  },
  {
    id: 'bike',
    expected: 'none',
    motion: 'cycling',
    segments: [
      { seconds: 420, kmh: 22 },
      { seconds: 200, kmh: 0 },
    ],
  },
  {
    id: 'tunnel',
    expected: 'trip',
    motion: 'automotive',
    segments: [
      { seconds: 20, kmh: 0 },
      { seconds: 600, kmh: 80 },
      { seconds: 220, kmh: 0 },
    ],
    gap: [250, 200], // 200 s without GPS while driving – must NOT end the trip
  },
];

/** Deterministic pseudo random numbers (same track every time). */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const M_PER_DEG_LAT = 111_320;

export function generateTrack(track: SampleTrack, startAt = Date.UTC(2026, 0, 5, 7, 30)): LocationSample[] {
  const rand = rng(track.id.length * 7919);
  const out: LocationSample[] = [];
  let lat = 50.1;
  let lon = 8.6;
  let heading = 70; // degrees
  let v = 0; // m/s
  let t = 0;
  for (const seg of track.segments) {
    const target = seg.kmh / 3.6;
    for (let i = 0; i < seg.seconds; i++, t++) {
      // smooth acceleration (max ~2.5 m/s²)
      v += Math.max(-3, Math.min(2.5, target - v));
      if (target === 0 && v < 0.3) v = 0;
      heading += Math.sin(t / 40) * 1.5;
      const d = v; // metres in this second
      lat += (d * Math.cos((heading * Math.PI) / 180)) / M_PER_DEG_LAT;
      lon += (d * Math.sin((heading * Math.PI) / 180)) / (M_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180));
      if (track.gap && t >= track.gap[0] && t < track.gap[0] + track.gap[1]) continue;
      const noise = () => (rand() - 0.5) * 6; // ±3 m
      out.push({
        t: startAt + t * 1000,
        lat: lat + noise() / M_PER_DEG_LAT,
        lon: lon + noise() / (M_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180)),
        speed: Math.max(0, v + (rand() - 0.5) * 0.6),
        accuracy: 5 + rand() * 6,
        altitude: 120 + Math.sin(t / 90) * 8,
      });
    }
  }
  return out;
}
