import { apiClient } from './client';
import type { VerificationItem, VerificationStatus, UserRole } from '@/types/domain';

export interface VerificationQueryParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: VerificationStatus;
  search?: string;
}

export function getVerifications(
  accessToken: string | null,
  filters: VerificationQueryParams = {},
) {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.role) params.set('role', filters.role);
  if (filters.status) params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);

  const queryStr = params.toString() ? `?${params.toString()}` : '';
  return apiClient<VerificationItem[]>(`/admin/verifications${queryStr}`, {
    accessToken,
  });
}

export function reviewVerification(
  accessToken: string | null,
  userId: string,
  input: { status: 'APPROVED' | 'REJECTED'; reason?: string },
) {
  return apiClient<VerificationItem>(`/admin/users/${userId}/verification`, {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify(input),
  });
}

export interface UniversityRecord {
  id: string;
  name: string;
  slug: string;
  domain: string;
  isActive: boolean;
  isDemo?: boolean;
  createdAt: string;
  _count?: {
    users: number;
    jobs: number;
  };
}

export interface AdminStats {
  totalUsers: number;
  pendingVerifications: number;
  approvedUsers: number;
  totalJobs: number;
  pendingJobs: number;
  totalUniversities: number;
}

export function getAdminStats(accessToken: string | null) {
  return apiClient<AdminStats>('/admin/stats', {
    method: 'GET',
    accessToken,
  });
}

export function getUniversities(accessToken: string | null) {
  return apiClient<UniversityRecord[]>('/admin/universities', {
    method: 'GET',
    accessToken,
  });
}

export function createUniversity(
  accessToken: string | null,
  data: { name: string; slug: string; domain: string },
) {
  return apiClient<UniversityRecord>('/admin/universities', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(data),
  });
}

export function toggleUniversityStatus(
  accessToken: string | null,
  universityId: string,
  isActive: boolean,
) {
  return apiClient<UniversityRecord>(`/admin/universities/${universityId}/status`, {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify({ isActive }),
  });
}
