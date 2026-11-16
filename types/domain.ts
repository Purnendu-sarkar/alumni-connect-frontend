export type UserRole = 'STUDENT' | 'ALUMNI' | 'MODERATOR' | 'SUPER_ADMIN';

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
  needPasswordChange?: boolean;
  onboardingCompleted?: boolean;
  isMentorshipAvailable?: boolean;
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
  isMentorshipAvailable?: boolean;
  completionPercentage?: number;
  missingRequiredFields?: string[];
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
  departmentRef?: { id: string; name: string; code: string } | null;
  role?: string | { id?: string; name: string };
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

export type JobStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'PUBLISHED'
  | 'CLOSED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'PENDING'
  | 'APPROVED';

export type JobApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'OFFERED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERNSHIP'
  | 'REMOTE'
  | 'FREELANCE';

export type WorkMode = 'ON_SITE' | 'HYBRID' | 'REMOTE';

export type ExperienceLevel = 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'ANY';

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements?: string | null;
  company: string;
  category?: string | null;
  employmentType: string | null;
  workMode?: string | null;
  experienceLevel?: string | null;
  location: string | null;
  salary?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  deadline?: string | null;
  daysLeft?: number;
  referralAvailable?: boolean;
  requireResume?: boolean;
  requireCoverLetter?: boolean;
  applicationUrl?: string | null;
  applicationEmail?: string | null;
  status?: string;
  submittedAt?: string | null;
  claimedAt?: string | null;
  publishedAt?: string | null;
  closedAt?: string | null;
  closedReason?: string | null;
  latestFeedback?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  applicantCount?: number;
  hasApplied?: boolean;
  viewerApplicationStatus?: string | null;
  postedBy?: {
    id: string;
    name: string;
    email?: string;
    phone?: string | null;
    currentCompany?: string | null;
    position?: string | null;
    department?: string | null;
    batch?: string | null;
    avatarUrl?: string | null;
    verified?: boolean;
  } | null;
  reviewer?: { id: string; name: string; email?: string } | null;
  riskHints?: string[];
  moderationHistory?: Array<{
    id: string;
    action: string;
    reasonCode?: string | null;
    ownerVisibleNote?: string | null;
    internalNote?: string | null;
    createdAt: string;
    actor?: { id: string; name: string } | null;
  }>;
}
