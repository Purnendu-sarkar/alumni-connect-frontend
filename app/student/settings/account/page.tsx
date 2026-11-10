import { AccountSettingsView } from '@/features/settings/account-settings-view';

export default function StudentAccountSettingsPage() {
  return <AccountSettingsView currentRole="STUDENT" basePath="/student" />;
}
