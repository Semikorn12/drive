/**
 * Database schema + migrations. Each entry upgrades `PRAGMA user_version` by one.
 * NEVER edit an existing migration after it shipped – add a new one.
 */
export const MIGRATIONS: string[] = [
  // v1 – trips, points, change log (for the later logbook), detection log, key-value
  `
  CREATE TABLE trips (
    id                TEXT PRIMARY KEY NOT NULL,
    started_at        INTEGER NOT NULL,
    ended_at          INTEGER,
    distance_m        REAL NOT NULL DEFAULT 0,
    duration_s        INTEGER NOT NULL DEFAULT 0,
    avg_speed_kmh     REAL NOT NULL DEFAULT 0,
    max_speed_kmh     REAL NOT NULL DEFAULT 0,
    start_lat         REAL,
    start_lon         REAL,
    end_lat           REAL,
    end_lon           REAL,
    vehicle_type      TEXT NOT NULL DEFAULT 'car',
    source            TEXT NOT NULL DEFAULT 'auto',
    status            TEXT NOT NULL DEFAULT 'recording',
    -- prepared for the logbook (Fahrtenbuch), unused in the MVP
    category          TEXT,
    purpose           TEXT,
    odometer_start_km REAL,
    odometer_end_km   REAL,
    created_at        INTEGER NOT NULL,
    updated_at        INTEGER NOT NULL
  );
  CREATE INDEX idx_trips_started ON trips (started_at DESC);

  CREATE TABLE trip_points (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id   TEXT NOT NULL REFERENCES trips (id) ON DELETE CASCADE,
    t         INTEGER NOT NULL,
    lat       REAL NOT NULL,
    lon       REAL NOT NULL,
    speed     REAL,
    accuracy  REAL,
    altitude  REAL,
    heading   REAL
  );
  CREATE INDEX idx_points_trip_t ON trip_points (trip_id, t);

  -- Every change of a logbook-relevant field of a COMPLETED trip is recorded automatically.
  CREATE TABLE trip_changes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id    TEXT NOT NULL,
    changed_at INTEGER NOT NULL,
    field      TEXT NOT NULL,
    old_value  TEXT,
    new_value  TEXT
  );
  CREATE INDEX idx_changes_trip ON trip_changes (trip_id, changed_at);

  CREATE TRIGGER trg_trip_changes AFTER UPDATE ON trips
  WHEN OLD.status = 'completed'
  BEGIN
    INSERT INTO trip_changes (trip_id, changed_at, field, old_value, new_value)
      SELECT NEW.id, NEW.updated_at, 'category', OLD.category, NEW.category WHERE OLD.category IS NOT NEW.category;
    INSERT INTO trip_changes (trip_id, changed_at, field, old_value, new_value)
      SELECT NEW.id, NEW.updated_at, 'purpose', OLD.purpose, NEW.purpose WHERE OLD.purpose IS NOT NEW.purpose;
    INSERT INTO trip_changes (trip_id, changed_at, field, old_value, new_value)
      SELECT NEW.id, NEW.updated_at, 'odometer_start_km', OLD.odometer_start_km, NEW.odometer_start_km
      WHERE OLD.odometer_start_km IS NOT NEW.odometer_start_km;
    INSERT INTO trip_changes (trip_id, changed_at, field, old_value, new_value)
      SELECT NEW.id, NEW.updated_at, 'odometer_end_km', OLD.odometer_end_km, NEW.odometer_end_km
      WHERE OLD.odometer_end_km IS NOT NEW.odometer_end_km;
    INSERT INTO trip_changes (trip_id, changed_at, field, old_value, new_value)
      SELECT NEW.id, NEW.updated_at, 'distance_m', OLD.distance_m, NEW.distance_m WHERE OLD.distance_m IS NOT NEW.distance_m;
    INSERT INTO trip_changes (trip_id, changed_at, field, old_value, new_value)
      SELECT NEW.id, NEW.updated_at, 'vehicle_type', OLD.vehicle_type, NEW.vehicle_type WHERE OLD.vehicle_type IS NOT NEW.vehicle_type;
  END;

  CREATE TABLE detection_log (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    t      INTEGER NOT NULL,
    level  TEXT NOT NULL,
    event  TEXT NOT NULL,
    data   TEXT
  );

  CREATE TABLE kv (
    key   TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
  `,
];

export const DB_NAME = 'drive.db';
