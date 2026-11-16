'use client';

import { useParams } from 'next/navigation';
import { EventCreateForm } from '@/features/events/event-create-form';

export default function AdminEditEventPage() {
  const params = useParams();
  const id = params?.id as string;

  return <EventCreateForm currentRole="SUPER_ADMIN" basePath="/admin" editId={id} />;
}
