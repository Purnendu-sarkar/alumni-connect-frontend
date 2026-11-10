import { AccountSettingsView } from '@/features/settings/account-settings-view';

export default function AlumniAccountSettingsPage() {
  return <AccountSettingsView currentRole="ALUMNI" basePath="/alumni" />;
}
