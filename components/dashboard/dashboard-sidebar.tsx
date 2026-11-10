'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  FileText,
  GraduationCap,
  Handshake,
  HelpCircle,
  Inbox,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  Megaphone,
  MessageSquare,
  PlusCircle,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserRound,
  Users,
} from 'lucide-react';

import { Brand } from '@/components/layout/brand';
import { SignOutButton } from '@/features/auth/sign-out-button';
import { cn } from '@/lib/utils/cn';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export function getRoleNavGroups(role?: UserRole): NavGroup[] {
  switch (role) {
    case 'STUDENT':
      return [
        {
          items: [
            { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/student/profile', label: 'Academic Profile', icon: GraduationCap },
          ],
        },
        {
          title: 'Community & Network',
          items: [
            { href: '/student/directory', label: 'Alumni Directory', icon: Users },
            { href: '/student/connections', label: 'Connections', icon: Handshake },
            { href: '/student/mentorship', label: 'Mentorship Hub', icon: Compass },
          ],
        },
        {
          title: 'Career & Opportunities',
          items: [
            { href: '/student/jobs', label: 'Browse Jobs', icon: BriefcaseBusiness },
            { href: '/student/applications', label: 'My Applications', icon: FileCheck2 },
          ],
        },
        {
          title: 'Campus Life',
          items: [
            { href: '/student/events', label: 'Campus Events', icon: Calendar },
            { href: '/student/announcements', label: 'Announcements', icon: Megaphone },
            { href: '/student/stories', label: 'Success Stories', icon: Sparkles },
          ],
        },
        {
          title: 'Tools & Account',
          items: [
            { href: '/student/messages', label: 'Messages', icon: MessageSquare },
            { href: '/student/notifications', label: 'Notifications', icon: Inbox },
            { href: '/student/settings', label: 'Settings', icon: Settings },
          ],
        },
      ];

    case 'ALUMNI':
      return [
        {
          items: [
            { href: '/alumni/dashboard', label: 'Alumni Desk', icon: LayoutDashboard },
            { href: '/alumni/profile', label: 'Professional Profile', icon: UserRound },
          ],
        },
        {
          title: 'Network & Mentorship',
          items: [
            { href: '/alumni/directory', label: 'Member Directory', icon: Users },
            { href: '/alumni/connections', label: 'Connections', icon: Handshake },
            { href: '/alumni/mentorship', label: 'Mentorship Desk', icon: Compass },
          ],
        },
        {
          title: 'Recruitment & Jobs',
          items: [
            { href: '/alumni/jobs/my-jobs', label: 'My Posted Jobs', icon: BriefcaseBusiness },
            { href: '/alumni/jobs/create', label: 'Post a Job', icon: PlusCircle },
            { href: '/alumni/applications/received', label: 'Applicants Review', icon: FileCheck2 },
            { href: '/alumni/jobs', label: 'Explore All Jobs', icon: BriefcaseBusiness },
          ],
        },
        {
          title: 'Campus & Impact',
          items: [
            { href: '/alumni/events', label: 'Events & Reunions', icon: Calendar },
            { href: '/alumni/stories', label: 'Alumni Stories', icon: Sparkles },
            { href: '/alumni/announcements', label: 'Campus Notices', icon: Megaphone },
          ],
        },
        {
          title: 'Communication',
          items: [
            { href: '/alumni/messages', label: 'Messages', icon: MessageSquare },
            { href: '/alumni/notifications', label: 'Notifications', icon: Inbox },
            { href: '/alumni/settings', label: 'Settings', icon: Settings },
          ],
        },
      ];

    case 'MODERATOR':
      return [
        {
          items: [
            { href: '/moderator/dashboard', label: 'Moderation Desk', icon: LayoutDashboard },
            { href: '/moderator/activity', label: 'Moderation Activity', icon: FileText },
          ],
        },
        {
          title: 'Review Queues',
          items: [
            { href: '/moderator/jobs/pending', label: 'Pending Jobs', icon: Clock },
            { href: '/moderator/jobs/in-review', label: 'Jobs In-Review', icon: FileCheck2 },
            { href: '/moderator/jobs', label: 'All Job Postings', icon: BriefcaseBusiness },
          ],
        },
        {
          title: 'Safety & Content',
          items: [
            { href: '/moderator/reports/open', label: 'Open Reports', icon: ShieldAlert },
            { href: '/moderator/reports', label: 'All Reports', icon: Shield },
            { href: '/moderator/content', label: 'Flagged Content', icon: HelpCircle },
          ],
        },
        {
          title: 'System & Account',
          items: [
            { href: '/moderator/notifications', label: 'Notifications', icon: Inbox },
            { href: '/moderator/settings', label: 'Settings', icon: Settings },
          ],
        },
      ];

    case 'SUPER_ADMIN':
      return [
        {
          items: [
            { href: '/admin/dashboard', label: 'Platform Console', icon: LayoutDashboard },
            { href: '/admin/analytics', label: 'Platform Analytics', icon: Layers },
            { href: '/admin/activity-logs', label: 'Security Audit Logs', icon: ShieldAlert },
          ],
        },
        {
          title: 'User Governance',
          items: [
            { href: '/admin/verification/pending', label: 'Verification Queue', icon: ShieldCheck },
            { href: '/admin/users', label: 'User Directory', icon: Users },
            { href: '/admin/users/students', label: 'Student Roster', icon: GraduationCap },
            { href: '/admin/users/alumni', label: 'Alumni Roster', icon: UserCheck },
            { href: '/admin/users/moderators', label: 'Moderator Staff', icon: Shield },
          ],
        },
        {
          title: 'Programs & Content',
          items: [
            { href: '/admin/jobs', label: 'Jobs Platform', icon: BriefcaseBusiness },
            { href: '/admin/reports', label: 'Reports & Safety', icon: ShieldAlert },
            { href: '/admin/events', label: 'Campus Events', icon: Calendar },
            { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
            { href: '/admin/stories', label: 'Success Stories', icon: Sparkles },
            { href: '/admin/mentorship', label: 'Mentorship Program', icon: Compass },
            { href: '/admin/connections', label: 'Network Graph', icon: Handshake },
          ],
        },
        {
          title: 'Platform System',
          items: [
            { href: '/admin/settings', label: 'System Settings', icon: Settings },
          ],
        },
      ];

    default:
      return [];
  }
}

interface DashboardSidebarProps {
  role?: UserRole;
  onNavigate?: () => void;
  className?: string;
}

export function DashboardSidebar({ role, onNavigate, className }: DashboardSidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const groups = getRoleNavGroups(role || user?.role);

  const roleAccentColor =
    user?.role === 'SUPER_ADMIN'
      ? { badgeBg: '#ede9fe', badgeText: '#6d28d9', activeBg: '#f5f3ff', activeText: '#6d28d9', activeBorder: '#7c3aed' }
      : user?.role === 'MODERATOR'
      ? { badgeBg: '#fef3c7', badgeText: '#b45309', activeBg: '#fffbeb', activeText: '#b45309', activeBorder: '#f59e0b' }
      : user?.role === 'ALUMNI'
      ? { badgeBg: '#dcfce7', badgeText: '#15803d', activeBg: '#f0fdf4', activeText: '#15803d', activeBorder: '#16a34a' }
      : { badgeBg: '#e0f2fe', badgeText: '#0369a1', activeBg: '#f0f9ff', activeText: '#0369a1', activeBorder: '#2563eb' };

  return (
    <aside
      className={cn(
        'w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 select-none overflow-y-auto',
        className,
      )}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <Brand />
      </div>

      {/* User Mini Profile Card */}
      {user ? (
        <div className="p-3 mx-3 my-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span
              className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: roleAccentColor.badgeBg,
                color: roleAccentColor.badgeText,
              }}
            >
              {user.role.replace('_', ' ')}
            </span>

            {user.verificationStatus === 'APPROVED' ? (
              <span
                title="Verified Member"
                className="text-emerald-600 flex items-center gap-0.5 text-[11px] font-semibold"
              >
                <CheckCircle2 size={13} /> Verified
              </span>
            ) : (
              <span
                title="Pending Verification"
                className="text-amber-600 flex items-center gap-0.5 text-[11px] font-semibold"
              >
                <Clock size={13} /> Pending
              </span>
            )}
          </div>

          <p className="text-sm font-bold text-slate-900 truncate m-0">
            {user.name}
          </p>
          <p className="text-xs text-slate-500 truncate m-0 mt-0.5">
            {user.university?.name || user.university?.slug || 'Institutional Campus'}
          </p>
        </div>
      ) : null}

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-2 space-y-4">
        {groups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {group.title ? (
              <p className="px-2.5 text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1">
                {group.title}
              </p>
            ) : null}

            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== `/${user?.role?.toLowerCase().replace('_', '-')}/dashboard` &&
                  item.href !== '/admin/dashboard' &&
                  item.href !== '/student/dashboard' &&
                  item.href !== '/alumni/dashboard' &&
                  item.href !== '/moderator/dashboard' &&
                  pathname.startsWith(`${item.href}/`));

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-150',
                    isActive
                      ? 'text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                  )}
                  style={
                    isActive
                      ? {
                          backgroundColor: roleAccentColor.activeBg,
                          color: roleAccentColor.activeText,
                          borderLeft: `3px solid ${roleAccentColor.activeBorder}`,
                        }
                      : {}
                  }
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </span>

                  {item.badge ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-100 mt-auto">
        <SignOutButton />
      </div>
    </aside>
  );
}
