/**
 * Feature flags. Everything that is prepared but NOT part of the MVP is switched off here.
 * Turning a flag on must never require a refactor – only implementing the feature.
 */
export const featureFlags = {
  /** Ad banner placeholder in the trip list (phase: later). */
  ads: false,
  /** Paid subscription (later). */
  subscription: false,
  /** Tax logbook / Fahrtenbuch (later). */
  logbook: false,
  /** Cloud backup of trips (later – trips stay on device in MVP). */
  cloudBackup: false,
  /** Vehicle types the user may pick. MVP: car only. */
  vehicleTypes: ['car'] as const,
} as const;

export type FeatureFlags = typeof featureFlags;
