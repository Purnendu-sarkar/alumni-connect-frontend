import { NotificationsView } from '@/features/notifications/notifications-view';

export default function StudentNotificationsPage() {
  return <NotificationsView currentRole="STUDENT" basePath="/student" />;
}
