import { AdminSystemSettingsView } from '@/features/settings/admin-system-settings-view';

export default function AdminSettingsGeneralPage() {
  return <AdminSystemSettingsView currentRole="SUPER_ADMIN" basePath="/admin" />;
}
