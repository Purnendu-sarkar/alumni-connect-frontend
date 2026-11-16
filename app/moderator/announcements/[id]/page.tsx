'use client';

import { useParams } from 'next/navigation';
import { AnnouncementDetailView } from '@/features/announcements/announcement-detail-view';

export default function ModeratorAnnouncementDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  return <AnnouncementDetailView id={id} currentRole="MODERATOR" basePath="/moderator" />;
}
