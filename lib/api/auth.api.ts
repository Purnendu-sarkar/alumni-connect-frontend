import { apiClient } from './client';
import type { SessionUser, UserRole } from '@/types/domain';

export interface AuthSession { accessToken: string; user: SessionUser }

export function login(input: { email: string; password: string }) {
  return apiClient<AuthSession>('/auth/login', { method: 'POST', body: JSON.stringify(input) });
}

export function register(input: { name: string; email: string; password: string; universitySlug: string; role: Extract<UserRole, 'STUDENT' | 'ALUMNI'> }) {
  return apiClient<AuthSession>('/auth/register', { method: 'POST', body: JSON.stringify(input) });
}
