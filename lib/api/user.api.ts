import { apiClient } from './client';
import type { Alumni, UserProfile } from '@/types/domain';

export function getMe(accessToken: string | null) {
  return apiClient<UserProfile>('/users/me', { accessToken });
}

export function updateMe(accessToken: string | null, data: Partial<UserProfile>) {
  return apiClient<UserProfile>('/users/me', {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify(data),
  });
}

export function uploadAvatar(accessToken: string | null, file: File) {
  const formData = new FormData();
  formData.append('avatar', file);

  return apiClient<{ avatarUrl: string }>('/users/me/avatar', {
    method: 'POST',
    accessToken,
    body: formData,
  });
}

export function removeAvatar(accessToken: string | null) {
  return apiClient<{ avatarUrl: null }>('/users/me/avatar', {
    method: 'DELETE',
    accessToken,
  });
}

export function getAlumniById(accessToken: string | null, id: string) {
  return apiClient<Alumni>(`/alumni/${id}`, { accessToken });
}

export function sendConnectionRequest(
  accessToken: string | null,
  input: { recipientId: string; message?: string },
) {
  return apiClient('/connections', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(input),
  });
}
