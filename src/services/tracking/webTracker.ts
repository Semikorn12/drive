import type * as Location from 'expo-location';
import { create } from 'zustand';

/**
 * Browser GPS (web preview only). Uses the standard Geolocation API of the browser.
 * Positions are handed to the same detection engine as in the iPhone app and are stored
 * ONLY in this browser on this phone – nothing is sent anywhere.
 *
 * Limitation: browsers deliver positions only while the page is open and the screen is on.
 * We therefore ask the browser to keep the screen awake (Wake Lock) while tracking.
 */
export type WebTrackingStatus = 'off' | 'starting' | 'on' | 'denied' | 'unsupported' | 'error';

export const useWebTracking = create<{ status: WebTrackingStatus; screenLock: boolean }>()(() => ({
  status: 'off',
  screenLock: false,
}));

let watchId: number | null = null;
let wakeLock: { release: () => Promise<void> } | null = null;

export function isWebTracking() {
  return watchId != null;
}

type Nav = Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } };

async function lockScreen() {
  try {
    const nav = navigator as Nav;
    if (nav.wakeLock && document.visibilityState === 'visible') {
      wakeLock = await nav.wakeLock.request('screen');
      useWebTracking.setState({ screenLock: true });
    }
  } catch {
    useWebTracking.setState({ screenLock: false });
  }
}

function onVisibility() {
  // The wake lock is released when the page is hidden – take it again when it comes back.
  if (watchId != null && document.visibilityState === 'visible') void lockScreen();
}

function toLocationObject(p: GeolocationPosition): Location.LocationObject {
  return {
    timestamp: p.timestamp,
    coords: {
      latitude: p.coords.latitude,
      longitude: p.coords.longitude,
      altitude: p.coords.altitude,
      accuracy: p.coords.accuracy,
      altitudeAccuracy: p.coords.altitudeAccuracy,
      heading: p.coords.heading,
      speed: p.coords.speed,
    },
  };
}

/** Asks the browser for location permission and starts watching. */
export async function startWebTracking() {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    useWebTracking.setState({ status: 'unsupported' });
    return;
  }
  if (watchId != null) return;
  useWebTracking.setState({ status: 'starting' });
  // Imported lazily to avoid a circular import (engine → locationModes.web → webTracker).
  const { handleLocations } = await import('./engine');
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      useWebTracking.setState({ status: 'on' });
      void handleLocations([toLocationObject(pos)]);
    },
    (err) => {
      if (err.code === err.PERMISSION_DENIED) {
        stopWebTracking();
        useWebTracking.setState({ status: 'denied' });
      } else {
        useWebTracking.setState({ status: 'error' });
      }
    },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 30_000 },
  );
  document.addEventListener('visibilitychange', onVisibility);
  await lockScreen();
}

export function stopWebTracking() {
  if (watchId != null) navigator.geolocation.clearWatch(watchId);
  watchId = null;
  document.removeEventListener('visibilitychange', onVisibility);
  void wakeLock?.release().catch(() => {});
  wakeLock = null;
  useWebTracking.setState({ status: 'off', screenLock: false });
}
