import { AccountSettingsView } from '@/features/settings/account-settings-view';

export default function ModeratorAccountSettingsPage() {
  return <AccountSettingsView currentRole="MODERATOR" basePath="/moderator" />;
}
