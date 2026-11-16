'use client';

import { useParams } from 'next/navigation';
import { EventDetailView } from '@/features/events/event-detail-view';

export default function ModeratorEventDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  return <EventDetailView id={id} currentRole="MODERATOR" basePath="/moderator" />;
}
