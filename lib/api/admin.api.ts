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

export interface ModeratorInvitation {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  invitedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export function inviteModerator(accessToken: string | null, email: string) {
  return apiClient<{
    id: string;
    email: string;
    expiresAt: string;
    deliveredViaSmtp: boolean;
    invitationUrl?: string;
  }>('/admin/moderators/invite', {
    method: 'POST',
    accessToken,
    body: JSON.stringify({ email }),
  });
}

export function getModeratorInvitations(accessToken: string | null) {
  return apiClient<ModeratorInvitation[]>('/admin/moderators/invitations', {
    method: 'GET',
    accessToken,
  });
}

export function resendModeratorInvitation(accessToken: string | null, id: string) {
  return apiClient<{
    id: string;
    email: string;
    expiresAt: string;
    deliveredViaSmtp: boolean;
    invitationUrl?: string;
  }>(`/admin/moderators/invitations/${id}/resend`, {
    method: 'POST',
    accessToken,
  });
}

export function revokeModeratorInvitation(accessToken: string | null, id: string) {
  return apiClient<{ success: boolean; message: string }>(`/admin/moderators/invitations/${id}`, {
    method: 'DELETE',
    accessToken,
  });
}

export function toggleUserSuspension(accessToken: string | null, userId: string, isActive: boolean) {
  return apiClient<{ id: string; isActive: boolean; email: string }>(`/admin/users/${userId}/status`, {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify({ isActive }),
  });
}

export interface AuditLogItem {
  id: string;
  action: string;
  actorName: string;
  actorRole: string;
  target: string;
  details: string;
  timestamp: string;
}

export interface AuditLogResponse {
  logs: AuditLogItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function getAuditLogs(accessToken: string | null, page = 1, limit = 50) {
  return apiClient<AuditLogResponse>(`/admin/audit-logs?page=${page}&limit=${limit}`, {
    method: 'GET',
    accessToken,
  });
}
