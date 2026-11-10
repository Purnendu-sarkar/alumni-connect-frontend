import { AdminVerificationView } from '@/features/users/admin-verification-view';

export default function AdminVerificationPage() {
  return <AdminVerificationView currentRole="SUPER_ADMIN" basePath="/admin" />;
}
