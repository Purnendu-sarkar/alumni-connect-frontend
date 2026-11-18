import { apiClient } from './client';
import type {
  StoryCard,
  StoryDetail,
  AuthorStoryDetail,
  AdminStoryDetail,
  StoryCategory,
  StoryStatus,
} from '@/types/domain';

export interface StoryFilterParams {
  category?: StoryCategory | 'ALL';
  q?: string;
  department?: string;
  graduationYear?: number;
  sort?: 'newest' | 'oldest';
  page?: number;
  limit?: number;
}

export interface AdminStoryFilterParams {
  status?: StoryStatus | 'ALL' | 'PENDING_QUEUE';
  category?: StoryCategory | 'ALL';
  authorId?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface CreateStoryInput {
  title: string;
  summary: string;
  body: string;
  category: StoryCategory;
  tags?: string[];
  coverImageUrl?: string | null;
  coverImagePublicId?: string | null;
  embeddedMediaPublicIds?: string[];
  submitNow?: boolean;
}

export type UpdateStoryInput = Partial<CreateStoryInput>;

// ================= PUBLIC / READER API =================

export function getStories(filters: StoryFilterParams = {}, accessToken?: string | null) {
  const query = new URLSearchParams();
  if (filters.page) query.set('page', String(filters.page));
  if (filters.limit) query.set('limit', String(filters.limit));
  if (filters.category && filters.category !== 'ALL') query.set('category', filters.category);
  if (filters.q) query.set('q', filters.q);
  if (filters.department) query.set('department', filters.department);
  if (filters.graduationYear) query.set('graduationYear', String(filters.graduationYear));
  if (filters.sort) query.set('sort', filters.sort);

  const queryString = query.toString();
  return apiClient<StoryCard[]>(`/stories${queryString ? `?${queryString}` : ''}`, {
    accessToken,
    tenant: true,
  });
}

export function getStoryById(idOrSlug: string, accessToken?: string | null) {
  return apiClient<StoryDetail>(`/stories/${encodeURIComponent(idOrSlug)}`, {
    accessToken,
    tenant: true,
  });
}

export function reportStory(
  storyId: string,
  data: { reason: string; details?: string },
  accessToken?: string | null
) {
  return apiClient<{ id?: string; message?: string }>('/reports', {
    method: 'POST',
    body: JSON.stringify({
      targetType: 'STORY',
      targetId: storyId,
      reason: data.reason,
      details: data.details,
    }),
    accessToken,
    tenant: true,
  });
}

// ================= ALUMNI AUTHOR API =================

export function getMyStories(
  status?: StoryStatus | 'ALL',
  page = 1,
  limit = 20,
  accessToken?: string | null
) {
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('limit', String(limit));
  if (status && status !== 'ALL') query.set('status', status);

  const queryString = query.toString();
  return apiClient<AuthorStoryDetail[]>(`/stories/mine?${queryString}`, {
    accessToken,
    tenant: true,
  });
}

export function getMyStoryById(id: string, accessToken?: string | null) {
  return apiClient<AuthorStoryDetail>(`/stories/mine/${encodeURIComponent(id)}`, {
    accessToken,
    tenant: true,
  });
}

export function createStory(data: CreateStoryInput, accessToken?: string | null) {
  return apiClient<AuthorStoryDetail>('/stories', {
    method: 'POST',
    body: JSON.stringify(data),
    accessToken,
    tenant: true,
  });
}

export function updateStory(id: string, data: UpdateStoryInput, accessToken?: string | null) {
  return apiClient<AuthorStoryDetail>(`/stories/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    accessToken,
    tenant: true,
  });
}

export function submitStory(id: string, accessToken?: string | null) {
  return apiClient<AuthorStoryDetail>(`/stories/${encodeURIComponent(id)}/submit`, {
    method: 'POST',
    accessToken,
    tenant: true,
  });
}

export function withdrawStory(id: string, accessToken?: string | null) {
  return apiClient<AuthorStoryDetail>(`/stories/${encodeURIComponent(id)}/withdraw`, {
    method: 'POST',
    accessToken,
    tenant: true,
  });
}

export function unpublishStory(id: string, accessToken?: string | null) {
  return apiClient<AuthorStoryDetail>(`/stories/${encodeURIComponent(id)}/unpublish`, {
    method: 'POST',
    accessToken,
    tenant: true,
  });
}

export function deleteStory(id: string, accessToken?: string | null) {
  return apiClient<{ message: string }>(`/stories/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    accessToken,
    tenant: true,
  });
}

// ================= MODERATOR & ADMIN EDITORIAL API =================

