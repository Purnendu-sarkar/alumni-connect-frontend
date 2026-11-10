import { AnnouncementDetailView } from '@/features/announcements/announcement-detail-view';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminAnnouncementDetailPage({ params }: Props) {
  const { id } = await params;
  return <AnnouncementDetailView id={id} currentRole="SUPER_ADMIN" basePath="/admin" />;
}
