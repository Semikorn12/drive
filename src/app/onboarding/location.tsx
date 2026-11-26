import { Platform } from 'react-native';

import { PermissionStep } from '../../components/onboarding/PermissionStep';
import { requestLocation } from '../../services/permissions';

const isWeb = Platform.OS === 'web';

export default function LocationPermission() {
  return (
    <PermissionStep
      step={4}
      prefix={isWeb ? 'onboarding.perm.locationWeb' : 'onboarding.perm.location'}
      bullets={isWeb ? ['b1', 'b2'] : ['b1', 'b2', 'b3']}
      request={requestLocation}
      // Motion & notifications don't exist for websites → skip them in the browser.
      next={isWeb ? '/onboarding/finish' : '/onboarding/motion'}
    />
  );
}
