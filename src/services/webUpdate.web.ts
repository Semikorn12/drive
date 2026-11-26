import { saveNow } from '../data/memoryBackend';
import { useLive } from './tracking/liveStore';
import { useWebTracking } from './tracking/webTracker';

/** Set by scripts/build-web.mjs. Missing in `expo start` → no checks during development. */
const BUILD_ID = process.env.EXPO_PUBLIC_BUILD_ID;
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL ?? '';
const TRIED_KEY = 'drive.updateTried';
const MIN_INTERVAL_MS = 60_000;

let lastCheck = 0;

/** Never reload while something is running – that would stop detection or lose a live trip. */
function busy(): boolean {
  const status = useWebTracking.getState().status;
  return useLive.getState().phase !== 'idle' || status === 'on' || status === 'starting';
}

/**
 * GitHub Pages lets browsers cache index.html for up to 10 minutes, so after a deploy Safari
 * keeps showing the old version. We ask the server (bypassing the cache) which build is live
 * and, if it's newer, reload once with ?v=<build> – a new URL Safari has never cached.
 */
export async function checkForWebUpdate(): Promise<void> {
  if (!BUILD_ID || typeof window === 'undefined' || busy()) return;
  const now = Date.now();
  if (now - lastCheck < MIN_INTERVAL_MS) return;
  lastCheck = now;
  try {
    const res = await fetch(`${BASE_URL}/version.json?t=${now}`, { cache: 'no-store' });
    if (!res.ok) return;
    const { build } = (await res.json()) as { build?: string };
    if (!build || build === BUILD_ID || busy()) return;
    // Only one attempt per new build and tab, so a stubborn cache can never cause a reload loop.
    if (sessionStorage.getItem(TRIED_KEY) === build) return;
    sessionStorage.setItem(TRIED_KEY, build);
    saveNow();
    const url = new URL(window.location.href);
    url.searchParams.set('v', build);
    window.location.replace(url.toString());
  } catch {
    // offline or blocked – try again next time
  }
}

/** Check on start and whenever the page comes back to the foreground. Returns a cleanup. */
export function startWebUpdateChecks(): () => void {
  if (!BUILD_ID || typeof window === 'undefined') return () => {};
  // Tidy the address bar after a successful update reload.
  const url = new URL(window.location.href);
  if (url.searchParams.get('v') === BUILD_ID) {
    url.searchParams.delete('v');
    window.history.replaceState(window.history.state, '', url.toString());
  }
  void checkForWebUpdate();
  const onVisible = () => {
    if (document.visibilityState === 'visible') void checkForWebUpdate();
  };
  document.addEventListener('visibilitychange', onVisible);
  return () => document.removeEventListener('visibilitychange', onVisible);
}
