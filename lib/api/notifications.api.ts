import type { UserRole } from '@/types/domain';
import { apiClient } from './client';

export type NotificationType =
  | 'ACCOUNT_VERIFICATION'
  | 'VERIFICATION_PENDING'
  | 'MODERATION_RESULT'
  | 'SECURITY_ALERT'
  | 'RESTRICTION_APPLIED'
  | 'RESTRICTION_ENDED'
  | 'SYSTEM_ANNOUNCEMENT'
  | 'CONNECTION_REQUEST'
  | 'CONNECTION_ACCEPTED'
  | 'MENTORSHIP_REQUEST'
  | 'MENTORSHIP_DECISION'
  | 'JOB_APPROVED'
  | 'JOB_REJECTED'
  | 'JOB_CHANGES_REQUESTED'
  | 'APPLICATION_RECEIVED'
  | 'APPLICATION_UPDATE'
  | 'EVENT_REMINDER'
  | 'ANNOUNCEMENT'
  | 'STORY_REVIEW';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null;
  metadata?: Record<string, unknown> | null;
  readAt?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreference {
  id: string;
  type: NotificationType;
  inApp: boolean;
  email: boolean;
}

export interface NotificationListParams {
  filter?: 'all' | 'unread';
  type?: NotificationType;
  page?: number;
  limit?: number;
}

export interface NotificationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  unreadCount?: number;
}

export function getNotifications(params: NotificationListParams = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.filter) query.set('filter', params.filter);
  if (params.type) query.set('type', params.type);

  const qs = query.toString();
  return apiClient<NotificationItem[]>(`/notifications${qs ? `?${qs}` : ''}`, {
    method: 'GET',
  });
}

export function getUnreadNotificationCount() {
  return apiClient<{ unreadCount: number }>('/notifications/unread-count', {
    method: 'GET',
  });
}

export function markNotificationRead(id: string) {
  return apiClient<{ success: boolean }>(`/notifications/${encodeURIComponent(id)}/read`, {
    method: 'PATCH',
  });
}

export function markAllNotificationsRead() {
  return apiClient<{ success: boolean }>('/notifications/read-all', {
    method: 'PATCH',
  });
}

export function deleteNotification(id: string) {
  return apiClient<{ success: boolean }>(`/notifications/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function getNotificationPreferences() {
  return apiClient<NotificationPreference[]>('/notifications/preferences', {
    method: 'GET',
  });
}

export function updateNotificationPreferences(
  preferences: Array<{ type: NotificationType; inApp?: boolean; email?: boolean }>,
) {
  return apiClient<NotificationPreference[]>('/notifications/preferences', {
    method: 'PATCH',
    body: JSON.stringify({ preferences }),
  });
}

export function getRolePrefix(userRole?: UserRole | string | null): string {
  switch (userRole) {
    case 'SUPER_ADMIN':
      return '/admin';
    case 'MODERATOR':
      return '/moderator';
    case 'ALUMNI':
      return '/alumni';
    case 'STUDENT':
    default:
      return '/student';
  }
}

const SHARED_SAFE_PREFIXES = ['/login', '/dashboard', '/verify-email', '/forgot-password', '/reset-password'];
const ROLE_PREFIXES = ['/admin', '/moderator', '/alumni', '/student'];

export function getSafeRoleNotificationLink(
  link: string | null | undefined,
  userRole?: UserRole | string | null,
): string {
  const rolePrefix = getRolePrefix(userRole);
  const fallback = `${rolePrefix}/notifications`;

  if (!link || typeof link !== 'string') return fallback;

  const trimmed = link.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return fallback;
  }

  // Shared routes accessible by any role
  if (SHARED_SAFE_PREFIXES.some((prefix) => trimmed === prefix || trimmed.startsWith(`${prefix}/`))) {
    return trimmed;
  }

  // Current role's own prefix
  if (trimmed === rolePrefix || trimmed.startsWith(`${rolePrefix}/`)) {
    return trimmed;
  }

  // Cross-role leak check: blocks another role's private pages
  if (ROLE_PREFIXES.some((other) => other !== rolePrefix && (trimmed === other || trimmed.startsWith(`${other}/`)))) {
    return fallback;
  }

  return trimmed;
}
