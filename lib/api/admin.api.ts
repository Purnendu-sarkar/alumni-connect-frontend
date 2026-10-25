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
