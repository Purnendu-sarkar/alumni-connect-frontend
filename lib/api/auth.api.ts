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
