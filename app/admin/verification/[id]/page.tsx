import { AdminUserDetailView } from '@/features/users/admin-user-detail-view';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminVerificationDetailPage({ params }: Props) {
  const { id } = await params;
  return <AdminUserDetailView id={id} currentRole="SUPER_ADMIN" basePath="/admin" />;
}
