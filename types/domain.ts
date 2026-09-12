export type UserRole = 'STUDENT' | 'ALUMNI' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified: boolean;
  university: { id: string; slug: string; domain: string };
}

export interface Alumni {
  id: string;
  name: string;
  batch: string | null;
  department: string | null;
  currentCompany: string | null;
  position: string | null;
  bio: string | null;
  skills: string[];
  avatarUrl: string | null;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string | null;
  employmentType: string | null;
  applicationUrl: string | null;
  applicationEmail: string | null;
  expiresAt: string | null;
  createdAt: string;
  postedBy: { id: string; name: string; currentCompany: string | null };
}
