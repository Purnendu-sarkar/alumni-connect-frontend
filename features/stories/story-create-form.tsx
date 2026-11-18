'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { useAuthStore } from '@/store/auth-store';
import {
  createStory,
  getMyStoryById,
  submitStory,
  updateStory,
  type CreateStoryInput,
} from '@/lib/api/stories.api';
import type { UserRole } from '@/types/domain';
import { RichStoryEditor } from '@/components/stories/rich-story-editor';

interface StoryCreateFormProps {
  currentRole: UserRole;
  basePath: string;
  storyId?: string; // Optional: when provided, operates in Edit mode
}

export function StoryCreateForm({
  currentRole,
  basePath,
  storyId,
}: StoryCreateFormProps) {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const [isSaving, setIsSaving] = useState(false);

  // If storyId is present, fetch existing story for editing
  const { data: existingStory, isLoading: isLoadingStory } = useQuery({
    queryKey: ['my-story', storyId],
    queryFn: async () => {
      const res = await getMyStoryById(storyId!, accessToken);
      return res.data;
    },
    enabled: Boolean(storyId),
  });

  const handleSaveDraft = async (data: CreateStoryInput) => {
    setIsSaving(true);
    try {
      if (storyId) {
        await updateStory(storyId, data, accessToken);
      } else {
        await createStory(data, accessToken);
      }
      router.push(`${basePath}/stories/my-stories`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitReview = async (data: CreateStoryInput) => {
    setIsSaving(true);
    try {
      let targetId = storyId;
      if (targetId) {
        await updateStory(targetId, data, accessToken);
      } else {
        const created = await createStory(data, accessToken);
        targetId = created.data?.id;
      }

      if (targetId) {
        await submitStory(targetId, accessToken);
      }
      router.push(`${basePath}/stories/my-stories?submitted=true`);
    } finally {
      setIsSaving(false);
    }
  };

  if (storyId && isLoadingStory) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <RichStoryEditor
      initialData={
        existingStory
          ? {
              id: existingStory.id,
              title: existingStory.title,
              summary: existingStory.summary,
              body: existingStory.body,
              category: existingStory.category,
              tags: existingStory.tags,
              coverImageUrl: existingStory.coverImageUrl,
              coverImageKey: existingStory.coverImageKey,
              status: existingStory.status,
              readingTimeMinutes: existingStory.readingTimeMinutes,
              ownerVisibleNote: existingStory.ownerVisibleNote,
            }
          : undefined
      }
      currentUser={
        user
          ? {
              id: user.id,
              name: user.name,
              avatarUrl: user.avatarUrl,
              department: user.department,
              batch: user.batch,
              graduationYear: (user as unknown as { graduationYear?: string }).graduationYear,
              position: (user as unknown as { position?: string }).position,
              currentCompany: (user as unknown as { currentCompany?: string }).currentCompany,
            }
          : null
      }
      onSaveDraft={handleSaveDraft}
      onSubmitReview={handleSubmitReview}
      isSaving={isSaving}
    />
  );
}
