import { SecuritySettingsView } from '@/features/settings/security-settings-view';

export default function StudentSecuritySettingsPage() {
  return <SecuritySettingsView currentRole="STUDENT" basePath="/student" />;
}
