import { NotificationPreferencesView } from '@/features/settings/notification-preferences-view';

export default function AlumniSettingsNotificationsPage() {
  return <NotificationPreferencesView currentRole="ALUMNI" basePath="/alumni" />;
}
