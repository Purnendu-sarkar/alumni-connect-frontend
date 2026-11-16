import type { Alumni, UserRole } from '@/types/domain';

export const demoAlumni: Alumni[] = [
  {
    id: 'sadia-rahman',
    name: 'Sadia Rahman',
    batch: '2016',
    department: 'Computer Science & Engineering',
    currentCompany: 'Pathao',
    position: 'Product Lead',
    bio: 'Building digital products that move people and ideas. Excited to mentor undergrads on product management, strategy, and UX thinking.',
    skills: ['Product Strategy', 'UX Design', 'Agile Leadership', 'Mentorship'],
    avatarUrl: null,
    verified: true,
    verificationStatus: 'APPROVED',
    graduationYear: '2020',
    employmentStatus: 'Employed Full-time',
    location: 'Dhaka, Bangladesh',
    linkedinUrl: 'https://linkedin.com/in/sadia-rahman-demo',
    githubUrl: 'https://github.com/sadia-rahman',
    university: { id: 'nwu', name: 'North Western University', slug: 'north-western-university' },
  },
  {
    id: 'tanvir-hossain',
    name: 'Tanvir Hossain',
    batch: '2014',
    department: 'Computer Science & Engineering',
    currentCompany: 'Brain Station 23',
    position: 'Engineering Manager',
    bio: 'Backend engineer turned people builder. 8+ years crafting cloud microservices on AWS, Go, and Node.js. Always open for resume reviews.',
    skills: ['System Design', 'Node.js', 'Go', 'AWS', 'Team Leadership'],
    avatarUrl: null,
    verified: true,
    verificationStatus: 'APPROVED',
    graduationYear: '2018',
    employmentStatus: 'Employed Full-time',
    location: 'Dhaka / Remote',
    linkedinUrl: 'https://linkedin.com/in/tanvir-hossain-demo',
    githubUrl: 'https://github.com/tanvir-hossain',
    university: { id: 'nwu', name: 'North Western University', slug: 'north-western-university' },
  },
  {
    id: 'maria-islam',
    name: 'Maria Islam',
    batch: '2018',
    department: 'Business Administration',
    currentCompany: 'Unilever',
    position: 'Brand Manager',
    bio: 'Turning consumer insight into brands people love. Passionate about sustainability, brand marketing, and FMCG corporate strategy.',
    skills: ['Brand Marketing', 'Consumer Insights', 'FMCG', 'Campaign Strategy'],
    avatarUrl: null,
    verified: true,
    verificationStatus: 'APPROVED',
    graduationYear: '2022',
    employmentStatus: 'Employed Full-time',
    location: 'Dhaka, Bangladesh',
    linkedinUrl: 'https://linkedin.com/in/maria-islam-demo',
    university: { id: 'nwu', name: 'North Western University', slug: 'north-western-university' },
  },
  {
    id: 'arif-uddin',
    name: 'Arif Uddin',
    batch: '2015',
    department: 'Electrical & Electronic Engineering',
    currentCompany: 'Grameenphone',
    position: 'Solutions Architect',
    bio: 'Helping telecommunications and IoT systems translate big engineering complexity into reliable operations. Class of 2015.',
    skills: ['Cloud Infrastructure', 'IoT Architecture', '5G Core', 'Embedded Systems'],
    avatarUrl: null,
    verified: true,
    verificationStatus: 'APPROVED',
    graduationYear: '2019',
    employmentStatus: 'Employed Full-time',
    location: 'Khulna / Dhaka',
    linkedinUrl: 'https://linkedin.com/in/arif-uddin-demo',
    university: { id: 'nwu', name: 'North Western University', slug: 'north-western-university' },
  },
  {
    id: 'nafisa-chowdhury',
    name: 'Nafisa Chowdhury',
    batch: '2019',
    department: 'Computer Science & Engineering',
    currentCompany: 'ShopUp',
    position: 'UX Researcher',
    bio: 'A curious listener with a bias for useful interfaces. Researching fintech adoption across retail merchants in emerging economies.',
    skills: ['User Research', 'Usability Testing', 'Figma', 'Behavioral Psychology'],
    avatarUrl: null,
    verified: true,
    verificationStatus: 'APPROVED',
    graduationYear: '2023',
    employmentStatus: 'Employed Full-time',
    location: 'Dhaka, Bangladesh',
    linkedinUrl: 'https://linkedin.com/in/nafisa-chowdhury-demo',
    university: { id: 'nwu', name: 'North Western University', slug: 'north-western-university' },
  },
  {
    id: 'rakib-ahmed',
    name: 'Rakib Ahmed',
    batch: '2013',
    department: 'Economics',
    currentCompany: 'BRAC',
    position: 'Programme Director',
    bio: 'Designing development programmes that create durable opportunity. Economic modeling, social impact finance, and youth empowerment.',
    skills: ['Social Impact', 'Program Management', 'Economic Modeling', 'Grant Writing'],
    avatarUrl: null,
    verified: true,
    verificationStatus: 'APPROVED',
    graduationYear: '2017',
    employmentStatus: 'Employed Full-time',
    location: 'Dhaka, Bangladesh',
    linkedinUrl: 'https://linkedin.com/in/rakib-ahmed-demo',
    university: { id: 'nwu', name: 'North Western University', slug: 'north-western-university' },
  },
  {
    id: 'samira-khanam',
    name: 'Samira Khanam',
    batch: '2020',
    department: 'Computer Science & Engineering',
    currentCompany: 'Optimizely',
    position: 'Frontend Engineer',
    bio: 'React, Next.js, and TypeScript specialist. Passionate about web performance, design systems, and helping students get into web tech.',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Performance'],
    avatarUrl: null,
    verified: true,
    verificationStatus: 'APPROVED',
    graduationYear: '2024',
    employmentStatus: 'Employed Full-time',
    location: 'Dhaka / Remote',
    linkedinUrl: 'https://linkedin.com/in/samira-khanam-demo',
    githubUrl: 'https://github.com/samira-khanam',
    university: { id: 'nwu', name: 'North Western University', slug: 'north-western-university' },
  },
];


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

