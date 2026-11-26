/**
 * Web version of the power modes. A browser has no geofence and no background GPS,
 * so the GPS watch is switched on/off by the user (see webTracker.ts) and the
 * detector's mode changes are no-ops here.
 */
import { isWebTracking } from './webTracker';

export type TrackingMode = 'idle' | 'candidate' | 'driving';

export async function startPreciseTracking(_mode: 'candidate' | 'driving') {}
export async function stopPreciseTracking() {}
export async function setParkingGeofence(_lat: number, _lon: number, _radius: number) {}
export async function isGeofenceActive() {
  return false;
}
export async function isPreciseTrackingActive() {
  return isWebTracking();
}
