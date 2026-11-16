import { apiClient } from './client';
import type { Job } from '@/types/domain';

export interface JobFilterParams {
  search?: string;
  category?: string;
  employmentType?: string;
  workMode?: string;
  experienceLevel?: string;
  referralOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateJobInput {
  title: string;
  company: string;
  description: string;
  requirements?: string;
  category?: string;
  employmentType?: string;
  workMode?: string;
  experienceLevel?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  deadline?: string;
  referralAvailable?: boolean;
  requireResume?: boolean;
  requireCoverLetter?: boolean;
  applicationUrl?: string;
  applicationEmail?: string;
  submitNow?: boolean;
  expiresAt?: string;
}

export type UpdateJobInput = Partial<CreateJobInput>;

export interface ApplyJobInput {
  coverLetter?: string;
  message?: string;
  resumeKey?: string;
  shareProfileConsent?: boolean;
}

export interface ApplicationCandidateRecord {
  id: string;
  jobId: string;
  applicantId: string;
  status: string;
  coverLetter?: string | null;
  message?: string | null;
  resumeKey?: string | null;
  shareProfileConsent: boolean;
  profileSnapshot?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    department?: string | null;
    batch?: string | null;
    studentId?: string | null;
    academicId?: string | null;
    currentSemester?: string | null;
    currentCompany?: string | null;
    position?: string | null;
    avatarUrl?: string | null;
    verified?: boolean;
    verificationStatus?: string;
  } | null;
  applicant?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    phonePublic?: boolean;
    department?: string | null;
    batch?: string | null;
    currentCompany?: string | null;
    position?: string | null;
    avatarUrl?: string | null;
    verified?: boolean;
  };
  job?: {
    id: string;
    title: string;
    company: string;
    location?: string | null;
    category?: string | null;
    employmentType?: string | null;
    workMode?: string | null;
    deadline?: string | null;
    status: string;
  };
  ownerNote?: string | null;
  withdrawnAt?: string | null;
  createdAt: string;
  updatedAt: string;
  history?: Array<{
    id: string;
    fromStatus: string | null;
    toStatus: string;
    note?: string | null;
    createdAt: string;
    changedBy?: { id: string; name: string } | null;
  }>;
}

export interface MyJobsResponse {
  postedJobs: Job[];
  applications: ApplicationCandidateRecord[];
}

