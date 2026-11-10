import { NotificationsView } from '@/features/notifications/notifications-view';

export default function ModeratorNotificationsPage() {
  return <NotificationsView currentRole="MODERATOR" basePath="/moderator" />;
}
