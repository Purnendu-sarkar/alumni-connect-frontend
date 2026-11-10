import { AdminVerificationView } from '@/features/users/admin-verification-view';

export default function AdminVerificationPendingPage() {
  return <AdminVerificationView currentRole="SUPER_ADMIN" basePath="/admin" statusFilterPreset="PENDING" />;
}
