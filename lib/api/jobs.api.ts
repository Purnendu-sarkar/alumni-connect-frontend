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

export interface MyJobsResponse {
  postedJobs: (Job & { status?: string })[];
  applications: Array<{
    id: string;
    jobId: string;
    status: string;
    createdAt: string;
    job: Job;
  }>;
}

export function getJobs() {
  return apiClient<Job[]>('/jobs?page=1&limit=24', { tenant: true });
}

export function getPendingJobs(accessToken: string | null) {
  return apiClient<Job[]>('/jobs/pending', { accessToken, tenant: true });
}

export function getMyJobs(accessToken: string | null) {
  return apiClient<MyJobsResponse>('/jobs/mine', { accessToken, tenant: true });
}

export function createJob(accessToken: string | null, data: CreateJobInput) {
  return apiClient<Job>('/jobs', {
    method: 'POST',
    accessToken,
    tenant: true,
    body: JSON.stringify(data),
  });
}

export function getJobById(jobId: string) {
  return apiClient<Job>(`/jobs/${jobId}`, { tenant: true });
}

export function reviewJob(
  accessToken: string | null,
  jobId: string,
  status: 'APPROVED' | 'REJECTED',
  rejectionReason?: string,
) {
  return apiClient<Job>(`/jobs/${jobId}/review`, {
    method: 'PATCH',
    accessToken,
    tenant: true,
    body: JSON.stringify({
      status,
      rejectionReason: rejectionReason?.trim() || (status === 'REJECTED' ? 'Posting does not meet platform guidelines' : undefined),
    }),
  });
}

export function applyToJob(
  accessToken: string | null,
  jobId: string,
  message?: string,
) {
  return apiClient<{ id: string; jobId: string }>(`/jobs/${jobId}/applications`, {
    method: 'POST',
    accessToken,
    tenant: true,
    body: JSON.stringify({ message: message?.trim() || undefined }),
  });
}
