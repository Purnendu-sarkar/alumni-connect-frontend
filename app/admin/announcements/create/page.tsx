import { AnnouncementCreateForm } from '@/features/announcements/announcement-create-form';

export default function AdminAnnouncementCreatePage() {
  return <AnnouncementCreateForm currentRole="SUPER_ADMIN" basePath="/admin" />;
}
