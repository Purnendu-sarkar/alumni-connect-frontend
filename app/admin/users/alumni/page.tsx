import { AdminUsersView } from '@/features/users/admin-users-view';

export default function AdminAlumniUsersPage() {
  return <AdminUsersView currentRole="SUPER_ADMIN" basePath="/admin" roleFilterPreset="ALUMNI" />;
}
