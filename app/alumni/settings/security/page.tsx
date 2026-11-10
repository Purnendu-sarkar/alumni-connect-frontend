import { SecuritySettingsView } from '@/features/settings/security-settings-view';

export default function AlumniSecuritySettingsPage() {
  return <SecuritySettingsView currentRole="ALUMNI" basePath="/alumni" />;
}
