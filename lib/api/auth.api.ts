import { apiClient } from './client';
import type { CurrentUser } from '@/lib/hooks/use-auth';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'ALUMNI';
  department: string;
  batch?: string;
  universityId?: string;
  graduationYear?: number;
}

export function login(input: { email: string; password: string }) {
  return apiClient<{ user: CurrentUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function register(input: RegisterInput) {
  return apiClient<{ user: CurrentUser }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function refreshSession() {
  return apiClient<{ user: CurrentUser }>('/auth/refresh', { method: 'POST' });
}

export function logout() {
  return apiClient<void>('/auth/logout', { method: 'POST' });
}

export function reauth(password: string) {
  return apiClient<{ message: string }>('/auth/reauth', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

export function forgotPassword(email: string) {
  return apiClient<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token: string, password: string) {
  return apiClient<void>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

export function verifyEmail(token: string) {
  return apiClient<{ message: string; role?: string; status?: string }>('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export function validateSetupToken(token: string) {
  return apiClient<{ valid: boolean; email: string; name?: string; role: string }>(
    `/auth/setup-account/validate?token=${encodeURIComponent(token)}`,
  );
}

export function setupAccount(input: { token: string; password: string }) {
  return apiClient<{ message: string }>('/auth/setup-account', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function resendVerification(email: string) {
  return apiClient<{ message: string }>('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}
