import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

export type PermState = 'granted' | 'denied' | 'undetermined' | 'limited';

export interface PermissionsSnapshot {
  locationForeground: PermState;
  /** "Always" on iOS. */
  locationBackground: PermState;
  motion: PermState;
  notifications: PermState;
  preciseLocation: boolean;
}

const norm = (s: string | undefined): PermState =>
  s === 'granted' ? 'granted' : s === 'denied' ? 'denied' : s === 'limited' ? 'limited' : 'undetermined';

export async function readPermissions(): Promise<PermissionsSnapshot> {
  const [fg, bg, motion, notif] = await Promise.all([
    Location.getForegroundPermissionsAsync().catch(() => null),
    Location.getBackgroundPermissionsAsync().catch(() => null),
    Location.getMotionActivityPermissionsAsync().catch(() => null),
    Notifications.getPermissionsAsync().catch(() => null),
  ]);
  return {
    locationForeground: norm(fg?.status),
    locationBackground: norm(bg?.status),
    motion: norm(motion?.status),
    notifications: norm(notif?.status),
    preciseLocation: Platform.OS === 'ios' ? fg?.ios?.accuracy !== 'reduced' : fg?.android?.accuracy !== 'coarse',
  };
}

/**
 * iOS: first "While Using", then the upgrade to "Always".
 * iOS may show the "Always" choice only later (it decides itself) – the app must cope with "While Using".
 */
export async function requestLocation(): Promise<PermState> {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== 'granted') return norm(fg.status);
  if (Platform.OS === 'web') return 'granted'; // browsers have no "Always" level
  const bg = await Location.requestBackgroundPermissionsAsync();
  return bg.status === 'granted' ? 'granted' : 'limited';
}

export async function requestMotion(): Promise<PermState> {
  const r = await Location.requestMotionActivityPermissionsAsync().catch(() => null);
  return norm(r?.status);
}

export async function requestNotifications(): Promise<PermState> {
  const r = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: true },
  });
  return norm(r.status);
}

export function openAppSettings() {
  return Linking.openSettings();
}
