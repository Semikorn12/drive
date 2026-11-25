import { featureFlags } from '../config/featureFlags';

/**
 * Placeholder for a future ad banner in the trip list.
 * Feature flag is OFF → renders nothing. No ad SDK is included in the MVP.
 */
export function AdBanner(_props: { placement: 'tripList' }) {
  if (!featureFlags.ads) return null;
  return null; // implementation comes with the ads feature
}
