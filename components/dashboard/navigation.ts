import {
  Briefcase,
  GraduationCap,
  Handshake,
  LayoutDashboard,
  ShieldAlert,
  ShieldCheck,
  User,
  UserCheck,
  Users,
  PlusCircle,
  FileCheck2,
  AlertTriangle,
  History,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/lib/hooks/use-auth';

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  exact?: boolean;
}

export interface RoleDashboardConfig {
  role: UserRole;
  title: string;
  subtitle: string;
  theme: {
    primaryBg: string;
    primaryText: string;
    badgeBg: string;
    badgeText: string;
    hoverBg: string;
    accentBorder: string;
    ringColor: string;
  };
  navigation: DashboardNavItem[];
}

export const roleNavigationConfig: Record<UserRole, RoleDashboardConfig> = {
  STUDENT: {
    role: 'STUDENT',
    title: 'Student Desk',
    subtitle: 'Academic Network & Career Discovery',
    theme: {
      primaryBg: 'bg-blue-600',
      primaryText: 'text-blue-600',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-700',
      hoverBg: 'hover:bg-blue-50 hover:text-blue-700',
      accentBorder: 'border-blue-200',
      ringColor: 'ring-blue-600',
    },
    navigation: [
      { label: 'Dashboard', href: '/student/dashboard', icon: GraduationCap, exact: true },
      { label: 'Alumni Directory', href: '/student/directory', icon: Users },
      { label: 'My Network', href: '/student/connections', icon: Handshake },
      { label: 'Career Openings', href: '/student/jobs', icon: Briefcase },
      { label: 'Student Profile', href: '/student/profile', icon: User },
    ],
  },
  ALUMNI: {
    role: 'ALUMNI',
    title: 'Alumni Portal',
    subtitle: 'Professional Graduate Network',
    theme: {
      primaryBg: 'bg-emerald-600',
      primaryText: 'text-emerald-600',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-700',
      hoverBg: 'hover:bg-emerald-50 hover:text-emerald-700',
      accentBorder: 'border-emerald-200',
      ringColor: 'ring-emerald-600',
    },
    navigation: [
      { label: 'Dashboard', href: '/alumni/dashboard', icon: LayoutDashboard, exact: true },
      { label: 'Alumni Directory', href: '/alumni/directory', icon: Users },
      { label: 'Post an Opportunity', href: '/alumni/jobs/create', icon: PlusCircle },
      { label: 'Network Connections', href: '/alumni/connections', icon: Handshake },
      { label: 'Alumni Profile', href: '/alumni/profile', icon: User },
    ],
  },
  MODERATOR: {
    role: 'MODERATOR',
    title: 'Moderator Desk',
    subtitle: 'Community Integrity & Review Workbench',
    theme: {
      primaryBg: 'bg-amber-600',
      primaryText: 'text-amber-600',
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-700',
      hoverBg: 'hover:bg-amber-50 hover:text-amber-700',
      accentBorder: 'border-amber-200',
      ringColor: 'ring-amber-600',
    },
    navigation: [
      { label: 'Dashboard', href: '/moderator/dashboard', icon: ShieldAlert, exact: true },
      { label: 'Job Review Queue', href: '/moderator/jobs', icon: FileCheck2 },
      { label: 'Member Reports', href: '/moderator/reports', icon: AlertTriangle },
      { label: 'Moderation Activity', href: '/moderator/activity', icon: History },
    ],
  },
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    title: 'Super Admin Console',
    subtitle: 'Institutional Governance & Root Administration',
    theme: {
      primaryBg: 'bg-indigo-600',
      primaryText: 'text-indigo-600',
      badgeBg: 'bg-indigo-50',
      badgeText: 'text-indigo-700',
      hoverBg: 'hover:bg-indigo-50 hover:text-indigo-700',
      accentBorder: 'border-indigo-200',
      ringColor: 'ring-indigo-600',
    },
    navigation: [
      { label: 'Console Overview', href: '/admin/dashboard', icon: ShieldCheck, exact: true },
      { label: 'Alumni Verification', href: '/admin/users/verification', icon: UserCheck, badge: 'Queue' },
      { label: 'User Governance', href: '/admin/users', icon: Users },
      { label: 'Audit Log Trail', href: '/admin/audit-logs', icon: FileText },
    ],
  },
};
