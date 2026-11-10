import { NotificationsView } from '@/features/notifications/notifications-view';

export default function AdminNotificationsPage() {
  return <NotificationsView currentRole="SUPER_ADMIN" basePath="/admin" />;
}
