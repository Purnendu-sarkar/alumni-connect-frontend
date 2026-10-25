import { apiClient } from './client';
import type { SessionUser, UserRole } from '@/types/domain';

export interface AuthSession {
  accessToken: string;
  user: SessionUser;
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
  return apiClient<AuthSession>('/auth/register', { method: 'POST', body: JSON.stringify(input) });
}

export function refreshSession() {
  return apiClient<AuthSession>('/auth/refresh', { method: 'POST' });
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
  return apiClient<void>('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}