export function getAdminStories(
  filters: AdminStoryFilterParams = {},
  accessToken?: string | null,
  roleScope: 'admin' | 'moderator' = 'admin'
) {
  const query = new URLSearchParams();
  if (filters.page) query.set('page', String(filters.page));
  if (filters.limit) query.set('limit', String(filters.limit));
  if (filters.status && filters.status !== 'ALL') query.set('status', filters.status);
  if (filters.category && filters.category !== 'ALL') query.set('category', filters.category);
  if (filters.authorId) query.set('authorId', filters.authorId);
  if (filters.q) query.set('q', filters.q);

  const queryString = query.toString();
  const endpoint = roleScope === 'moderator' ? '/moderator/stories' : '/admin/stories';
  return apiClient<AdminStoryDetail[]>(`${endpoint}${queryString ? `?${queryString}` : ''}`, {
    accessToken,
    tenant: true,
  });
}

export function getAdminStoryById(
  id: string,
  accessToken?: string | null,
  roleScope: 'admin' | 'moderator' = 'admin'
) {
  const endpoint = roleScope === 'moderator' ? '/moderator/stories' : '/admin/stories';
  return apiClient<AdminStoryDetail>(`${endpoint}/${encodeURIComponent(id)}`, {
    accessToken,
    tenant: true,
  });
}

export function claimStory(
  id: string,
  accessToken?: string | null,
  roleScope: 'admin' | 'moderator' = 'admin'
) {
  const endpoint = roleScope === 'moderator' ? '/moderator/stories' : '/admin/stories';
  return apiClient<AdminStoryDetail>(`${endpoint}/${encodeURIComponent(id)}/claim`, {
    method: 'POST',
    accessToken,
    tenant: true,
  });
}

export function unclaimStory(
  id: string,
  accessToken?: string | null,
  roleScope: 'admin' | 'moderator' = 'admin'
) {
  const endpoint = roleScope === 'moderator' ? '/moderator/stories' : '/admin/stories';
  return apiClient<AdminStoryDetail>(`${endpoint}/${encodeURIComponent(id)}/unclaim`, {
    method: 'POST',
    accessToken,
    tenant: true,
  });
}

export function approveStory(
  id: string,
  accessToken?: string | null,
  roleScope: 'admin' | 'moderator' = 'admin'
) {
  const endpoint = roleScope === 'moderator' ? '/moderator/stories' : '/admin/stories';
  return apiClient<AdminStoryDetail>(`${endpoint}/${encodeURIComponent(id)}/approve`, {
    method: 'POST',
    accessToken,
    tenant: true,
  });
}

export function rejectStory(
  id: string,
  data: { reason: string; internalNote?: string },
  accessToken?: string | null,
  roleScope: 'admin' | 'moderator' = 'admin'
) {
  const endpoint = roleScope === 'moderator' ? '/moderator/stories' : '/admin/stories';
  return apiClient<AdminStoryDetail>(`${endpoint}/${encodeURIComponent(id)}/reject`, {
    method: 'POST',
    body: JSON.stringify(data),
    accessToken,
    tenant: true,
  });
}

export function requestStoryChanges(
  id: string,
  data: { notes: string; internalNote?: string },
  accessToken?: string | null,
  roleScope: 'admin' | 'moderator' = 'admin'
) {
  const endpoint = roleScope === 'moderator' ? '/moderator/stories' : '/admin/stories';
  return apiClient<AdminStoryDetail>(`${endpoint}/${encodeURIComponent(id)}/request-changes`, {
    method: 'POST',
    body: JSON.stringify(data),
    accessToken,
    tenant: true,
  });
}

export function unpublishStoryAdmin(
  id: string,
  data: { reason?: string },
  accessToken?: string | null,
  roleScope: 'admin' | 'moderator' = 'admin'
) {
  const endpoint = roleScope === 'moderator' ? '/moderator/stories' : '/admin/stories';
  return apiClient<AdminStoryDetail>(`${endpoint}/${encodeURIComponent(id)}/unpublish`, {
    method: 'POST',
    body: JSON.stringify(data),
    accessToken,
    tenant: true,
  });
}

export function restoreStoryAdmin(
  id: string,
  accessToken?: string | null,
  roleScope: 'admin' | 'moderator' = 'admin'
) {
  const endpoint = roleScope === 'moderator' ? '/moderator/stories' : '/admin/stories';
  return apiClient<AdminStoryDetail>(`${endpoint}/${encodeURIComponent(id)}/restore`, {
    method: 'POST',
    accessToken,
    tenant: true,
  });
}

export function overrideStoryAdmin(
  id: string,
  data: { status: StoryStatus; reason: string },
  accessToken?: string | null
) {
  return apiClient<AdminStoryDetail>(`/admin/stories/${encodeURIComponent(id)}/override`, {
    method: 'POST',
    body: JSON.stringify(data),
    accessToken,
    tenant: true,
  });
}

export function deleteStoryAdmin(id: string, accessToken?: string | null) {
  return apiClient<{ message: string }>(`/admin/stories/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    accessToken,
    tenant: true,
  });
}
