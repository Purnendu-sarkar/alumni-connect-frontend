import { EventsListView } from '@/features/events/events-list-view';

export default function AlumniEventsPage() {
  return <EventsListView currentRole="ALUMNI" basePath="/alumni" />;
}
