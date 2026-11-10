import { AdminUserEditView } from '@/features/users/admin-user-edit-view';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminUserEditPage({ params }: Props) {
  const { id } = await params;
  return <AdminUserEditView id={id} currentRole="SUPER_ADMIN" basePath="/admin" />;
}
