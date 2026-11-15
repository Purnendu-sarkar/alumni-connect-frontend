import { NotificationPreferencesView } from '@/features/settings/notification-preferences-view';

export default function ModeratorSettingsNotificationsPage() {
  return <NotificationPreferencesView currentRole="MODERATOR" basePath="/moderator" />;
}
