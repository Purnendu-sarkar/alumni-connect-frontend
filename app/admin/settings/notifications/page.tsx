import { NotificationsView } from '@/features/notifications/notifications-view';

export default function AdminSettingsNotificationsPage() {
  return <NotificationsView currentRole="SUPER_ADMIN" basePath="/admin" />;
}
