import { apiClient } from './client';

export interface ConnectionUserSummary {
  id: string;
  name: string;
  avatarUrl?: string | null;
  email?: string | null;
  batch?: string | null;
  department?: string | null;
  currentCompany?: string | null;
  position?: string | null;
  role: { name: string };
}

export interface ConnectionRecord {
  id: string;
  universityId: string;
  requesterId: string;
  recipientId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'DECLINED' | 'BLOCKED';
  message?: string | null;
  respondedAt?: string | null;
  rejectedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  requester: ConnectionUserSummary;
  recipient: ConnectionUserSummary;
}

export interface BlockedUserRecord {
  id: string;
  blockedId: string;
  name: string;
  avatarUrl?: string | null;
  department?: string | null;
  currentCompany?: string | null;
  position?: string | null;
  role: string;
  reason?: string | null;
  createdAt: string;
}

export function getConnections(
  accessToken: string | null,
  params: {
    tab?: 'connected' | 'received' | 'sent' | 'blocked';
    q?: string;
    page?: number;
    limit?: number;
  } = {},
) {
  const searchParams = new URLSearchParams();
  if (params.tab) searchParams.set('tab', params.tab);
  if (params.q?.trim()) searchParams.set('q', params.q.trim());
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));

  return apiClient<ConnectionRecord[]>(`/connections?${searchParams.toString()}`, { accessToken });
}

export function sendConnectionRequest(
  accessToken: string | null,
  input: { recipientId: string; message?: string },
) {
  return apiClient<ConnectionRecord>('/connections', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(input),
  });
}

export function respondConnection(
  accessToken: string | null,
  id: string,
  status: 'ACCEPTED' | 'REJECTED' | 'DECLINED',
) {
  return apiClient<ConnectionRecord>(`/connections/${id}/respond`, {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify({ status }),
  });
}

export function cancelConnection(accessToken: string | null, id: string) {
  return apiClient<ConnectionRecord>(`/connections/${id}/cancel`, {
    method: 'PATCH',
    accessToken,
  });
}

export function removeConnection(accessToken: string | null, id: string) {
  return apiClient<{ success: boolean }>(`/connections/${id}`, {
    method: 'DELETE',
    accessToken,
  });
}

export function blockUser(
  accessToken: string | null,
  input: { blockedId: string; reason?: string },
) {
  return apiClient('/blocks', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(input),
  });
}

export function unblockUser(accessToken: string | null, userId: string) {
  return apiClient<{ success: boolean }>(`/blocks/${userId}`, {
    method: 'DELETE',
    accessToken,
  });
}

export function getBlockedUsers(accessToken: string | null) {
  return apiClient<BlockedUserRecord[]>('/connections/blocked', { accessToken });
}
