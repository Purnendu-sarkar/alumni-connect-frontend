import { apiClient } from './client';
import type {
  AnnouncementCard,
  AnnouncementDetail,
  AnnouncementCategory,
  AnnouncementAudience,
  AnnouncementStatus,
} from '@/types/domain';

export interface AnnouncementFilterParams {
  category?: AnnouncementCategory;
  q?: string;
  page?: number;
  limit?: number;
}

export interface AdminAnnouncementFilterParams {
  status?: AnnouncementStatus | 'ALL';
  category?: AnnouncementCategory;
  audience?: AnnouncementAudience;
  q?: string;
  page?: number;
  limit?: number;
}

export interface CreateAnnouncementInput {
  title: string;
  body: string;
  category?: AnnouncementCategory;
  audience?: AnnouncementAudience;
  pinned?: boolean;
  publishAt?: string | null;
  archiveAt?: string | null;
  status?: AnnouncementStatus;
  notify?: boolean;
}

export type UpdateAnnouncementInput = Partial<CreateAnnouncementInput>;

export function getAnnouncements(
  filters: AnnouncementFilterParams = {},
  accessToken?: string | null
) {
  const query = new URLSearchParams();
  if (filters.page) query.set('page', String(filters.page));
  if (filters.limit) query.set('limit', String(filters.limit));
  if (filters.category) query.set('category', filters.category);
  if (filters.q) query.set('q', filters.q);

  const queryString = query.toString();
  return apiClient<AnnouncementCard[]>(`/announcements${queryString ? `?${queryString}` : ''}`, {
    accessToken,
    tenant: true,
  });
}

export function getAnnouncementById(id: string, accessToken?: string | null) {
  return apiClient<AnnouncementDetail>(`/announcements/${id}`, {
    accessToken,
    tenant: true,
  });
}

// ================= ADMIN & MODERATOR API =================

export function getAdminAnnouncements(
  accessToken: string | null,
  filters: AdminAnnouncementFilterParams = {}
) {
  const query = new URLSearchParams();
  if (filters.page) query.set('page', String(filters.page));
  if (filters.limit) query.set('limit', String(filters.limit));
  if (filters.status && filters.status !== 'ALL') query.set('status', filters.status);
  if (filters.category) query.set('category', filters.category);
  if (filters.audience) query.set('audience', filters.audience);
  if (filters.q) query.set('q', filters.q);

  const queryString = query.toString();
  return apiClient<AnnouncementDetail[]>(
    `/admin/announcements${queryString ? `?${queryString}` : ''}`,
    {
      accessToken,
      tenant: true,
    }
  );
}

export function getAdminAnnouncementById(accessToken: string | null, id: string) {
  return apiClient<AnnouncementDetail>(`/admin/announcements/${id}`, {
    accessToken,
    tenant: true,
  });
}

export function createAnnouncement(accessToken: string | null, data: CreateAnnouncementInput) {
  return apiClient<AnnouncementDetail>('/admin/announcements', {
    method: 'POST',
    accessToken,
    tenant: true,
    body: JSON.stringify(data),
  });
}

export function updateAnnouncement(
  accessToken: string | null,
  id: string,
  data: UpdateAnnouncementInput
) {
  return apiClient<AnnouncementDetail>(`/admin/announcements/${id}`, {
    method: 'PATCH',
    accessToken,
    tenant: true,
    body: JSON.stringify(data),
  });
}

export function publishAnnouncement(
  accessToken: string | null,
  id: string,
  notify = true
) {
  return apiClient<AnnouncementDetail>(`/admin/announcements/${id}/publish`, {
    method: 'POST',
    accessToken,
    tenant: true,
    body: JSON.stringify({ notify }),
  });
}

export function archiveAnnouncement(accessToken: string | null, id: string) {
  return apiClient<AnnouncementDetail>(`/admin/announcements/${id}/archive`, {
    method: 'POST',
    accessToken,
    tenant: true,
  });
}

export function restoreAnnouncement(accessToken: string | null, id: string) {
  return apiClient<AnnouncementDetail>(`/admin/announcements/${id}/restore`, {
    method: 'POST',
    accessToken,
    tenant: true,
  });
}

export function togglePinAnnouncement(
  accessToken: string | null,
  id: string,
  pinned: boolean
) {
  return apiClient<AnnouncementDetail>(`/admin/announcements/${id}/pin`, {
    method: 'PATCH',
    accessToken,
    tenant: true,
    body: JSON.stringify({ pinned }),
  });
}

export function duplicateAnnouncement(accessToken: string | null, id: string) {
  return apiClient<AnnouncementDetail>(`/admin/announcements/${id}/duplicate`, {
    method: 'POST',
    accessToken,
    tenant: true,
  });
}

export function deleteAnnouncement(accessToken: string | null, id: string) {
  return apiClient<{ success: boolean }>(`/admin/announcements/${id}`, {
    method: 'DELETE',
    accessToken,
    tenant: true,
  });
}
