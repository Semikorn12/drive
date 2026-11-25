import type { LocationSample } from '../detection/types';
import type { TripStats } from '../detection/tripStats';
import type { Trip, TripSource } from '../trip';
import type { VehicleType } from '../vehicle';

/** Storage used by the recorder. SQLite in the app, in-memory in tests. */
export interface TripStore {
  createTrip(input: { id: string; startedAt: number; source: TripSource; vehicleType: VehicleType }): Promise<void>;
  appendPoints(tripId: string, points: LocationSample[]): Promise<void>;
  getPoints(tripId: string): Promise<LocationSample[]>;
  finishTrip(tripId: string, stats: TripStats, first: LocationSample, last: LocationSample): Promise<void>;
  deletePointsAfter(tripId: string, t: number): Promise<void>;
  deleteTrip(tripId: string): Promise<void>;
  getTrip(tripId: string): Promise<Trip | null>;
}

export type LogLevel = 'info' | 'warn' | 'error';
export interface DetectionLogger {
  log(event: string, data?: Record<string, unknown>, level?: LogLevel): void;
}

/** Simple in-memory store (unit tests, web preview). */
export class MemoryTripStore implements TripStore {
  trips = new Map<string, Trip>();
  points = new Map<string, LocationSample[]>();

  async createTrip(input: { id: string; startedAt: number; source: TripSource; vehicleType: VehicleType }) {
    const now = Date.now();
    this.trips.set(input.id, {
      id: input.id,
      startedAt: input.startedAt,
      endedAt: null,
      distanceM: 0,
      durationS: 0,
      avgSpeedKmh: 0,
      maxSpeedKmh: 0,
      startLat: null,
      startLon: null,
      endLat: null,
      endLon: null,
      vehicleType: input.vehicleType,
      source: input.source,
      status: 'recording',
      category: null,
      purpose: null,
      odometerStartKm: null,
      odometerEndKm: null,
      createdAt: now,
      updatedAt: now,
    });
    this.points.set(input.id, []);
  }
  async appendPoints(tripId: string, points: LocationSample[]) {
    this.points.get(tripId)?.push(...points);
  }
  async getPoints(tripId: string) {
    return [...(this.points.get(tripId) ?? [])];
  }
  async finishTrip(tripId: string, stats: TripStats, first: LocationSample, last: LocationSample) {
    const trip = this.trips.get(tripId);
    if (!trip) return;
    Object.assign(trip, {
      status: 'completed',
      startedAt: stats.startedAt,
      endedAt: stats.endedAt,
      distanceM: stats.distanceM,
      durationS: stats.durationS,
      avgSpeedKmh: stats.avgSpeedKmh,
      maxSpeedKmh: stats.maxSpeedKmh,
      startLat: first.lat,
      startLon: first.lon,
      endLat: last.lat,
      endLon: last.lon,
      updatedAt: Date.now(),
    });
  }
  async deletePointsAfter(tripId: string, t: number) {
    this.points.set(tripId, (this.points.get(tripId) ?? []).filter((p) => p.t <= t));
  }
  async deleteTrip(tripId: string) {
    this.trips.delete(tripId);
    this.points.delete(tripId);
  }
  async getTrip(tripId: string) {
    return this.trips.get(tripId) ?? null;
  }
}
