import { NotificationPreferencesView } from '@/features/settings/notification-preferences-view';

export default function AdminSettingsNotificationsPage() {
  return <NotificationPreferencesView currentRole="SUPER_ADMIN" basePath="/admin" />;
}
