import { apiClient } from './client';
import type { Job } from '@/types/domain';

export interface CreateJobInput {
  title: string;
  company: string;
  description: string;
  location?: string;
  employmentType?: string;
  applicationUrl?: string;
  applicationEmail?: string;
  expiresAt?: string;
}

export interface JobFilters {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  employmentType?: string;
}

export function getJobs(filters: JobFilters = {}) {
  const params = new URLSearchParams({
    page: String(filters.page ?? 1),
    limit: String(filters.limit ?? 20),
  });
  if (filters.search) params.set('search', filters.search);
  if (filters.location) params.set('location', filters.location);
  if (filters.employmentType) params.set('employmentType', filters.employmentType);

  return apiClient<Job[]>(`/jobs?${params.toString()}`);
}

export function getJobById(jobId: string) {
  return apiClient<Job>(`/jobs/${jobId}`);
}

export function createJob(data: CreateJobInput) {
  return apiClient<Job>('/jobs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function moderateJob(
  jobId: string,
  status: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED',
  note?: string,
) {
  return apiClient<Job>(`/jobs/${jobId}/moderate`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note }),
  });
}

export function applyToJob(
  jobId: string,
  data: { coverLetter?: string; resumeUrl?: string } = {},
) {
  return apiClient<{ application: Record<string, unknown> }>(`/jobs/${jobId}/apply`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
