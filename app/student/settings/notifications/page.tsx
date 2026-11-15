import { NotificationPreferencesView } from '@/features/settings/notification-preferences-view';

export default function StudentSettingsNotificationsPage() {
  return <NotificationPreferencesView currentRole="STUDENT" basePath="/student" />;
}
