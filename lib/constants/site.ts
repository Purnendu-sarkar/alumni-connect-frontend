import type { UserRole } from '@/types/domain';

export const siteConfig = {
  name: 'AlumniConnect',
  description: 'The verified professional network for your university community.',
  navigation: [
    { href: '/jobs', label: 'Jobs' },
    { href: '/events', label: 'Events' },
    { href: '/stories', label: 'Stories' },
    { href: '/announcements', label: 'Notices' },
    { href: '/giving', label: 'Giving' },
    { href: '/mentorship', label: 'Mentorship' },
  ],
} as const;

export interface NavItem {
  href: string;
  label: string;
}

export interface RoleWorkspaceConfig {
  role: UserRole;
  roleLabel: string;
  dashboardHref: string;
  dashboardLabel: string;
  profileHref: string;
  settingsHref: string;
  navLinks: readonly NavItem[];
}

export const ROLE_WORKSPACE_CONFIGS: Record<UserRole, RoleWorkspaceConfig> = {
  STUDENT: {
    role: 'STUDENT',
    roleLabel: 'Student',
    dashboardHref: '/student/dashboard',
    dashboardLabel: 'Go to Dashboard',
    profileHref: '/student/profile',
    settingsHref: '/student/settings/account',
    navLinks: [
      { href: '/student/directory', label: 'Directory' },
      { href: '/student/jobs', label: 'Jobs' },
      { href: '/student/events', label: 'Events' },
      { href: '/student/stories', label: 'Stories' },
      { href: '/student/announcements', label: 'Notices' },
      { href: '/student/mentorship', label: 'Mentorship' },
    ],
  },
  ALUMNI: {
    role: 'ALUMNI',
    roleLabel: 'Alumni',
    dashboardHref: '/alumni/dashboard',
    dashboardLabel: 'Go to Dashboard',
    profileHref: '/alumni/profile',
    settingsHref: '/alumni/settings/account',
    navLinks: [
      { href: '/alumni/directory', label: 'Directory' },
      { href: '/alumni/jobs', label: 'Jobs' },
      { href: '/alumni/events', label: 'Events' },
      { href: '/alumni/stories', label: 'Stories' },
      { href: '/alumni/announcements', label: 'Notices' },
      { href: '/alumni/mentorship/requests', label: 'Mentorship' },
    ],
  },
  MODERATOR: {
    role: 'MODERATOR',
    roleLabel: 'Moderator',
    dashboardHref: '/moderator/dashboard',
    dashboardLabel: 'Moderation Console',
    profileHref: '/moderator/profile',
    settingsHref: '/moderator/settings/security',
    navLinks: [
      { href: '/moderator/jobs', label: 'Job Queue' },
      { href: '/moderator/reports', label: 'Reports' },
      { href: '/moderator/content', label: 'Content' },
      { href: '/moderator/events', label: 'Events' },
      { href: '/moderator/announcements', label: 'Notices' },
    ],
  },
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    roleLabel: 'Super Admin',
    dashboardHref: '/admin/dashboard',
    dashboardLabel: 'Admin Console',
    profileHref: '/admin/profile',
    settingsHref: '/admin/settings/general',
    navLinks: [
      { href: '/admin/users', label: 'Users' },
      { href: '/admin/jobs', label: 'Jobs' },
      { href: '/admin/events', label: 'Events' },
      { href: '/admin/stories', label: 'Stories' },
      { href: '/admin/announcements', label: 'Notices' },
      { href: '/admin/analytics', label: 'Analytics' },
    ],
  },
};

export function getRoleWorkspaceConfig(role?: UserRole | string | null): RoleWorkspaceConfig {
  if (role && role in ROLE_WORKSPACE_CONFIGS) {
    return ROLE_WORKSPACE_CONFIGS[role as UserRole];
  }
  return ROLE_WORKSPACE_CONFIGS.STUDENT;
}
