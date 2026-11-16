import { apiClient } from './client';
import type {
  EventCard,
  EventDetail,
  EventRsvpItem,
  EventAttendee,
  EventMode,
  EventStatus,
} from '@/types/domain';

export interface EventFilterParams {
  tab?: 'upcoming' | 'past' | 'my-rsvps' | 'all';
  category?: string;
  mode?: EventMode | 'ALL';
  q?: string;
  from?: string;
  to?: string;
  sort?: 'starts_at_asc' | 'starts_at_desc' | 'newest';
  page?: number;
  limit?: number;
}

export interface AdminEventFilterParams {
  status?: EventStatus | 'ALL';
  category?: string;
  mode?: EventMode | 'ALL';
  q?: string;
  page?: number;
  limit?: number;
}

export interface CreateEventInput {
  title: string;
  description: string;
  category: string;
  organizer?: string | null;
  mode: EventMode;
  venue?: string | null;
  onlineUrl?: string | null;
  startsAt: string;
  endsAt: string;
  rsvpDeadline?: string | null;
  capacity?: number | null;
  waitlistEnabled?: boolean;
  bannerUrl?: string | null;
  bannerPublicId?: string | null;
  bannerKey?: string | null;
  reminderEnabled?: boolean;
  status?: EventStatus;
}

export type UpdateEventInput = Partial<CreateEventInput>;

export function getEvents(filters: EventFilterParams = {}, accessToken?: string | null) {
  const query = new URLSearchParams();
  if (filters.page) query.set('page', String(filters.page));
  if (filters.limit) query.set('limit', String(filters.limit));
  if (filters.tab) query.set('tab', filters.tab);
  if (filters.category && filters.category !== 'All') query.set('category', filters.category);
  if (filters.mode && filters.mode !== 'ALL') query.set('mode', filters.mode);
  if (filters.q) query.set('q', filters.q);
  if (filters.from) query.set('from', filters.from);
  if (filters.to) query.set('to', filters.to);
  if (filters.sort) query.set('sort', filters.sort);

  const queryString = query.toString();
  return apiClient<EventCard[]>(`/events${queryString ? `?${queryString}` : ''}`, {
    accessToken,
    tenant: true,
  });
}

export function getEventById(id: string, accessToken?: string | null) {
  return apiClient<EventDetail>(`/events/${id}`, {
    accessToken,
    tenant: true,
  });
}

export function getMyEventRsvps(accessToken: string | null, page = 1, limit = 20) {
  return apiClient<EventRsvpItem[]>(`/events/my-rsvps?page=${page}&limit=${limit}`, {
    accessToken,
    tenant: true,
  });
}

export interface RsvpMutationResult {
  rsvp: EventRsvpItem | null;
  assignedStatus: string;
  counts: {
    goingCount: number;
    maybeCount: number;
    waitlistCount: number;
    spotsRemaining: number | null;
    isFull: boolean;
  };
}

export function rsvpToEvent(
  accessToken: string | null,
  eventId: string,
  status: 'GOING' | 'MAYBE' | 'NOT_GOING'
) {
  return apiClient<RsvpMutationResult>(`/events/${eventId}/rsvp`, {
    method: 'PUT',
    accessToken,
    tenant: true,
    body: JSON.stringify({ status }),
  });
}

export function cancelRsvp(accessToken: string | null, eventId: string) {
  return apiClient<{
    cancelled: boolean;
    counts: {
      goingCount: number;
      maybeCount: number;
      waitlistCount: number;
      spotsRemaining: number | null;
      isFull: boolean;
    };
  }>(`/events/${eventId}/rsvp`, {
    method: 'DELETE',
    accessToken,
    tenant: true,
  });
}

// ================= ADMIN & MODERATOR API =================

export function getAdminEvents(
  accessToken: string | null,
  filters: AdminEventFilterParams = {}
) {
  const query = new URLSearchParams();
  if (filters.page) query.set('page', String(filters.page));
  if (filters.limit) query.set('limit', String(filters.limit));
  if (filters.status && filters.status !== 'ALL') query.set('status', filters.status);
  if (filters.category && filters.category !== 'All') query.set('category', filters.category);
  if (filters.mode && filters.mode !== 'ALL') query.set('mode', filters.mode);
  if (filters.q) query.set('q', filters.q);

  const queryString = query.toString();
  return apiClient<EventDetail[]>(`/admin/events${queryString ? `?${queryString}` : ''}`, {
    accessToken,
    tenant: true,
  });
}

export function getAdminEventById(accessToken: string | null, id: string) {
  return apiClient<EventDetail>(`/admin/events/${id}`, {
    accessToken,
    tenant: true,
  });
}

export function createEvent(accessToken: string | null, data: CreateEventInput) {
  return apiClient<EventDetail>('/admin/events', {
    method: 'POST',
    accessToken,
    tenant: true,
    body: JSON.stringify(data),
  });
}

export function updateEvent(accessToken: string | null, id: string, data: UpdateEventInput) {
  return apiClient<EventDetail>(`/admin/events/${id}`, {
    method: 'PATCH',
    accessToken,
    tenant: true,
    body: JSON.stringify(data),
  });
}

export function publishEvent(accessToken: string | null, id: string) {
  return apiClient<EventDetail>(`/admin/events/${id}/publish`, {
    method: 'POST',
    accessToken,
    tenant: true,
  });
}

export function cancelEvent(accessToken: string | null, id: string, cancelReason: string) {
  return apiClient<EventDetail>(`/admin/events/${id}/cancel`, {
    method: 'POST',
    accessToken,
    tenant: true,
    body: JSON.stringify({ cancelReason }),
  });
}

export function completeEvent(accessToken: string | null, id: string) {
  return apiClient<EventDetail>(`/admin/events/${id}/complete`, {
    method: 'POST',
    accessToken,
    tenant: true,
  });
}

export function duplicateEvent(accessToken: string | null, id: string) {
  return apiClient<EventDetail>(`/admin/events/${id}/duplicate`, {
    method: 'POST',
    accessToken,
    tenant: true,
  });
}

export function deleteEvent(accessToken: string | null, id: string) {
  return apiClient<{ success: boolean }>(`/admin/events/${id}`, {
    method: 'DELETE',
    accessToken,
    tenant: true,
  });
}

export function getEventAttendees(
  accessToken: string | null,
  id: string,
  status = 'ALL',
  page = 1,
  limit = 20,
  q?: string
) {
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('limit', String(limit));
  if (status && status !== 'ALL') query.set('status', status);
  if (q) query.set('q', q);

  return apiClient<EventAttendee[]>(`/admin/events/${id}/attendees?${query.toString()}`, {
    accessToken,
    tenant: true,
  });
}
