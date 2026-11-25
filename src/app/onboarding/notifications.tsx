import { PermissionStep } from '../../components/onboarding/PermissionStep';
import { requestNotifications } from '../../services/permissions';

export default function NotificationsPermission() {
  return (
    <PermissionStep
      step={6}
      prefix="onboarding.perm.notifications"
      bullets={['b1', 'b2']}
      request={requestNotifications}
      next="/onboarding/finish"
    />
  );
}
