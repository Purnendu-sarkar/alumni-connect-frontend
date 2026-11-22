import { apiClient } from './client';
import type { PageMeta } from '@/types/api';

export type ReportType =
  | 'INAPPROPRIATE_CONTENT'
  | 'FAKE_PROFILE'
  | 'SPAM'
  | 'MISLEADING_JOB'
  | 'HARASSMENT'
  | 'OTHER';

export type ReportTargetType = 'USER' | 'JOB' | 'STORY' | 'MESSAGE' | 'EVENT';

export type ReportStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'REVIEWED'
  | 'RESOLVED'
  | 'REJECTED'
  | 'DISMISSED'
  | 'ESCALATED';

export type RestrictionType = 'MESSAGING' | 'JOB_POSTING' | 'MENTORSHIP_REQUESTS';

export interface ReportUserSummary {
  id: string;
  name: string;
  email?: string;
  role: string;
}

export interface ReportActionItem {
  id: string;
  reportId: string;
  actor: {
    id: string;
    name: string;
    role: string;
  };
  actorRole: string;
  actionType: string;
  note: string | null;
  metadata?: unknown;
  createdAt: string;
}

export interface UserRestrictionRecord {
  id: string;
  universityId: string;
  userId: string;
  type: RestrictionType;
  reason: string;
  startsAt: string;
  endsAt: string;
  createdById: string;
  revokedAt?: string | null;
  revokeReason?: string | null;
}

export interface ReportItem {
  id: string;
  universityId: string;
  targetType: ReportTargetType;
  targetId: string;
  type: ReportType;
  reason: string;
  status: ReportStatus;
  resolution?: string | null;
  resolutionNote?: string | null;
  snapshot?: Record<string, unknown> | null;
  claimedAt?: string | null;
  escalatedAt?: string | null;
  overturnedAt?: string | null;
  overturnedById?: string | null;
  overturnReason?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  actionsCount?: number;
  reportedBy?: ReportUserSummary | null;
  reportedUser?: ReportUserSummary | null;
  reviewer?: ReportUserSummary | null;
  resolver?: ReportUserSummary | null;
  linkedReportsCount?: number;
  actions?: ReportActionItem[];
  activeRestrictions?: UserRestrictionRecord[];
}

export interface CreateReportInput {
  targetType: ReportTargetType;
  targetId: string;
  type?: ReportType;
  reason: string;
  details?: string;
}

export interface ResolveReportInput {
  actionType: 'NONE' | 'HIDE_CONTENT' | 'WARN_USER' | 'RESTRICT_USER' | 'ESCALATE';
  resolutionNote: string;
  restrictionType?: RestrictionType;
  durationDays?: number;
  publicMessageToTarget?: string;
}

export interface ReportQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  targetType?: string;
  q?: string;
  escalated?: boolean;
}

function buildQuery(params?: ReportQueryParams): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.status) searchParams.set('status', params.status);
  if (params.type) searchParams.set('type', params.type);
  if (params.targetType) searchParams.set('targetType', params.targetType);
  if (params.q) searchParams.set('q', params.q);
  if (params.escalated !== undefined) searchParams.set('escalated', String(params.escalated));
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export async function submitReport(
  data: CreateReportInput,
  accessToken?: string | null,
) {
  return apiClient<ReportItem>('/reports', {
    method: 'POST',
    body: JSON.stringify(data),
    accessToken,
  });
}

export async function getModeratorReports(
  params?: ReportQueryParams,
  accessToken?: string | null,
) {
  const query = buildQuery(params);
  return apiClient<ReportItem[]>(`/moderator/reports${query}`, {
    accessToken,
  });
}

export async function getModeratorReportById(
  id: string,
  accessToken?: string | null,
) {
  return apiClient<ReportItem>(`/moderator/reports/${id}`, {
    accessToken,
  });
}

export async function claimReport(
  id: string,
  accessToken?: string | null,
) {
  return apiClient<ReportItem>(`/moderator/reports/${id}/claim`, {
    method: 'POST',
    accessToken,
  });
}

export async function resolveReport(
  id: string,
  data: ResolveReportInput,
  accessToken?: string | null,
) {
  return apiClient<ReportItem>(`/moderator/reports/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify(data),
    accessToken,
  });
}

export async function rejectReport(
  id: string,
  data: { resolutionNote: string },
  accessToken?: string | null,
) {
  return apiClient<ReportItem>(`/moderator/reports/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify(data),
    accessToken,
  });
}

export async function escalateReport(
  id: string,
  accessToken?: string | null,
) {
  return apiClient<ReportItem>(`/moderator/reports/${id}/escalate`, {
    method: 'POST',
    accessToken,
  });
}

export async function getAdminReports(
  params?: ReportQueryParams,
  accessToken?: string | null,
) {
  const query = buildQuery(params);
  return apiClient<ReportItem[]>(`/admin/reports${query}`, {
    accessToken,
  });
}

export async function getAdminReportById(
  id: string,
  accessToken?: string | null,
) {
  return apiClient<ReportItem>(`/admin/reports/${id}`, {
    accessToken,
  });
}

export async function takeOverReport(
  id: string,
  accessToken?: string | null,
) {
  return apiClient<ReportItem>(`/admin/reports/${id}/take-over`, {
    method: 'POST',
    accessToken,
  });
}

export async function reassignReport(
  id: string,
  data: { moderatorId: string },
  accessToken?: string | null,
) {
  return apiClient<ReportItem>(`/admin/reports/${id}/reassign`, {
    method: 'POST',
    body: JSON.stringify(data),
    accessToken,
  });
}

export async function overturnReport(
  id: string,
  data: { overturnReason: string },
  accessToken?: string | null,
) {
  return apiClient<ReportItem>(`/admin/reports/${id}/overturn`, {
    method: 'POST',
    body: JSON.stringify(data),
    accessToken,
  });
}

export async function liftRestriction(
  id: string,
  data: { revokeReason: string },
  accessToken?: string | null,
) {
  return apiClient<{ success: boolean }>(`/admin/restrictions/${id}`, {
    method: 'DELETE',
    body: JSON.stringify(data),
    accessToken,
  });
}
