import { apiClient } from './client';
import type { Alumni, UserProfile } from '@/types/domain';

export function getMe() {
  return apiClient<{ user: UserProfile }>('/users/me');
}

export function updateMe(data: Partial<UserProfile>) {
  return apiClient<{ user: UserProfile }>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function getUserById(id: string) {
  return apiClient<{ user: any }>(`/users/${id}`);
}

export function sendConnectionRequest(input: { receiverId: string; message?: string }) {
  return apiClient('/connections', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
