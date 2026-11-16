import { EventsListView } from '@/features/events/events-list-view';

export default function ModeratorEventsPage() {
  return <EventsListView currentRole="MODERATOR" basePath="/moderator" />;
}
