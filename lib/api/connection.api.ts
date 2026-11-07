import { apiClient } from './client';

export interface ConnectionUser {
  id: string;
  email: string;
  role: string;
  profile?: {
    fullName?: string;
    department?: string;
    currentJob?: string;
    company?: string;
    avatarUrl?: string;
  };
}

export interface ConnectionRecord {
  id: string;
  userLowId: string;
  userHighId: string;
  initiatorId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED';
  note?: string;
  createdAt: string;
  updatedAt: string;
  otherUser?: ConnectionUser;
  userLow?: ConnectionUser;
  userHigh?: ConnectionUser;
}

export interface ConnectionQueryParams {
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  page?: number;
  limit?: number;
}

export function getConnections(params: ConnectionQueryParams = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  const queryStr = query.toString() ? `?${query.toString()}` : '';
  return apiClient<ConnectionRecord[]>(`/connections${queryStr}`);
}

export function sendConnectionRequest(input: { receiverId: string; note?: string }) {
  return apiClient<ConnectionRecord>('/connections', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function respondConnection(id: string, action: 'ACCEPT' | 'REJECT') {
  return apiClient<ConnectionRecord>(`/connections/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  });
}

