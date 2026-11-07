import { apiClient } from './client';
import type { VerificationItem, VerificationStatus, UserRole } from '@/types/domain';

export interface VerificationQueryParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: VerificationStatus;
  search?: string;
}

export function getVerifications(filters: VerificationQueryParams = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.role) params.set('role', filters.role);
  if (filters.status) params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);

  const queryStr = params.toString() ? `?${params.toString()}` : '';
  return apiClient<VerificationItem[]>(`/admin/verifications${queryStr}`);
}

export function reviewVerification(
  userId: string,
  input: { status: 'APPROVED' | 'REJECTED'; reason?: string },
) {
  return apiClient<VerificationItem>(`/admin/users/${userId}/verification`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export interface AdminStats {
  totalUsers: number;
  pendingVerifications: number;
  approvedUsers: number;
  totalJobs: number;
  pendingJobs: number;
}

export function getAdminStats() {
  return apiClient<AdminStats>('/admin/stats');
}

export function getAuditLogs(params: { page?: number; limit?: number; action?: string } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.action) query.set('action', params.action);
  const queryStr = query.toString() ? `?${query.toString()}` : '';
  return apiClient<any[]>(`/admin/audit-logs${queryStr}`);
}
