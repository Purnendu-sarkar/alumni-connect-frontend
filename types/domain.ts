export type UserRole = 'STUDENT' | 'ALUMNI' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface UniversitySummary {
  id: string;
  name?: string;
  slug: string;
  domain: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified: boolean;
  verificationStatus?: VerificationStatus;
  rejectionReason?: string | null;
  avatarUrl?: string | null;
  department?: string | null;
  batch?: string | null;
  university: UniversitySummary;
}

export interface UserProfile {
  id: string;
  universityId: string;
  name: string;
  email: string;
  department: string | null;
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
  onboardingCompleted: boolean;
  completionPercentage?: number;
  createdAt: string;
  updatedAt: string;
  role: { id: string; name: UserRole };
  university: UniversitySummary;
}

export interface Alumni {
  id: string;
  name: string;
  batch: string | null;
  department: string | null;
  currentCompany: string | null;
  position: string | null;
  bio: string | null;
  headline?: string | null;
  location?: string | null;
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
  githubUrl?: string | null;
  skills: string[];
  interests?: string[];
  avatarUrl: string | null;
  verified?: boolean;
  verificationStatus?: VerificationStatus;
  graduationYear?: string | null;
  employmentStatus?: string | null;
  phone?: string | null;
  phonePublic?: boolean;
  createdAt?: string;
  university?: { id: string; name: string; slug: string };
}

export interface VerificationItem {
  id: string;
  name: string;
  email: string;
  batch: string | null;
  department: string | null;
  studentId: string | null;
  academicId: string | null;
  currentSemester: string | null;
  graduationYear: string | null;
  employmentStatus: string | null;
  currentCompany: string | null;
  position: string | null;
  avatarUrl: string | null;
  verified: boolean;
  verificationStatus: VerificationStatus;
  rejectionReason: string | null;
  verifiedAt: string | null;
  createdAt: string;
  role: { id: string; name: UserRole };
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
