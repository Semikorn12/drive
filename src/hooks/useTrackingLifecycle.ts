import { useEffect } from 'react';
import { AppState } from 'react-native';

import { ensureMonitoring, tick } from '../services/tracking/engine';
import { useLive } from '../services/tracking/liveStore';

/**
 * While the app is open: (re)arm background monitoring and advance the detector clock,
 * so trips end on time even if no new GPS fix arrives.
 */
export function useTrackingLifecycle(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    void ensureMonitoring();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') void ensureMonitoring();
    });
    const timer = setInterval(() => {
      if (AppState.currentState === 'active' && useLive.getState().phase !== 'idle') void tick();
    }, 5000);
    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, [enabled]);
}
