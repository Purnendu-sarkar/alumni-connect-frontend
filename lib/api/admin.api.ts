import { apiClient } from './client';
import type { VerificationItem, VerificationStatus, UserRole } from '@/types/domain';

export interface VerificationQueryParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: VerificationStatus;
  emailVerified?: 'ALL' | 'VERIFIED' | 'UNVERIFIED';
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
  if (filters.emailVerified) params.set('emailVerified', filters.emailVerified);
  if (filters.search) params.set('search', filters.search);

  const queryStr = params.toString() ? `?${params.toString()}` : '';
  return apiClient<VerificationItem[]>(`/admin/verifications${queryStr}`, {
    accessToken,
  });
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  batch: string | null;
  department: string | null;
  departmentId?: string | null;
  studentId: string | null;
  academicId: string | null;
  currentSemester: string | null;
  expectedGraduationYear?: string | null;
  graduationYear: string | null;
  employmentStatus: string | null;
  currentCompany: string | null;
  position: string | null;
  avatarUrl: string | null;
  verified: boolean;
  verificationStatus: VerificationStatus;
  isActive: boolean;
  isDemo: boolean;
  needPasswordChange: boolean;
  createdAt: string;
  updatedAt: string;
  role: { id: string; name: UserRole };
}

export interface AdminUsersQueryParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: 'ACTIVE' | 'SUSPENDED';
  verificationStatus?: VerificationStatus;
  search?: string;
  department?: string;
}

export function getAdminUsers(
  accessToken: string | null,
  filters: AdminUsersQueryParams = {},
) {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.role) params.set('role', filters.role);
  if (filters.status) params.set('status', filters.status);
  if (filters.verificationStatus) params.set('verificationStatus', filters.verificationStatus);
  if (filters.search) params.set('search', filters.search);
  if (filters.department) params.set('department', filters.department);

  const queryStr = params.toString() ? `?${params.toString()}` : '';
  return apiClient<AdminUserItem[]>(`/admin/users${queryStr}`, {
    accessToken,
  });
}

export interface AdminUserDetail {
  id: string;
  name: string;
  email: string;
  department: string | null;
  departmentId?: string | null;
  departmentRef?: { id: string; name: string; code: string } | null;
  batch: string | null;
  studentId: string | null;
  currentSemester: string | null;
  admissionYear: string | null;
  expectedGraduationYear: string | null;
  graduationYear: string | null;
  academicId: string | null;
  employmentStatus: string | null;
  currentCompany: string | null;
  position: string | null;
  bio: string | null;
  headline: string | null;
  location: string | null;
  phone: string | null;
  phonePublic: boolean;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  githubUrl: string | null;
  skills: string[];
  interests: string[];
  avatarUrl: string | null;
  verified: boolean;
  verificationStatus: VerificationStatus;
  rejectionReason: string | null;
  verifiedAt: string | null;
  isActive: boolean;
  isDemo: boolean;
  needPasswordChange: boolean;
  createdAt: string;
  updatedAt: string;
  role: { id: string; name: UserRole; description?: string };
  university: { id: string; name: string; slug: string; domain: string };
  _count?: {
    sentConnections: number;
    receivedConnections: number;
    mentoringRequests: number;
    menteeRequests: number;
    jobsPosted: number;
    jobApplications: number;
    eventRsvps: number;
    authoredStories: number;
  };
  refreshTokens: Array<{
    id: string;
    createdAt: string;
    expiresAt: string;
    revokedAt: string | null;
  }>;
  auditLogs: Array<{
    id: string;
    action: string;
    targetType: string;
    targetId: string;
    createdAt: string;
    metadata?: Record<string, unknown> | null;
    actor?: { id: string; name: string; email: string };
  }>;
}

export function getAdminUserDetail(accessToken: string | null, userId: string) {
  return apiClient<AdminUserDetail>(`/admin/users/${userId}`, {
    accessToken,
  });
}

export interface UpdateAdminUserPayload {
  name?: string;
  departmentId?: string | null;
  department?: string | null;
  batch?: string | null;
  graduationYear?: string | null;
  studentId?: string | null;
  academicId?: string | null;
  currentSemester?: string | null;
  expectedGraduationYear?: string | null;
  position?: string | null;
  currentCompany?: string | null;
  employmentStatus?: string | null;
}

export function updateAdminUser(
  accessToken: string | null,
  userId: string,
  data: UpdateAdminUserPayload,
) {
  return apiClient<AdminUserItem>(`/admin/users/${userId}`, {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify(data),
  });
}

