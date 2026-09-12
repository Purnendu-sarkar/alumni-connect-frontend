import { apiClient } from './client';
import type { Job } from '@/types/domain';

export function getJobs() {
  return apiClient<Job[]>('/jobs?page=1&limit=24', { tenant: true });
}