export interface StoryRecord {
  id: string;
  title: string;
  author: string;
  authorRole: string;
  authorDepartment: string;
  authorBatch: string;
  authorCompany: string;
  date: string;
  readingTime: string;
  category: string;
  summary: string;
  content: string;
  status: 'PUBLISHED' | 'PENDING_REVIEW' | 'DRAFT';
}

export const demoStories: StoryRecord[] = [
  {
    id: 'story-1',
    title: 'From Khulna Classrooms to Scaling Platforms for 70 Million Users',
    author: 'Tanvir Hossain',
    authorRole: 'Engineering Manager',
    authorDepartment: 'Computer Science & Engineering',
    authorBatch: 'Batch 2014',
    authorCompany: 'Brain Station 23',
    date: 'October 12, 2026',
    readingTime: '6 min read',
    category: 'CAREER MILESTONE',
    summary:
      'How the foundational algorithms taught in University Hall helped me diagnose distributed latency spikes during nationwide payment surges.',
    content:
      'When I graduated in 2018, the tech landscape in Bangladesh was on the precipice of rapid digitization. Looking back at my four years at North Western University, what stood out was not just the syntax of C or Java, but the rigor of algorithmic problem solving.\n\nMy journey began in an 8-person engineering team. We struggled through database deadlocks and unindexed SQL queries. But the lessons from my operating systems coursework came alive: thread pools, semaphore locking, and disk cache locality.\n\nTo current students: do not chase frameworks alone. Build strong foundations in networking, OS concepts, and data structures. Frameworks come and go, but the laws of computer science remain constant.',
    status: 'PUBLISHED',
  },
  {
    id: 'story-2',
    title: 'Designing with Purpose: Why Empathy Trumps Aesthetic in Enterprise UX',
    author: 'Nafisa Chowdhury',
    authorRole: 'Senior UX Researcher',
    authorDepartment: 'Computer Science & Engineering',
    authorBatch: 'Batch 2019',
    authorCompany: 'ShopUp',
    date: 'October 24, 2026',
    readingTime: '5 min read',
    category: 'DESIGN & PRODUCT',
    summary:
      'Field lessons from interviewing small grocery shop owners in rural districts, and how human-centered design reshaped our merchant payment workflow.',
    content:
      'In university, we designed screens on pristine MacBook displays with broadband fiber. But when you travel to rural districts and sit with a 50-year-old shopkeeper under direct sunlight with a cracked 3G Android screen, every assumption falls apart.\n\nDesign is not about fancy gradients or bouncy micro-interactions. It is about cognitive clarity, high contrast, and building confidence so a merchant feels safe transacting their lifes earnings.',
    status: 'PUBLISHED',
  },
  {
    id: 'story-3',
    title: 'Building a High-Tech Agritech Venture from Khulna',
    author: 'Kazi Farhan',
    authorRole: 'Co-founder & CTO',
    authorDepartment: 'Electrical & Electronic Engineering',
    authorBatch: 'Batch 2016',
    authorCompany: 'AquaSense IoT',
    date: 'November 1, 2026',
    readingTime: '7 min read',
    category: 'ENTREPRENEURSHIP',
    summary:
      'Deploying solar-powered water quality probes for coastal shrimp aquaculture, raising pre-seed funding, and hiring from our campus talent pool.',
    content:
      'The southern coastal belt of Bangladesh produces some of the world finest shrimp. Yet water contamination destroys hundreds of tons of yield annually. We built AquaSense to solve this with IoT sensors developed right in our university engineering labs.\n\nToday, 40% of our engineering staff are alumni from North Western University. Our university gave us the technical courage to build hardware when everyone else was doing software.',
    status: 'PUBLISHED',
  },
];

