import { PermissionStep } from '../../components/onboarding/PermissionStep';
import { requestLocation } from '../../services/permissions';

export default function LocationPermission() {
  return (
    <PermissionStep step={4} prefix="onboarding.perm.location" bullets={['b1', 'b2', 'b3']} request={requestLocation} next="/onboarding/motion" />
  );
}
