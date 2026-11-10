import { AnnouncementDetailView } from '@/features/announcements/announcement-detail-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentAnnouncementDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <AnnouncementDetailView id={id} currentRole="STUDENT" basePath="/student" />;
}
