import { SecuritySettingsView } from '@/features/settings/security-settings-view';

export default function ModeratorSecuritySettingsPage() {
  return <SecuritySettingsView currentRole="MODERATOR" basePath="/moderator" />;
}
