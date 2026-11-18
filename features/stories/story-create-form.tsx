'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  storyId?: string;
}

export function StoryCreateForm({
  basePath,
  storyId,
}: StoryCreateFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

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
    setApiError(null);
    try {
      if (storyId) {
        await updateStory(storyId, data, accessToken);
      } else {
        await createStory(data, accessToken);
      }
      await queryClient.invalidateQueries({ queryKey: ['my-stories'] });
      if (storyId) {
        await queryClient.invalidateQueries({ queryKey: ['my-story', storyId] });
      }
      router.push(`${basePath}/stories/my-stories`);
    } catch (err: unknown) {
      setApiError(
        err instanceof Error
          ? err.message
          : 'Failed to save draft. Please verify all fields and try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitReview = async (data: CreateStoryInput) => {
    setIsSaving(true);
    setApiError(null);
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
      await queryClient.invalidateQueries({ queryKey: ['my-stories'] });
      if (targetId) {
        await queryClient.invalidateQueries({ queryKey: ['my-story', targetId] });
      }
      router.push(`${basePath}/stories/my-stories?submitted=true`);
    } catch (err: unknown) {
      setApiError(
        err instanceof Error
          ? err.message
          : 'Failed to submit story for review. Please check your input and try again.'
      );
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
              coverImagePublicId: existingStory.coverImagePublicId,
              embeddedMediaPublicIds: existingStory.embeddedMediaPublicIds || [],
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
      externalError={apiError}
    />
  );
}
