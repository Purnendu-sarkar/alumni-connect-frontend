import { EventCreateForm } from '@/features/events/event-create-form';

export default function AdminCreateEventPage() {
  return <EventCreateForm currentRole="SUPER_ADMIN" basePath="/admin" />;
}