export interface ModeratorQueueParams {
  status?: string;
  mine?: boolean;
  category?: string;
  q?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminJobsParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// -------------------------------------------------------------
// Core Job Listings
// -------------------------------------------------------------

export function getJobs(filters: JobFilterParams = {}) {
  const query = new URLSearchParams();
  if (filters.page) query.set('page', String(filters.page));
  if (filters.limit) query.set('limit', String(filters.limit));
  if (filters.search) query.set('search', filters.search);
  if (filters.category && filters.category !== 'All') query.set('category', filters.category);
  if (filters.employmentType && filters.employmentType !== 'All') query.set('employmentType', filters.employmentType);
  if (filters.workMode && filters.workMode !== 'All') query.set('workMode', filters.workMode);
  if (filters.experienceLevel && filters.experienceLevel !== 'All') query.set('experienceLevel', filters.experienceLevel);
  if (filters.referralOnly) query.set('referralOnly', 'true');

  const queryString = query.toString();
  return apiClient<Job[]>(`/jobs${queryString ? `?${queryString}` : ''}`, { tenant: true });
}

export function getJobById(jobId: string) {
  return apiClient<Job>(`/jobs/${jobId}`, { tenant: true });
}

export function getOwnerJobDetail(jobId: string, accessToken?: string | null) {
  return apiClient<Job>(`/jobs/${jobId}/owner-view`, { accessToken, tenant: true });
}

export function createJob(accessToken: string | null, data: CreateJobInput) {
  return apiClient<Job>('/jobs', {
    method: 'POST',
    accessToken,
    tenant: true,
    body: JSON.stringify(data),
  });
}

export function updateJob(accessToken: string | null, jobId: string, data: UpdateJobInput) {
  return apiClient<Job>(`/jobs/${jobId}`, {
    method: 'PATCH',
    accessToken,
    tenant: true,
    body: JSON.stringify(data),
  });
}

export function submitJob(accessToken: string | null, jobId: string) {
  return apiClient<{ success: boolean; status: string }>(`/jobs/${jobId}/submit`, {
    method: 'POST',
    accessToken,
    tenant: true,
  });
}

export function withdrawJob(accessToken: string | null, jobId: string) {
  return apiClient<{ success: boolean; status: string }>(`/jobs/${jobId}/withdraw`, {
    method: 'POST',
    accessToken,
    tenant: true,
  });
}

export function duplicateJob(accessToken: string | null, jobId: string) {
  return apiClient<Job>(`/jobs/${jobId}/duplicate`, {
    method: 'POST',
    accessToken,
    tenant: true,
  });
}

export function closeJob(accessToken: string | null, jobId: string, reason?: string) {
  return apiClient<{ success: boolean; status: string }>(`/jobs/${jobId}/close`, {
    method: 'PATCH',
    accessToken,
    tenant: true,
    body: JSON.stringify({ reason }),
  });
}

export function deleteJob(accessToken: string | null, jobId: string) {
  return apiClient<{ success: boolean }>(`/jobs/${jobId}`, {
    method: 'DELETE',
    accessToken,
    tenant: true,
  });
}

export function getMyPostedJobs(accessToken?: string | null) {
  return apiClient<Job[]>('/jobs/mine', {
    accessToken,
    tenant: true,
  });
}

// -------------------------------------------------------------
// Applications
// -------------------------------------------------------------

export function applyToJob(
  accessToken: string | null,
  jobId: string,
  input: ApplyJobInput | string = {},
) {
  const payload = typeof input === 'string' ? { coverLetter: input, message: input } : input;
  return apiClient<{ id: string; jobId: string }>(`/jobs/${jobId}/applications`, {
    method: 'POST',
    accessToken,
    tenant: true,
    body: JSON.stringify(payload),
  });
}

export function getMyApplications(accessToken?: string | null, page = 1, limit = 20) {
  return apiClient<ApplicationCandidateRecord[]>(`/applications/my?page=${page}&limit=${limit}`, {
    accessToken,
    tenant: true,
  });
}

export function getReceivedApplications(
  accessToken?: string | null,
  params: { jobId?: string; status?: string; page?: number; limit?: number } = {},
) {
  const query = new URLSearchParams();
  if (params.jobId) query.set('jobId', params.jobId);
  if (params.status && params.status !== 'ALL') query.set('status', params.status);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  return apiClient<ApplicationCandidateRecord[]>(`/applications/received${qs ? `?${qs}` : ''}`, {
    accessToken,
    tenant: true,
  });
}

export function getJobApplications(
  accessToken: string | null,
  jobId: string,
  params: { status?: string; search?: string } = {},
) {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'ALL') query.set('status', params.status);
  if (params.search) query.set('search', params.search);

  const qs = query.toString();
  return apiClient<ApplicationCandidateRecord[]>(`/jobs/${jobId}/applications${qs ? `?${qs}` : ''}`, {
    accessToken,
    tenant: true,
  });
}

export function getApplicationDetail(accessToken: string | null, applicationId: string) {
  return apiClient<ApplicationCandidateRecord>(`/applications/${applicationId}`, {
    accessToken,
    tenant: true,
  });
}

export function withdrawApplication(accessToken: string | null, applicationId: string, note?: string) {
  return apiClient<{ success: boolean; status: string }>(`/applications/${applicationId}/withdraw`, {
    method: 'PATCH',
    accessToken,
    tenant: true,
    body: JSON.stringify({ note }),
  });
}

export function updateApplicationStatus(
  accessToken: string | null,
  jobId: string,
  applicationId: string,
  status: string,
  ownerNote?: string,
) {
  return apiClient<ApplicationCandidateRecord>(`/jobs/${jobId}/applications/${applicationId}/status`, {
    method: 'PATCH',
    accessToken,
    tenant: true,
    body: JSON.stringify({ status, ownerNote }),
  });
}

