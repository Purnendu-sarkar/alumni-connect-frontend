import { AccountSettingsView } from '@/features/settings/account-settings-view';

export default function AdminAccountSettingsPage() {
  return <AccountSettingsView currentRole="SUPER_ADMIN" basePath="/admin" />;
}
