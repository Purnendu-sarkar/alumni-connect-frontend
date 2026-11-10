import { EventDetailView } from '@/features/events/event-detail-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentEventDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <EventDetailView id={id} currentRole="STUDENT" basePath="/student" />;
}
