import { apiClient } from './client';
import type { Alumni } from '@/types/domain';

export interface AlumniFilters {
  batch?: string;
  department?: string;
  company?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function getAlumni(filters: AlumniFilters = {}) {
  const params = new URLSearchParams({
    page: String(filters.page ?? 1),
    limit: String(filters.limit ?? 24),
  });
  if (filters.batch) params.set('batch', filters.batch);
  if (filters.department) params.set('department', filters.department);
  if (filters.company) params.set('company', filters.company);
  if (filters.search) params.set('search', filters.search);

  return apiClient<Alumni[]>(`/alumni?${params.toString()}`);
}

export function getAlumnusById(id: string) {
  return apiClient<Alumni>(`/alumni/${id}`);
}
