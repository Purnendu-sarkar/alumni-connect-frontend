import { apiClient } from './client';
import type { Alumni } from '@/types/domain';

export function getAlumni(
  accessToken: string | null,
  filters: { batch?: string; department?: string; company?: string; page?: number; limit?: number } = {},
) {
  const params = new URLSearchParams({
    page: String(filters.page ?? 1),
    limit: String(filters.limit ?? 24),
  });
  if (filters.batch) params.set('batch', filters.batch);
  if (filters.department) params.set('department', filters.department);
  if (filters.company) params.set('company', filters.company);

  return apiClient<Alumni[]>(`/alumni?${params.toString()}`, { accessToken });
}
