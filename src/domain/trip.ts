import type { VehicleType } from './vehicle';

export type TripSource = 'auto' | 'manual' | 'simulation';
export type TripStatus = 'recording' | 'completed';

/** Prepared for the later tax logbook (Fahrtenbuch). Not used in the MVP UI. */
export type TripCategory = 'private' | 'business' | 'commute';

export interface Trip {
  id: string;
  startedAt: number; // ms
  endedAt: number | null;
  distanceM: number;
  durationS: number;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
  startLat: number | null;
  startLon: number | null;
  endLat: number | null;
  endLon: number | null;
  vehicleType: VehicleType;
  source: TripSource;
  status: TripStatus;
  // --- Logbook (later) ---
  category: TripCategory | null;
  purpose: string | null;
  odometerStartKm: number | null;
  odometerEndKm: number | null;
  createdAt: number;
  updatedAt: number;
}

/** One logged change of a trip field (audit trail for the later logbook). */
export interface TripChange {
  id: number;
  tripId: string;
  changedAt: number;
  field: string;
  oldValue: string | null;
  newValue: string | null;
}
