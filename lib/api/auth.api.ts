import { apiClient } from './client';
import type { SessionUser, UserRole } from '@/types/domain';

export interface AuthSession { accessToken: string; user: SessionUser }

export function login(input: { email: string; password: string }) {
  return apiClient<AuthSession>('/auth/login', { method: 'POST', body: JSON.stringify(input) });
}

export function register(input: {
  name: string; email: string; password: string; universitySlug: string; role: Extract<UserRole, 'STUDENT' | 'ALUMNI'>;
  batch?: string; department?: string; currentCompany?: string; position?: string;
}) {
  return apiClient<AuthSession>('/auth/register', { method: 'POST', body: JSON.stringify(input) });
}

export function refreshSession() { return apiClient<AuthSession>('/auth/refresh', { method: 'POST' }); }
export function logout() { return apiClient<void>('/auth/logout', { method: 'POST' }); }
