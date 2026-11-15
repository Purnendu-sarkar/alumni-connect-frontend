import { apiClient } from './client';

export interface DirectoryFilters {
  group?: 'alumni' | 'students';
  q?: string;
  department?: string;
  gradYear?: string;
  industry?: string;
  location?: string;
  skills?: string[];
  mentorship?: boolean | string;
  sort?: 'name' | 'graduationYear' | 'recentlyJoined';
  page?: number;
  limit?: number;
}

export interface DirectoryMemberCard {
  id: string;
  name: string;
  avatarUrl?: string | null;
  role: 'STUDENT' | 'ALUMNI';
  department?: string | null;
  departmentId?: string | null;
  departmentRef?: { id: string; name: string; code: string; faculty?: string } | null;
  batch?: string | null;
  graduationYear?: string | null;
  verified: boolean;
  verificationStatus: string;
  currentCompany?: string | null;
  position?: string | null;
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  email?: string | null;
  phone?: string | null;
  skills: string[];
  mentorshipBadge?: 'OPEN' | 'FULL' | 'CLOSED' | null;
  connectionStatus: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'CONNECTED';
  relationship: 'SELF' | 'CONNECTED' | 'VERIFIED_MEMBER' | 'BLOCKED';
}

export interface DirectoryMemberDetail extends DirectoryMemberCard {
  profileVisible: boolean;
  studentId?: string | null;
  academicId?: string | null;
  admissionYear?: string | null;
  expectedGraduationYear?: string | null;
  currentSemester?: string | null;
  employmentStatus?: string | null;
  interests?: string[];
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  websiteUrl?: string | null;
  mentorshipTopics?: string[];
  maxActiveMentees?: number;
  activeMentorshipStatus?: string | null;
  university?: { id: string; name: string; slug: string };
  createdAt?: string;
}

export function searchDirectory(accessToken: string | null, filters: DirectoryFilters = {}) {
  const params = new URLSearchParams();

  if (filters.group) params.set('group', filters.group);
  if (filters.q?.trim()) params.set('q', filters.q.trim());
  if (filters.department && filters.department !== 'All') params.set('department', filters.department);
  if (filters.gradYear && filters.gradYear !== 'All') params.set('gradYear', filters.gradYear);
  if (filters.industry) params.set('industry', filters.industry);
  if (filters.location) params.set('location', filters.location);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.mentorship) params.set('mentorship', 'true');
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  if (filters.skills && filters.skills.length > 0) {
    for (const skill of filters.skills) {
      params.append('skills', skill);
    }
  }

  return apiClient<DirectoryMemberCard[]>(`/directory?${params.toString()}`, { accessToken });
}

export function getDirectoryMemberById(accessToken: string | null, id: string) {
  return apiClient<DirectoryMemberDetail>(`/directory/${id}`, { accessToken });
}
