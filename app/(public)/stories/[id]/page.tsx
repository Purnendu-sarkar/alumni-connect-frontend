'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { StoryDetailView } from '@/features/stories/story-detail-view';
import { useAuthStore } from '@/store/auth-store';

export default function PublicStoryDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const user = useAuthStore((state) => state.user);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <StoryDetailView
        id={id}
        currentRole={user?.role || 'STUDENT'}
        basePath=""
      />
    </div>
  );
}