export function changeAdminUserRole(
  accessToken: string | null,
  userId: string,
  data: {
    role: 'STUDENT' | 'ALUMNI';
    graduationYear?: string | null;
    batch?: string | null;
    reason: string;
  },
) {
  return apiClient<AdminUserItem>(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify(data),
  });
}

export function sendAdminPasswordReset(accessToken: string | null, userId: string) {
  return apiClient<{ success: boolean; message: string; deliveredViaSmtp: boolean }>(
    `/admin/users/${userId}/send-reset`,
    {
      method: 'POST',
      accessToken,
    },
  );
}

export function terminateUserSessions(accessToken: string | null, userId: string) {
  return apiClient<{ success: boolean; message: string }>(`/admin/users/${userId}/sessions`, {
    method: 'DELETE',
    accessToken,
  });
}

export function reviewVerification(
  accessToken: string | null,
  userId: string,
  input: { status: 'APPROVED' | 'REJECTED' | 'REVOKED'; reason?: string },
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

export interface DepartmentMetric {
  department: string;
  code?: string;
  students: number;
  alumni: number;
  total: number;
}

export interface AdminStats {
  scope?: string;
  totalUsers: number;
  totalStudents: number;
  totalAlumni: number;
  totalModerators: number;
  totalAdmins: number;
  totalSuperAdmins?: number;
  approvedUsers: number;
  pendingVerifications: number;
  pendingEmailVerifications: number;
  suspendedUsers?: number;
  totalJobs: number;
  pendingJobs: number;
  auditLogsCount: number;
  totalUniversities?: number;

  // Verification Funnel
  registeredCount?: number;
  emailVerifiedCount?: number;
  adminVerifiedCount?: number;
  rejectedVerificationCount?: number;

  // Network & Mentorship Velocity
  totalConnections?: number;
  acceptedConnections?: number;
  pendingConnections?: number;
  totalMentorships?: number;
  activeMentorships?: number;
  completedMentorships?: number;
  pendingMentorships?: number;

  // Jobs & Applications Pipeline
  publishedJobs?: number;
  pendingReviewJobs?: number;
  closedJobs?: number;
  totalApplications?: number;
  shortlistedApplications?: number;
  acceptedApplications?: number;

  // Events, Content & Moderation
  totalEvents?: number;
  upcomingEvents?: number;
  totalEventRsvps?: number;
  totalAnnouncements?: number;
  publishedStories?: number;
  openReports?: number;
  resolvedReports?: number;
  totalAuditLogs?: number;

  // Department Breakdown
  departmentBreakdown?: DepartmentMetric[];
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

export interface ModeratorStaffStats {
  jobsReviewed30d: number;
  storiesReviewed30d: number;
  activeClaimedJobs: number;
  activeClaimedStories: number;
}

export interface ModeratorStaffItem {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  department: string | null;
  isActive: boolean;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  stats?: ModeratorStaffStats;
  activityStats?: ModeratorStaffStats;
}

export interface ModeratorOverviewPayload {
  moderators: ModeratorStaffItem[];
  invitations: ModeratorInvitation[];
}

export function getAdminModerators(accessToken: string | null) {
  return apiClient<ModeratorOverviewPayload>('/admin/moderators', {
    method: 'GET',
    accessToken,
  });
}

export function removeAdminModerator(
  accessToken: string | null,
  userId: string,
  reason: string,
) {
  return apiClient<{
    user: { id: string; name: string; email: string; isActive: boolean };
    releasedJobsCount: number;
    releasedStoriesCount: number;
  }>(`/admin/moderators/${userId}/remove`, {
    method: 'POST',
    accessToken,
    body: JSON.stringify({ reason }),
  });
}

export function inviteModerator(accessToken: string | null, email: string) {
  return apiClient<{
    id: string;
    email: string;
    expiresAt: string;
    deliveredViaSmtp: boolean;
    setupUrl?: string;
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
    setupUrl?: string;
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

export interface RoleSummaryItem {
  name: UserRole;
  description: string;
  userCount: number;
  permissionCount: number;
}

export interface PermissionMatrixRow {
  key: string;
  resource: string;
  action: string;
  description: string;
  roles: {
    STUDENT: boolean;
    ALUMNI: boolean;
    MODERATOR: boolean;
    SUPER_ADMIN: boolean;
  };
}

export interface SuperAdminRosterItem {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  isActive: boolean;
  verified: boolean;
  createdAt: string;
}

export interface RoleAuditLogEntry {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  actor?: { id: string; name: string; email: string } | null;
}

export interface AdminRolesOverview {
  roles: RoleSummaryItem[];
  permissionMatrix: PermissionMatrixRow[];
  superAdmins: SuperAdminRosterItem[];
  recentRoleAuditLogs: RoleAuditLogEntry[];
}

export function getAdminRolesOverview(accessToken: string | null) {
  return apiClient<AdminRolesOverview>('/admin/roles', {
    method: 'GET',
    accessToken,
  });
}

export function toggleUserSuspension(
  accessToken: string | null,
  userId: string,
  isActive: boolean,
  reason?: string,
) {
  return apiClient<{ id: string; isActive: boolean; email: string }>(`/admin/users/${userId}/status`, {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify({ isActive, reason }),
  });
}

export interface AuditLogItem {
  id: string;
  action: string;
  actorId?: string | null;
  actorName: string;
  actorEmail?: string | null;
  actorRole: string;
  target: string;
  targetType?: string | null;
  targetId?: string | null;
  result?: 'SUCCESS' | 'FAILURE';
  ip?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
  details: string;
  metadata?: Record<string, unknown> | null;
  timestamp: string;
}

export interface AuditLogQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  actorId?: string;
  actorRole?: string;
  targetType?: string;
  result?: 'SUCCESS' | 'FAILURE';
  startDate?: string;
  endDate?: string;
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

export function getAuditLogs(
  accessToken?: string | null,
  filtersOrPage: AuditLogQueryFilters | number = {},
  limit?: number,
) {
  const filters: AuditLogQueryFilters =
    typeof filtersOrPage === 'number'
      ? { page: filtersOrPage, limit: limit ?? 50 }
      : filtersOrPage;

  const query = new URLSearchParams();
  if (filters.page) query.set('page', String(filters.page));
  if (filters.limit) query.set('limit', String(filters.limit));
  if (filters.search) query.set('search', filters.search);
  if (filters.action) query.set('action', filters.action);
  if (filters.actorId) query.set('actorId', filters.actorId);
  if (filters.actorRole) query.set('actorRole', filters.actorRole);
  if (filters.targetType) query.set('targetType', filters.targetType);
  if (filters.result) query.set('result', filters.result);
  if (filters.startDate) query.set('startDate', filters.startDate);
  if (filters.endDate) query.set('endDate', filters.endDate);

  const qs = query.toString();
  return apiClient<AuditLogItem[]>(`/admin/audit-logs${qs ? `?${qs}` : ''}`, {
    method: 'GET',
    accessToken,
  });
}

export interface AdminSystemSettings {
  universityName: string;
  domain: string;
  allowedEmailDomains: string[];
  requireEmailVerification: boolean;
  requireAlumniVerification: boolean;
  moderatorAutoApproval: boolean;
  sessionTimeoutMin: number;
  maxActiveMentees: number;
  allowStudentJobApply: boolean;
  allowAlumniMentorship: boolean;
}

export function getAdminSettings(accessToken: string | null) {
  return apiClient<AdminSystemSettings>('/admin/settings', {
    method: 'GET',
    accessToken,
  });
}

export function updateAdminSettings(
  accessToken: string | null,
  payload: Partial<AdminSystemSettings>,
) {
  return apiClient<AdminSystemSettings>('/admin/settings', {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify(payload),
  });
}

export interface BroadcastPayload {
  audience: 'ALL' | 'STUDENTS' | 'ALUMNI' | 'MODERATORS';
  category?: 'GENERAL' | 'ACADEMIC' | 'CAREER' | 'EVENT' | 'SECURITY_SYSTEM';
  title: string;
  message: string;
  link?: string;
}

export interface BroadcastResult {
  recipientCount: number;
  audience: string;
  title: string;
  sentAt: string;
}

export interface BroadcastHistoryItem {
  id: string;
  sentAt: string;
  senderName: string;
  senderEmail: string | null;
  audience: 'ALL' | 'STUDENTS' | 'ALUMNI' | 'MODERATORS';
  category: string;
  title: string;
  recipientCount: number;
  link: string | null;
}

export function sendAdminBroadcast(accessToken: string | null, payload: BroadcastPayload) {
  return apiClient<BroadcastResult>('/admin/notifications/broadcast', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(payload),
  });
}

export function getAdminBroadcasts(accessToken: string | null) {
  return apiClient<BroadcastHistoryItem[]>('/admin/notifications/broadcasts', {
    method: 'GET',
    accessToken,
  });
}
