import { apiClient } from './client';
import type { Alumni } from '@/types/domain';

export function getAlumni(accessToken: string | null, filters: { batch?: string; department?: string; company?: string } = {}) {
  const params = new URLSearchParams({ page: '1', limit: '24' });
  Object.entries(filters).forEach(([key, value]) => value && params.set(key, value));
  return apiClient<Alumni[]>(`/alumni?${params.toString()}`, { accessToken });
}
