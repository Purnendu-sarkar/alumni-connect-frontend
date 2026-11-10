import { apiClient } from './client';
import { useAuthStore } from '@/store/auth-store';
import type { ApiResponse } from '@/types/api';
import type { SessionUser, UserRole } from '@/types/domain';

export interface AuthSession {
  accessToken: string;
  user: SessionUser;
}

let activeRefreshPromise: Promise<ApiResponse<AuthSession>> | null = null;

export function refreshSession(): Promise<ApiResponse<AuthSession>> {
  // If logout is in progress, immediately abort without sending network request
  if (typeof window !== 'undefined' && useAuthStore.getState().isLoggingOut) {
    return Promise.reject(new Error('Logout in progress.'));
  }

  // Single-flight deduplication: reuse active promise to prevent duplicate concurrent network requests
  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }

  activeRefreshPromise = apiClient<AuthSession>('/auth/refresh', { method: 'POST' }).finally(() => {
    activeRefreshPromise = null;
  });

  return activeRefreshPromise;
}

export interface RegisterResult {
  user: SessionUser;
  deliveredViaSmtp: boolean;
  debugToken?: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  universitySlug: string;
  role: Extract<UserRole, 'STUDENT' | 'ALUMNI'>;
  department: string;
  batch: string;
  studentId?: string;
  currentSemester?: string;
  admissionYear?: string;
  expectedGraduationYear?: string;
  graduationYear?: string;
  academicId?: string;
  employmentStatus?: string;
  currentCompany?: string;
  position?: string;
  skills?: string[];
  interests?: string[];
}

export function login(input: { email: string; password: string }) {
  return apiClient<AuthSession>('/auth/login', { method: 'POST', body: JSON.stringify(input) });
}

export function register(input: RegisterInput) {
  return apiClient<RegisterResult>('/auth/register', { method: 'POST', body: JSON.stringify(input) });
}

export function logout() {
  return apiClient<void>('/auth/logout', { method: 'POST' });
}

export interface DemoCapabilities {
  enabled: boolean;
  environment: string;
  roles: Array<{ role: UserRole; label: string; email: string }>;
}

export function getDemoCapabilities() {
  return apiClient<DemoCapabilities>('/auth/demo-capabilities', { method: 'GET' });
}

export function demoLogin(role: UserRole) {
  return apiClient<AuthSession>('/auth/demo-login', {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
}

export function forgotPassword(email: string) {
  return apiClient<{ message: string; debugToken?: string; resetUrl?: string }>(
    '/auth/forgot-password',
    {
      method: 'POST',
      body: JSON.stringify({ email }),
    },
  );
}

export function resetPassword(token: string, newPassword: string) {
  return apiClient<void>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}

export function verifyEmail(token: string) {
  return apiClient<{ success: boolean; message: string }>('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export function resendVerificationEmail(email: string) {
  return apiClient<{ success: boolean; message: string; debugToken?: string; verificationUrl?: string }>(
    '/auth/resend-verification-email',
    {
      method: 'POST',
      body: JSON.stringify({ email }),
    },
  );
}

export function validateSetupAccount(token: string) {
  return apiClient<{
    email: string;
    role: UserRole;
    expiresAt: string;
    university: { name: string; slug: string };
  }>(`/auth/setup-account/validate?token=${encodeURIComponent(token)}`, {
    method: 'GET',
  });
}

export function setupAccount(input: { token: string; name: string; password: string }) {
  return apiClient<AuthSession>('/auth/setup-account', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function changePassword(
  accessToken: string | null,
  input: { currentPassword: string; newPassword: string },
) {
  return apiClient<{ success: boolean; message: string }>('/auth/change-password', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(input),
  });
}