export interface ReportItem {
  id: string;
  type: 'USER' | 'JOB' | 'STORY' | 'MESSAGE';
  targetId: string;
  targetTitle: string;
  reportedBy: string;
  reportedByRole: UserRole;
  reason: string;
  details: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export const demoReports: ReportItem[] = [
  {
    id: 'rep-1',
    type: 'JOB',
    targetId: 'job-99',
    targetTitle: 'Remote Data Entry Clerk - Instant Payout',
    reportedBy: 'Tahsin Kabir',
    reportedByRole: 'STUDENT',
    reason: 'Suspicious Job / Possible Advance Fee Scam',
    details: 'The employer asks applicants to pay a registration fee for software licenses before scheduling an interview.',
    status: 'OPEN',
    createdAt: '2026-11-09T08:30:00.000Z',
  },
  {
    id: 'rep-2',
    type: 'USER',
    targetId: 'usr-12',
    targetTitle: 'Impersonation Account (Dr. M. Rahman)',
    reportedBy: 'Kazi Farhan',
    reportedByRole: 'ALUMNI',
    reason: 'Impersonating Faculty Member',
    details: 'This profile claims to be an active faculty member but does not have verified institutional domain email.',
    status: 'IN_REVIEW',
    createdAt: '2026-11-08T16:45:00.000Z',
  },
  {
    id: 'rep-3',
    type: 'STORY',
    targetId: 'story-8',
    targetTitle: 'Crypto Arbitrage Secrets for University Students',
    reportedBy: 'Sadia Rahman',
    reportedByRole: 'ALUMNI',
    reason: 'Spam / Commercial Promotion',
    details: 'Article is an unmoderated promotional affiliate link for high-risk financial instruments.',
    status: 'RESOLVED',
    createdAt: '2026-11-04T11:00:00.000Z',
    resolvedAt: '2026-11-04T14:30:00.000Z',
    resolutionNote: 'Content unpublished and author warned for promotional spam violation.',
  },
];

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

export const demoConversations: ConversationRecord[] = [
  {
    id: 'conv-1',
    participantId: 'tanvir-hossain',
    participantName: 'Tanvir Hossain',
    participantRole: 'Engineering Manager',
    participantCompany: 'Brain Station 23',
    lastMessage: 'Looking forward to reviewing your Go backend project next Thursday.',
    lastMessageAt: '2:15 PM',
    unreadCount: 1,
  },
  {
    id: 'conv-2',
    participantId: 'sadia-rahman',
    participantName: 'Sadia Rahman',
    participantRole: 'Product Lead',
    participantCompany: 'Pathao',
    lastMessage: 'Send over your deck and target persona drafts whenever ready.',
    lastMessageAt: 'Yesterday',
    unreadCount: 0,
  },
  {
    id: 'conv-3',
    participantId: 'maria-islam',
    participantName: 'Maria Islam',
    participantRole: 'Brand Manager',
    participantCompany: 'Unilever',
    lastMessage: 'The FMCG case competition briefing will be hosted on Friday.',
    lastMessageAt: 'Nov 6',
    unreadCount: 0,
  },
];

export const demoMessages: Record<string, MessageRecord[]> = {
  'conv-1': [
    {
      id: 'm1',
      conversationId: 'conv-1',
      senderId: 'tanvir-hossain',
      senderName: 'Tanvir Hossain',
      text: 'Hi Purnendu! Glad we connected. How is your final year thesis coming along?',
      createdAt: '10:30 AM',
      isMine: false,
    },
    {
      id: 'm2',
      conversationId: 'conv-1',
      senderId: 'current-user',
      senderName: 'You',
      text: 'Hello Brother Tanvir! It is progressing well. I am implementing a distributed task scheduler in Go and using Redis for leader election.',
      createdAt: '11:05 AM',
      isMine: true,
    },
    {
      id: 'm3',
      conversationId: 'conv-1',
      senderId: 'tanvir-hossain',
      senderName: 'Tanvir Hossain',
      text: 'That sounds solid. Be sure to consider split-brain handling if network partition happens. Looking forward to reviewing your Go backend project next Thursday.',
      createdAt: '2:15 PM',
      isMine: false,
    },
  ],
};
