import { AnnouncementsListView } from '@/features/announcements/announcements-list-view';

export default function StudentAnnouncementsPage() {
  return <AnnouncementsListView currentRole="STUDENT" basePath="/student" />;
}
