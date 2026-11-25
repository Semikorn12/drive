export const LOCATION_TASK = 'drive.location';
export const GEOFENCE_TASK = 'drive.geofence';
export const GEOFENCE_ID = 'drive.stationary';

/** Geofence radius around the parking spot. Grows after false alarms (walks) to save battery. */
export const GEOFENCE_RADII_M = [150, 300, 600, 1000];
