import { Redirect } from 'expo-router';
import { useEffect } from 'react';

import { manualStart } from '../../services/tracking/engine';

/**
 * Deep link drive://trip/start – e.g. from an iOS Shortcuts automation
 * "When CarPlay connects → Open URL drive://trip/start".
 */
export default function StartTripLink() {
  useEffect(() => {
    void manualStart();
  }, []);
  return <Redirect href="/" />;
}
