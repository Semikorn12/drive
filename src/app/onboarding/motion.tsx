import { PermissionStep } from '../../components/onboarding/PermissionStep';
import { requestMotion } from '../../services/permissions';

export default function MotionPermission() {
  return (
    <PermissionStep step={5} prefix="onboarding.perm.motion" bullets={['b1', 'b2']} request={requestMotion} next="/onboarding/notifications" />
  );
}
