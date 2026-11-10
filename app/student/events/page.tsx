import { EventsListView } from '@/features/events/events-list-view';

export default function StudentEventsPage() {
  return <EventsListView currentRole="STUDENT" basePath="/student" />;
}