export async function uploadResume(accessToken: string | null, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await apiClient<{ resumeKey: string; sizeBytes: number }>('/uploads/resume', {
    method: 'POST',
    accessToken,
    tenant: true,
    body: formData,
  });

  return {
    ...res,
    data: res.data
      ? {
          key: res.data.resumeKey,
          resumeKey: res.data.resumeKey,
          originalName: file.name,
          size: res.data.sizeBytes,
          url: '',
        }
      : undefined,
  };
}

export function getApplicationResumeSignedUrl(accessToken: string | null, applicationId: string) {
  return apiClient<{ url: string; key: string }>(`/applications/${applicationId}/resume`, {
    accessToken,
    tenant: true,
  });
}

// -------------------------------------------------------------
// Moderator & Admin
// -------------------------------------------------------------

export function getModeratorJobsQueue(accessToken: string | null, params: ModeratorQueueParams = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.mine !== undefined) query.set('mine', String(params.mine));
  if (params.category && params.category !== 'All') query.set('category', params.category);
  if (params.q) query.set('q', params.q);
  else if (params.search) query.set('q', params.search);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  return apiClient<Job[]>(`/moderator/jobs${qs ? `?${qs}` : ''}`, {
    accessToken,
    tenant: true,
  });
}

export function getModeratorJobDetail(accessToken: string | null, jobId: string) {
  return apiClient<Job>(`/moderator/jobs/${jobId}`, {
    accessToken,
    tenant: true,
  });
}

export function claimJob(accessToken: string | null, jobId: string) {
  return apiClient<{ success: boolean; claimedAt: string }>(`/moderator/jobs/${jobId}/claim`, {
    method: 'POST',
    accessToken,
    tenant: true,
  });
}

export function unclaimJob(accessToken: string | null, jobId: string) {
  return apiClient<{ success: boolean }>(`/moderator/jobs/${jobId}/unclaim`, {
    method: 'POST',
    accessToken,
    tenant: true,
  });
}

export function approveJob(accessToken: string | null, jobId: string) {
  return apiClient<Job>(`/moderator/jobs/${jobId}/approve`, {
    method: 'POST',
    accessToken,
    tenant: true,
  });
}

export function rejectJob(
  accessToken: string | null,
  jobId: string,
  data: { reason: string; reasonCode?: string; internalNote?: string },
) {
  return apiClient<Job>(`/moderator/jobs/${jobId}/reject`, {
    method: 'POST',
    accessToken,
    tenant: true,
    body: JSON.stringify(data),
  });
}

export function requestJobChanges(
  accessToken: string | null,
  jobId: string,
  data: { notes: string; internalNote?: string },
) {
  return apiClient<Job>(`/moderator/jobs/${jobId}/request-changes`, {
    method: 'POST',
    accessToken,
    tenant: true,
    body: JSON.stringify(data),
  });
}

export function getAdminJobs(accessToken: string | null, params: AdminJobsParams = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.search) query.set('search', params.search);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  return apiClient<Job[]>(`/admin/jobs${qs ? `?${qs}` : ''}`, {
    accessToken,
    tenant: true,
  });
}

export function adminOverrideJob(
  accessToken: string | null,
  jobId: string,
  data: { action: 'APPROVE' | 'REJECT' | 'CLOSE' | 'PUBLISH'; reason?: string; internalNote?: string },
) {
  return apiClient<Job>(`/admin/jobs/${jobId}/override`, {
    method: 'POST',
    accessToken,
    tenant: true,
    body: JSON.stringify(data),
  });
}

// -------------------------------------------------------------
// Backwards Compatibility Functions
// -------------------------------------------------------------

export function getPendingJobs(accessToken: string | null) {
  return getModeratorJobsQueue(accessToken, { status: 'SUBMITTED' });
}

export function getMyJobs(accessToken: string | null) {
  return apiClient<MyJobsResponse>('/jobs/mine', { accessToken, tenant: true });
}

export function reviewJob(
  accessToken: string | null,
  jobId: string,
  status: 'APPROVED' | 'REJECTED',
  rejectionReason?: string,
) {
  if (status === 'APPROVED') {
    return approveJob(accessToken, jobId);
  }
  return rejectJob(accessToken, jobId, {
    reason: rejectionReason || 'Posting does not meet platform guidelines.',
    reasonCode: 'POLICY_VIOLATION',
  });
}
