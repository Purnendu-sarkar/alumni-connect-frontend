'use client';

import { useParams } from 'next/navigation';
import { EventDetailView } from '@/features/events/event-detail-view';
import { PublicWorkspaceBanner } from '@/components/public/public-workspace-banner';
import { useAuthStore } from '@/store/auth-store';

export default function PublicEventDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const user = useAuthStore((state) => state.user);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
      <PublicWorkspaceBanner resource="events" />
      <EventDetailView
        id={id}
        currentRole={user?.role || 'STUDENT'}
        basePath=""
      />
    </div>
  );
}
