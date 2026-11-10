import { EventCreateForm } from '@/features/events/event-create-form';

export default function AdminEventCreatePage() {
  return <EventCreateForm currentRole="SUPER_ADMIN" basePath="/admin" />;
}
