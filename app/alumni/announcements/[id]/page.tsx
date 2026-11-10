import { AnnouncementDetailView } from '@/features/announcements/announcement-detail-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AlumniAnnouncementDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <AnnouncementDetailView id={id} currentRole="ALUMNI" basePath="/alumni" />;
}
