import { AnnouncementsListView } from '@/features/announcements/announcements-list-view';

export default function AdminAnnouncementsPage() {
  return <AnnouncementsListView currentRole="SUPER_ADMIN" basePath="/admin" />;
}
