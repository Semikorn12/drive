import type { LocationSample } from '../domain/detection/types';
import type { TripStats } from '../domain/detection/tripStats';
import type { TripStore } from '../domain/recording/tripStore';
import type { Trip, TripChange, TripSource } from '../domain/trip';
import type { VehicleType } from '../domain/vehicle';
import { getDb } from './db';

interface TripRow {
  id: string;
  started_at: number;
  ended_at: number | null;
  distance_m: number;
  duration_s: number;
  avg_speed_kmh: number;
  max_speed_kmh: number;
  start_lat: number | null;
  start_lon: number | null;
  end_lat: number | null;
  end_lon: number | null;
  vehicle_type: string;
  source: string;
  status: string;
  category: string | null;
  purpose: string | null;
  odometer_start_km: number | null;
  odometer_end_km: number | null;
  created_at: number;
  updated_at: number;
}

const toTrip = (r: TripRow): Trip => ({
  id: r.id,
  startedAt: r.started_at,
  endedAt: r.ended_at,
  distanceM: r.distance_m,
  durationS: r.duration_s,
  avgSpeedKmh: r.avg_speed_kmh,
  maxSpeedKmh: r.max_speed_kmh,
  startLat: r.start_lat,
  startLon: r.start_lon,
  endLat: r.end_lat,
  endLon: r.end_lon,
  vehicleType: r.vehicle_type as Trip['vehicleType'],
  source: r.source as Trip['source'],
  status: r.status as Trip['status'],
  category: r.category as Trip['category'],
  purpose: r.purpose,
  odometerStartKm: r.odometer_start_km,
  odometerEndKm: r.odometer_end_km,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

/** SQLite implementation of the recorder's store + queries for the screens. */
export const tripRepository: TripStore & {
  listTrips(opts?: { limit?: number; offset?: number; since?: number; until?: number }): Promise<Trip[]>;
  countTrips(): Promise<number>;
  getChanges(tripId: string): Promise<TripChange[]>;
} = {
  async createTrip(input: { id: string; startedAt: number; source: TripSource; vehicleType: VehicleType }) {
    const db = await getDb();
    const now = Date.now();
    await db.runAsync(
      `INSERT INTO trips (id, started_at, vehicle_type, source, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'recording', ?, ?)`,
      input.id,
      input.startedAt,
      input.vehicleType,
      input.source,
      now,
      now,
    );
  },

  async appendPoints(tripId: string, points: LocationSample[]) {
    if (!points.length) return;
    const db = await getDb();
    await db.withTransactionAsync(async () => {
      const stmt = await db.prepareAsync(
        'INSERT INTO trip_points (trip_id, t, lat, lon, speed, accuracy, altitude, heading) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      );
      try {
        for (const p of points) {
          await stmt.executeAsync(tripId, p.t, p.lat, p.lon, p.speed, p.accuracy, p.altitude ?? null, p.heading ?? null);
        }
      } finally {
        await stmt.finalizeAsync();
      }
    });
  },

  async getPoints(tripId: string) {
    const db = await getDb();
    return db.getAllAsync<LocationSample>(
      'SELECT t, lat, lon, speed, accuracy, altitude, heading FROM trip_points WHERE trip_id = ? ORDER BY t',
      tripId,
    );
  },

  async finishTrip(tripId: string, s: TripStats, first: LocationSample, last: LocationSample) {
    const db = await getDb();
    await db.runAsync(
      `UPDATE trips SET status = 'completed', started_at = ?, ended_at = ?, distance_m = ?, duration_s = ?,
         avg_speed_kmh = ?, max_speed_kmh = ?, start_lat = ?, start_lon = ?, end_lat = ?, end_lon = ?, updated_at = ?
       WHERE id = ?`,
      s.startedAt,
      s.endedAt,
      s.distanceM,
      s.durationS,
      s.avgSpeedKmh,
      s.maxSpeedKmh,
      first.lat,
      first.lon,
      last.lat,
      last.lon,
      Date.now(),
      tripId,
    );
  },

  async deletePointsAfter(tripId: string, t: number) {
    const db = await getDb();
    await db.runAsync('DELETE FROM trip_points WHERE trip_id = ? AND t > ?', tripId, t);
  },

  async deleteTrip(tripId: string) {
    const db = await getDb();
    await db.runAsync('DELETE FROM trip_points WHERE trip_id = ?', tripId);
    await db.runAsync('DELETE FROM trips WHERE id = ?', tripId);
  },

  async getTrip(tripId: string) {
    const db = await getDb();
    const row = await db.getFirstAsync<TripRow>('SELECT * FROM trips WHERE id = ?', tripId);
    return row ? toTrip(row) : null;
  },

  async listTrips({ limit = 50, offset = 0, since, until } = {}) {
    const db = await getDb();
    const rows = await db.getAllAsync<TripRow>(
      `SELECT * FROM trips WHERE status = 'completed' AND started_at >= ? AND started_at < ?
       ORDER BY started_at DESC LIMIT ? OFFSET ?`,
      since ?? 0,
      until ?? Number.MAX_SAFE_INTEGER,
      limit,
      offset,
    );
    return rows.map(toTrip);
  },

  async countTrips() {
    const db = await getDb();
    const r = await db.getFirstAsync<{ n: number }>("SELECT COUNT(*) AS n FROM trips WHERE status = 'completed'");
    return r?.n ?? 0;
  },

  async getChanges(tripId: string) {
    const db = await getDb();
    const rows = await db.getAllAsync<{
      id: number;
      trip_id: string;
      changed_at: number;
      field: string;
      old_value: string | null;
      new_value: string | null;
    }>('SELECT * FROM trip_changes WHERE trip_id = ? ORDER BY changed_at', tripId);
    return rows.map((r) => ({
      id: r.id,
      tripId: r.trip_id,
      changedAt: r.changed_at,
      field: r.field,
      oldValue: r.old_value,
      newValue: r.new_value,
    }));
  },
};
