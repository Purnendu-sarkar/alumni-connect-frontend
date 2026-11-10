import { AnnouncementCreateForm } from '@/features/announcements/announcement-create-form';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminAnnouncementEditPage({ params }: Props) {
  const { id } = await params;
  return <AnnouncementCreateForm currentRole="SUPER_ADMIN" basePath="/admin" editId={id} />;
}
