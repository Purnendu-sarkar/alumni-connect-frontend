'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock,
  FileCheck2,
  GraduationCap,
  Handshake,
  LayoutDashboard,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { Brand } from '@/components/layout/brand';
import { RequireAuth } from '@/features/auth/require-auth';
import { SignOutButton } from '@/features/auth/sign-out-button';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface NavLink {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

function getRoleNavLinks(role?: UserRole): NavLink[] {
  switch (role) {
    case 'STUDENT':
      return [
        { href: '/dashboard/student', label: 'Student Desk', icon: GraduationCap },
        { href: '/dashboard/profile', label: 'Academic Profile', icon: UserRound },
        { href: '/alumni', label: 'Alumni Directory', icon: Users },
        { href: '/dashboard/connections', label: 'Connections', icon: Handshake },
        { href: '/dashboard/jobs', label: 'My Applications', icon: BriefcaseBusiness },
      ];
    case 'ALUMNI':
      return [
        { href: '/dashboard/alumni', label: 'Alumni Desk', icon: LayoutDashboard },
        { href: '/dashboard/profile', label: 'Professional Profile', icon: UserRound },
        { href: '/dashboard/connections', label: 'Network Connections', icon: Handshake },
        { href: '/dashboard/jobs', label: 'My Postings', icon: BriefcaseBusiness },
        { href: '/alumni', label: 'Alumni Directory', icon: Users },
      ];
    case 'MODERATOR':
      return [
        { href: '/dashboard/moderator', label: 'Moderator Desk', icon: ShieldAlert },
        { href: '/admin/verification', label: 'Verification Queue', icon: ShieldCheck },
        { href: '/alumni', label: 'Campus Directory', icon: Users },
        { href: '/dashboard/profile', label: 'My Account', icon: UserRound },
      ];
    case 'ADMIN':
      return [
        { href: '/dashboard/admin', label: 'University Admin', icon: Building2 },
        { href: '/admin/verification', label: 'Verification Queue', icon: ShieldCheck },
        { href: '/dashboard/moderator', label: 'Job Moderation', icon: FileCheck2 },
        { href: '/alumni', label: 'Campus Directory', icon: Users },
        { href: '/dashboard/profile', label: 'Admin Account', icon: UserRound },
      ];
    case 'SUPER_ADMIN':
      return [
        { href: '/dashboard/super-admin', label: 'Platform Console', icon: LayoutDashboard },
        { href: '/admin/verification', label: 'Global Verifications', icon: ShieldCheck },
        { href: '/dashboard/moderator', label: 'Job Moderation', icon: FileCheck2 },
        { href: '/alumni', label: 'All Members', icon: Users },
        { href: '/dashboard/profile', label: 'Root Profile', icon: UserRound },
      ];
    default:
      return [
        { href: '/dashboard/student', label: 'Overview', icon: LayoutDashboard },
        { href: '/dashboard/profile', label: 'My profile', icon: UserRound },
        { href: '/dashboard/connections', label: 'Connections', icon: Handshake },
        { href: '/dashboard/jobs', label: 'My jobs', icon: BriefcaseBusiness },
      ];
  }
}

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const links = getRoleNavLinks(user?.role);

  const roleBadgeColor =
    user?.role === 'SUPER_ADMIN'
      ? { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' }
      : user?.role === 'ADMIN'
      ? { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' }
      : user?.role === 'MODERATOR'
      ? { bg: '#fef3c7', text: '#b45309', border: '#fde68a' }
      : user?.role === 'ALUMNI'
      ? { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' }
      : { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' };

  return (
    <RequireAuth>
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <Brand />

          {/* User Role Card */}
          {user ? (
            <div
              style={{
                marginTop: '1.25rem',
                marginBottom: '1rem',
                padding: '0.75rem',
                borderRadius: '8px',
                background: 'var(--surface-muted, #f8f8f8)',
                border: '1px solid var(--border, #e5e5e5)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    backgroundColor: roleBadgeColor.bg,
                    color: roleBadgeColor.text,
                    border: `1px solid ${roleBadgeColor.border}`,
                  }}
                >
                  {user.role.replace('_', ' ')}
                </span>
                {user.verificationStatus === 'APPROVED' ? (
                  <span title="Verified Member" style={{ color: '#16a34a', display: 'flex', alignItems: 'center' }}>
                    <CheckCircle2 size={14} />
                  </span>
                ) : (
                  <span title="Verification in progress" style={{ color: '#d97706', display: 'flex', alignItems: 'center' }}>
                    <Clock size={14} />
                  </span>
                )}
              </div>
              <p
                style={{
                  margin: '0.5rem 0 0.15rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.name}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.75rem',
                  color: 'var(--muted, #666)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.university?.name || user.university?.slug || 'Institution'}
              </p>
            </div>
          ) : null}

          <nav>
            {links.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  style={
                    isActive
                      ? {
                          backgroundColor: 'var(--surface-accent, #f0f0f0)',
                          fontWeight: 600,
                          color: 'var(--foreground, #111)',
                        }
                      : {}
                  }
                >
                  <Icon size={18} /> {label}
                </Link>
              );
            })}
          </nav>
          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <SignOutButton />
          </div>
        </aside>
        <main className="dashboard-main">{children}</main>
      </div>
    </RequireAuth>
  );
}
