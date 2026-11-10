import { AdminUsersView } from '@/features/users/admin-users-view';

export default function AdminStudentsPage() {
  return <AdminUsersView currentRole="SUPER_ADMIN" basePath="/admin" roleFilterPreset="STUDENT" />;
}
