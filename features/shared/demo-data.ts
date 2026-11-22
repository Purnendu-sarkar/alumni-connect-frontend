import type { UserRole } from '@/types/domain';


export interface MentorshipRecord {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorCompany: string;
  mentorPosition: string;
  mentorDepartment: string;
  menteeId: string;
  menteeName: string;
  menteeDepartment: string;
  menteeBatch: string;
  status: 'REQUESTED' | 'CLARIFICATION_REQUESTED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  topic: string;
  message: string;
  meetingSchedule?: string;
  notes?: string;
  createdAt: string;
}

export const demoMentorships: MentorshipRecord[] = [
  {
    id: 'ment-1',
    mentorId: 'tanvir-hossain',
    mentorName: 'Tanvir Hossain',
    mentorCompany: 'Brain Station 23',
    mentorPosition: 'Engineering Manager',
    mentorDepartment: 'Computer Science & Engineering',
    menteeId: 'stu-current',
    menteeName: 'Purnendu Sarkar',
    menteeDepartment: 'Computer Science & Engineering',
    menteeBatch: '2022',
    status: 'ACTIVE',
    topic: 'Transitioning to Cloud Backend Systems',
    message: 'Seeking guidance on production Go microservices architecture and preparing for technical interview rounds.',
    meetingSchedule: 'Every alternate Thursday at 8:00 PM (Google Meet)',
    notes: 'Covered Docker & Kubernetes container orchestration in last sync. Next topic: distributed database transaction isolation.',
    createdAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'ment-2',
    mentorId: 'sadia-rahman',
    mentorName: 'Sadia Rahman',
    mentorCompany: 'Pathao',
    mentorPosition: 'Product Lead',
    mentorDepartment: 'Computer Science & Engineering',
    menteeId: 'stu-current',
    menteeName: 'Purnendu Sarkar',
    menteeDepartment: 'Computer Science & Engineering',
    menteeBatch: '2022',
    status: 'REQUESTED',
    topic: 'Product Management for Engineers',
    message: 'Hello Sadia! Looking for mentorship on product management frameworks, customer discovery, and prioritization.',
    createdAt: '2026-11-05T14:30:00.000Z',
  },
  {
    id: 'ment-3',
    mentorId: 'alumni-current',
    mentorName: 'Alumni Mentor',
    mentorCompany: 'Tech Corp',
    mentorPosition: 'Senior Architect',
    mentorDepartment: 'Computer Science & Engineering',
    menteeId: 'stu-2',
    menteeName: 'Farhana Yeasmin',
    menteeDepartment: 'Electrical & Electronic Engineering',
    menteeBatch: '2023',
    status: 'REQUESTED',
    topic: 'Career Switch to Embedded Firmware',
    message: 'Senior, I would love your advice on preparing for firmware engineering roles in Dhaka.',
    createdAt: '2026-11-08T09:15:00.000Z',
  },
];

export interface EventRecord {
  id: string;
  title: string;
  type: 'In person' | 'Online Webinar' | 'Campus Workshop' | 'Networking Mixer';
  location: string;
  date: string;
  time: string;
  day: string;
  month: string;
  description: string;
  speaker?: string;
  speakerRole?: string;
  isRegistered?: boolean;
  attendeesCount: number;
  category: 'CAREER' | 'ACADEMIC' | 'ALUMNI_GALA' | 'WORKSHOP';
}

export const demoEvents: EventRecord[] = [];

export interface AnnouncementRecord {
  id: string;
  title: string;
  date: string;
  author: string;
  authorRole: string;
  category: 'IMPORTANT' | 'CAMPUS_UPDATE' | 'CAREER' | 'ALUMNI_FEATURE';
  priority: 'HIGH' | 'NORMAL' | 'URGENT';
  content: string;
  attachments?: string[];
}

export const demoAnnouncements: AnnouncementRecord[] = [];

export type { ReportItem } from '@/lib/api/reports.api';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'CONNECTION' | 'MENTORSHIP' | 'JOB' | 'VERIFICATION' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export const demoNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New Connection Request',
    message: 'Tanvir Hossain (Engineering Manager at Brain Station 23) sent you a connection request.',
    type: 'CONNECTION',
    isRead: false,
    createdAt: '15 minutes ago',
    link: '/student/connections/requests',
  },
  {
    id: 'notif-2',
    title: 'Mentorship Status Update',
    message: 'Sadia Rahman accepted your mentorship inquiry. Click to schedule your inaugural sync.',
    type: 'MENTORSHIP',
    isRead: false,
    createdAt: '2 hours ago',
    link: '/student/mentorship',
  },
  {
    id: 'notif-3',
    title: 'New Opportunity in your Department',
    message: 'bKash posted Software Engineer, Platform Core for CSE graduates.',
    type: 'JOB',
    isRead: true,
    createdAt: 'Yesterday',
    link: '/student/jobs',
  },
  {
    id: 'notif-4',
    title: 'Institutional Verification Confirmed',
    message: 'Your university student credentials have been confirmed by the department moderator.',
    type: 'VERIFICATION',
    isRead: true,
    createdAt: '3 days ago',
    link: '/student/profile',
  },
];

export interface MessageRecord {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string | null;
  text: string;
  createdAt: string;
  isMine: boolean;
}

export interface ConversationRecord {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  participantCompany: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

