import { AnnouncementsListView } from '@/features/announcements/announcements-list-view';

export default function ModeratorAnnouncementsPage() {
  return <AnnouncementsListView currentRole="MODERATOR" basePath="/moderator" />;
}
