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
  departmentRef?: { id: string; name: string; code: string } | null;
  signals?: {
    emailDomainValid: boolean;
    duplicateIdCount: number;
  };
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

// ================= FEATURE 8: EVENTS & RSVP =================
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
export type EventMode = 'IN_PERSON' | 'ONLINE' | 'HYBRID';
export type RsvpStatus = 'GOING' | 'MAYBE' | 'NOT_GOING' | 'WAITLISTED' | 'CANCELLED';

export interface EventCard {
  id: string;
  title: string;
  slug?: string;
  description: string;
  category: string;
  organizer?: string | null;
  mode: EventMode;
  venue?: string | null;
  onlineUrl?: string | null;
  startsAt: string;
  endsAt: string;
  rsvpDeadline?: string | null;
  capacity?: number | null;
  waitlistEnabled: boolean;
  bannerUrl?: string | null;
  bannerKey?: string | null;
  bannerPublicId?: string | null;
  status: EventStatus;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  goingCount: number;
  waitlistedCount: number;
  spotsRemaining?: number | null;
  isFull: boolean;
  myRsvpStatus?: RsvpStatus | null;
  organizerInfo?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    photoKey?: string | null;
  } | null;
  createdAt: string;
}

export interface EventDetail extends EventCard {
  onlineUrlMasked?: boolean;
  completedAt?: string | null;
  counts: {
    going: number;
    maybe: number;
    notGoing: number;
    waitlisted: number;
    spotsRemaining: number | null;
    isFull: boolean;
  };
  reminderEnabled?: boolean;
  reminderSentAt?: string | null;
  updatedAt: string;
}

export interface EventRsvpItem {
  rsvpId: string;
  rsvpStatus: RsvpStatus;
  waitlistedAt?: string | null;
  createdAt: string;
  event: EventCard;
}

export interface EventAttendee {
  id: string;
  eventId: string;
  userId: string;
  status: RsvpStatus;
  waitlistedAt?: string | null;
  attendedAt?: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    department?: string | null;
    batch?: string | null;
    graduationYear?: string | null;
    role?: {
      name: string;
    };
  };
}

// ================= FEATURE 9: INSTITUTIONAL ANNOUNCEMENTS =================
export type AnnouncementStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type AnnouncementCategory = 'GENERAL' | 'ACADEMIC' | 'CAREER' | 'EVENT' | 'SECURITY_SYSTEM';
export type AnnouncementAudience = 'ALL' | 'STUDENTS' | 'ALUMNI';

export interface AnnouncementCard {
  id: string;
  title: string;
  summary: string;
  category: AnnouncementCategory;
  audience: AnnouncementAudience;
  pinned: boolean;
  status: AnnouncementStatus;
  isNew: boolean;
  isArchived: boolean;
  publishAt?: string | null;
  publishedAt?: string | null;
  author?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    photoKey?: string | null;
  } | null;
  createdAt: string;
}

export interface AnnouncementDetail extends AnnouncementCard {
  body: string;
  archiveAt?: string | null;
  archivedAt?: string | null;
  editedAt?: string | null;
  version: number;
  updatedAt: string;
}

// ================= FEATURE 10: SUCCESS STORIES =================
export type StoryStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'UNPUBLISHED';

export type StoryCategory =
  | 'CAREER_MILESTONE'
  | 'ENTREPRENEURSHIP'
  | 'TECH_INNOVATION'
  | 'RESEARCH_ACADEMIA'
  | 'DESIGN_PRODUCT'
  | 'CAMPUS_NOSTALGIA'
  | 'GENERAL_INSIGHT';

export type StoryModerationAction =
  | 'SUBMIT'
  | 'WITHDRAW'
  | 'CLAIM'
  | 'UNCLAIM'
  | 'APPROVE'
  | 'REJECT'
  | 'REQUEST_CHANGES'
  | 'UNPUBLISH'
  | 'RESTORE'
  | 'ADMIN_OVERRIDE';

export interface StoryAuthor {
  id: string;
  name: string;
  avatarUrl?: string | null;
  photoKey?: string | null;
  department?: string | null;
  batch?: string | null;
  graduationYear?: string | number | null;
  currentRole?: string | null;
  currentCompany?: string | null;
  headline?: string | null;
}

export interface StoryCard {
  id: string;
  universityId?: string;
  title: string;
  slug: string;
  summary: string;
  category: StoryCategory;
  tags: string[];
  coverImageUrl?: string | null;
  coverImagePublicId?: string | null;
  readingTimeMinutes: number;
  status?: StoryStatus;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  author: StoryAuthor;
}

export interface StoryDetail extends StoryCard {
  body: string;
  version?: number;
  status: StoryStatus;
}

export interface AuthorStoryDetail extends StoryDetail {
  coverImagePublicId?: string | null;
  embeddedMediaPublicIds?: string[];
  ownerVisibleNote?: string | null;
  claimedAt?: string | null;
  updatedAt: string;
  moderationHistory?: Array<{
    action: StoryModerationAction;
    note?: string | null;
    createdAt: string;
  }>;
}

export interface AdminStoryDetail extends StoryDetail {
  coverImagePublicId?: string | null;
  embeddedMediaPublicIds?: string[];
  ownerVisibleNote?: string | null;
  internalNote?: string | null;
  reviewerId?: string | null;
  claimedAt?: string | null;
  reviewer?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  } | null;
  updatedAt: string;
  moderationHistory: Array<{
    id: string;
    action: StoryModerationAction;
    reasonCode?: string | null;
    note?: string | null;
    createdAt: string;
    moderator: {
      id: string;
      name: string;
      avatarUrl?: string | null;
    } | null;
  }>;
}

