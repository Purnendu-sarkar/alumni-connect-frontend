import { apiClient } from './client';

export interface PublicUniversity {
  name: string;
  slug: string;
  domain: string;
  city: string;
  accreditation: string;
}

export interface PublicMetrics {
  totalMembers: number;
  studentsCount: number;
  alumniCount: number;
  publishedJobsCount: number;
  publishedEventsCount: number;
  publishedStoriesCount: number;
  publishedAnnouncementsCount: number;
}

export interface PublicDepartment {
  id: string;
  code: string;
  name: string;
  faculty: string | null;
  studentCount: number;
  alumniCount: number;
  totalCount: number;
}

export interface PublicAlumnus {
  id: string;
  name: string;
  avatarUrl: string | null;
  headline: string | null;
  company: string | null;
  position: string | null;
  department: string | null;
  graduationYear: string | null;
  isMentorshipAvailable: boolean;
}

export interface PublicJob {
  id: string;
  title: string;
  company: string;
  location: string | null;
  jobType: string;
  workMode: string;
  salaryRange: string | null;
  deadline: string | null;
  postedAt: string;
  descriptionSnippet: string;
}

export interface PublicStory {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  authorName: string;
  authorDepartment: string | null;
  authorGraduationYear: string | null;
  publishedAt: string;
}

export interface PublicEvent {
  id: string;
  title: string;
  slug: string;
  bannerUrl: string | null;
  eventType: string;
  venue: string | null;
  startsAt: string;
  endsAt: string;
  descriptionSnippet: string;
}

export interface PublicAnnouncement {
  id: string;
  title: string;
  category: string;
  isPinned: boolean;
  publishedAt: string;
  summary: string;
}

export interface PublicOverviewData {
  university: PublicUniversity;
  metrics: PublicMetrics;
  departments: PublicDepartment[];
  featuredAlumni: PublicAlumnus[];
  featuredJobs: PublicJob[];
  featuredStories: PublicStory[];
  featuredEvents: PublicEvent[];
  latestAnnouncements: PublicAnnouncement[];
}

export const DEFAULT_PUBLIC_OVERVIEW: PublicOverviewData = {
  university: {
    name: 'North Western University',
    slug: 'north-western-university',
    domain: 'nwu.ac.bd',
    city: 'Khulna, Bangladesh',
    accreditation: 'UGC Accredited University',
  },
  metrics: {
    totalMembers: 2008,
    studentsCount: 955,
    alumniCount: 1053,
    publishedJobsCount: 1220,
    publishedEventsCount: 247,
    publishedStoriesCount: 105,
    publishedAnnouncementsCount: 148,
  },
  departments: [
    {
      id: 'cse',
      code: 'CSE',
      name: 'Computer Science & Engineering',
      faculty: 'Faculty of Science & Technology',
      studentCount: 162,
      alumniCount: 175,
      totalCount: 337,
    },
    {
      id: 'bba',
      code: 'BBA',
      name: 'Business Administration',
      faculty: 'Faculty of Business Studies',
      studentCount: 158,
      alumniCount: 176,
      totalCount: 334,
    },
    {
      id: 'eng',
      code: 'ENG',
      name: 'English',
      faculty: 'Faculty of Liberal Arts & Human Science',
      studentCount: 160,
      alumniCount: 176,
      totalCount: 336,
    },
    {
      id: 'eee',
      code: 'EEE',
      name: 'Electrical & Electronic Engineering',
      faculty: 'Faculty of Science & Technology',
      studentCount: 160,
      alumniCount: 175,
      totalCount: 335,
    },
    {
      id: 'econ',
      code: 'ECON',
      name: 'Economics',
      faculty: 'Faculty of Social Science',
      studentCount: 158,
      alumniCount: 177,
      totalCount: 335,
    },
    {
      id: 'ce',
      code: 'CE',
      name: 'Civil Engineering',
      faculty: 'Faculty of Science & Technology',
      studentCount: 157,
      alumniCount: 174,
      totalCount: 331,
    },
  ],
  featuredAlumni: [],
  featuredJobs: [],
  featuredStories: [],
  featuredEvents: [],
  latestAnnouncements: [],
};

export async function getPublicOverview(): Promise<PublicOverviewData> {
  try {
    const res = await apiClient<PublicOverviewData>('/public/overview', {
      next: { revalidate: 300 },
    } as RequestInit);
    if (res.data) {
      return res.data;
    }
    return DEFAULT_PUBLIC_OVERVIEW;
  } catch {
    return DEFAULT_PUBLIC_OVERVIEW;
  }
}
