import { SecuritySettingsView } from '@/features/settings/security-settings-view';

export default function AdminSettingsSecurityPage() {
  return <SecuritySettingsView currentRole="SUPER_ADMIN" basePath="/admin" />;
}
