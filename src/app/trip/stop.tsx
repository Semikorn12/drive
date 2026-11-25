import { Redirect } from 'expo-router';
import { useEffect } from 'react';

import { manualStop } from '../../services/tracking/engine';

/** Deep link drive://trip/stop (e.g. Shortcuts automation "When CarPlay disconnects"). */
export default function StopTripLink() {
  useEffect(() => {
    void manualStop();
  }, []);
  return <Redirect href="/" />;
}
