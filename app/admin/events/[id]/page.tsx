import { EventDetailView } from '@/features/events/event-detail-view';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminEventDetailPage({ params }: Props) {
  const { id } = await params;
  return <EventDetailView id={id} currentRole="SUPER_ADMIN" basePath="/admin" />;
}
