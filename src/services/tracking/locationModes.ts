import * as Location from 'expo-location';

import i18n from '../../i18n';
import { GEOFENCE_ID, GEOFENCE_TASK, LOCATION_TASK } from './constants';

/**
 * The three power modes:
 *  idle      – only a geofence around the parking spot (practically no battery)
 *  candidate – precise GPS for a few minutes to check if this is a drive
 *  driving   – best GPS while recording
 */
export type TrackingMode = 'idle' | 'candidate' | 'driving';

const foregroundService = () => ({
  notificationTitle: i18n.t('tracking.androidNotificationTitle'),
  notificationBody: i18n.t('tracking.androidNotificationBody'),
  notificationColor: '#0B1B4D',
  killServiceOnDestroy: false,
});

export async function startPreciseTracking(mode: 'candidate' | 'driving') {
  await Location.startLocationUpdatesAsync(LOCATION_TASK, {
    accuracy: mode === 'driving' ? Location.Accuracy.BestForNavigation : Location.Accuracy.High,
    distanceInterval: 0, // we need fixes while standing to detect the end of a trip
    activityType: Location.ActivityType.AutomotiveNavigation,
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: false,
    // Batch fixes in the background while driving → fewer JS wake-ups, less battery.
    deferredUpdatesInterval: mode === 'driving' ? 10_000 : 0,
    foregroundService: foregroundService(),
  });
}

export async function stopPreciseTracking() {
  if (await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK).catch(() => false)) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK);
  }
}

export async function setParkingGeofence(lat: number, lon: number, radius: number) {
  await Location.startGeofencingAsync(GEOFENCE_TASK, [
    { identifier: GEOFENCE_ID, latitude: lat, longitude: lon, radius, notifyOnEnter: false, notifyOnExit: true },
  ]);
}

export async function isGeofenceActive() {
  return Location.hasStartedGeofencingAsync(GEOFENCE_TASK).catch(() => false);
}

export async function isPreciseTrackingActive() {
  return Location.hasStartedLocationUpdatesAsync(LOCATION_TASK).catch(() => false);
}
