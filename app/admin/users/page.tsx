import { AdminUsersView } from '@/features/users/admin-users-view';

export default function AdminUsersPage() {
  return <AdminUsersView currentRole="SUPER_ADMIN" basePath="/admin" />;
}
