import { AdminModeratorsView } from '@/features/users/admin-moderators-view';

export default function AdminModeratorsPage() {
  return <AdminModeratorsView currentRole="SUPER_ADMIN" basePath="/admin" />;
}
