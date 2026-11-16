'use client';

import { useParams } from 'next/navigation';
import { AnnouncementCreateForm } from '@/features/announcements/announcement-create-form';

export default function AdminEditAnnouncementPage() {
  const params = useParams();
  const id = params?.id as string;

  return <AnnouncementCreateForm currentRole="SUPER_ADMIN" basePath="/admin" editId={id} />;
}
