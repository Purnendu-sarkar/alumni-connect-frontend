import { EventsListView } from '@/features/events/events-list-view';

export default function AdminEventsPage() {
  return <EventsListView currentRole="SUPER_ADMIN" basePath="/admin" />;
}
