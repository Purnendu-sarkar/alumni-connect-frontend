import { apiClient } from './client';

export interface SessionItem {
  id: string;
  deviceName: string;
  maskedIp: string;
  userAgent: string | null;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export function getActiveSessions(accessToken: string | null) {
  return apiClient<SessionItem[]>('/sessions', {
    method: 'GET',
    accessToken,
  });
}

export function revokeSession(accessToken: string | null, id: string) {
  return apiClient<{ revokedSessionId: string }>(`/sessions/${id}`, {
    method: 'DELETE',
    accessToken,
  });
}

export function revokeOtherSessions(accessToken: string | null) {
  return apiClient<{ revokedCount: number }>('/sessions/others', {
    method: 'DELETE',
    accessToken,
  });
}
