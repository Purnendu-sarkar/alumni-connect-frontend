import { AnnouncementsListView } from '@/features/announcements/announcements-list-view';

export default function AlumniAnnouncementsPage() {
  return <AnnouncementsListView currentRole="ALUMNI" basePath="/alumni" />;
}
