import * as Battery from 'expo-battery';

/** Battery level 0–100 or null. Logged at every mode change to estimate consumption. */
export async function batteryPercent(): Promise<number | null> {
  try {
    const level = await Battery.getBatteryLevelAsync();
    return level >= 0 ? Math.round(level * 100) : null;
  } catch {
    return null;
  }
}
