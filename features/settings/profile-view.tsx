'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Code2,
  Compass,
  Edit3,
  Globe,
  GraduationCap,
  Key,
  Layers,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  UserRound,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { getMe } from '@/lib/api/user.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserProfile, UserRole } from '@/types/domain';

interface ProfileViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function ProfileView({ currentRole, basePath }: ProfileViewProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  const profileQuery = useQuery({
    queryKey: ['my-profile', accessToken],
    queryFn: () => getMe(accessToken),
    enabled: Boolean(accessToken),
  });

  const profile: Partial<UserProfile> = profileQuery.data?.data || {
    name: user?.name,
    email: user?.email,
    department: user?.department,
    batch: user?.batch,
    verificationStatus: user?.verificationStatus,
    university: user?.university,
    avatarUrl: user?.avatarUrl,
    bio: '',
    skills: [],
    location: '',
  };

  const isStaff = currentRole === 'SUPER_ADMIN' || currentRole === 'MODERATOR';

  const roleTitle =
    currentRole === 'SUPER_ADMIN'
      ? 'Platform Super Admin'
      : currentRole === 'MODERATOR'
      ? 'Campus Moderator'
      : currentRole === 'ALUMNI'
      ? profile.position
        ? `${profile.position} at ${profile.currentCompany || 'Independent'}`
        : 'Alumni Member'
      : profile.department
      ? `${profile.department} Student`
      : 'Enrolled Student';

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="MEMBERSHIP CREDENTIALS"
        title={isStaff ? 'Administrative Profile' : 'My Institutional Profile'}
        description={
          isStaff
            ? 'Your administrative authority, permissions scope, and platform identity.'
            : 'Your verified identity across the campus alumni network, directory listings, and application reviews.'
        }
        actions={
          <Button asChild size="sm">
            <Link href={`${basePath}/profile/edit`}>
              <Edit3 size={14} /> Edit Profile
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Identity & Card */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col items-center text-center">
              <Avatar
                name={profile.name || 'User'}
                src={profile.avatarUrl}
                className="h-20 w-20 text-xl mb-3 ring-2 ring-slate-100"
              />
              <h2 className="text-lg font-bold text-slate-900 m-0">{profile.name}</h2>
              <p className="text-xs text-slate-500 mt-1 m-0">{roleTitle}</p>
              <div className="mt-2.5 flex items-center justify-center gap-2">
                <StatusBadge status={profile.verificationStatus || 'PENDING'} />
                {currentRole === 'SUPER_ADMIN' && (
                  <Badge variant="destructive" className="text-[10px]">
                    Super Admin
                  </Badge>
                )}
                {currentRole === 'MODERATOR' && (
                  <Badge variant="secondary" className="text-[10px]">
                    Moderator
                  </Badge>
                )}
              </div>
            </div>

            {/* Role-Specific Attribute Details */}
            <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
              {currentRole === 'STUDENT' && (
                <>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Department</p>
                    <p className="font-semibold text-slate-800 m-0 mt-0.5">
                      {profile.department || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Batch</p>
                    <p className="font-semibold text-slate-800 m-0 mt-0.5">
                      {profile.batch ? `Batch ${profile.batch}` : 'Not specified'}
                    </p>
                  </div>
                  {profile.studentId && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Student ID</p>
                      <p className="font-semibold text-slate-800 font-mono m-0 mt-0.5">{profile.studentId}</p>
                    </div>
                  )}
                  {profile.currentSemester && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Current Semester</p>
                      <p className="font-semibold text-slate-800 m-0 mt-0.5">{profile.currentSemester}</p>
                    </div>
                  )}
                  {profile.expectedGraduationYear && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Expected Graduation</p>
                      <p className="font-semibold text-slate-800 m-0 mt-0.5">{profile.expectedGraduationYear}</p>
                    </div>
                  )}
                </>
              )}

              {currentRole === 'ALUMNI' && (
                <>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Current Organization</p>
                    <p className="font-semibold text-slate-800 m-0 mt-0.5">
                      {profile.currentCompany || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Department & Class</p>
                    <p className="font-semibold text-slate-800 m-0 mt-0.5">
                      {profile.department || 'Alumni'} {profile.graduationYear ? `(${profile.graduationYear})` : ''}
                    </p>
                  </div>
                  {profile.academicId && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Graduation Roll</p>
                      <p className="font-semibold text-slate-800 font-mono m-0 mt-0.5">{profile.academicId}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Mentorship Status</p>
                    <div className="mt-1">
                      {profile.isMentorshipAvailable ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} /> Open for Mentoring
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                          Mentoring Closed
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}

              {isStaff && (
                <>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Institutional Authority</p>
                    <p className="font-semibold text-slate-800 m-0 mt-0.5">
                      {currentRole === 'SUPER_ADMIN'
                        ? 'Full Institutional Control & Governance'
                        : 'Queue Moderation & Safety Desk'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Administrative Office</p>
                    <p className="font-semibold text-slate-800 m-0 mt-0.5">
                      {profile.department || 'Platform Operations Center'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Official Email</p>
                    <p className="font-semibold text-slate-800 m-0 mt-0.5 font-mono">{profile.email}</p>
                  </div>
                </>
              )}

              {profile.location && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Location</p>
                  <p className="font-semibold text-slate-800 m-0 mt-0.5 flex items-center gap-1">
                    <MapPin size={12} className="text-slate-400" /> {profile.location}
                  </p>
                </div>
              )}

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Campus Network</p>
                <p className="font-semibold text-slate-800 m-0 mt-0.5">
                  {profile.university?.name || 'North Western University'}
                </p>
              </div>
            </div>

            {/* Social Links */}
            {(profile.linkedinUrl || profile.githubUrl || profile.websiteUrl) && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-3">
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
                    title="LinkedIn"
                  >
                    <Globe size={18} />
                  </a>
                )}
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                    title="GitHub"
                  >
                    <Code2 size={18} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Bio, Capabilities, Role-Specific Panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Biography */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0">
              Personal Biography & Focus
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed m-0 whitespace-pre-wrap">
              {profile.bio ||
                (isStaff
                  ? 'Administrative account designated for managing university operations, user safety, and platform governance.'
                  : 'Add a personal biography to share your career aspirations, projects, and academic background.')}
            </p>
          </div>

          {/* Student & Alumni: Skills & Competencies */}
          {!isStaff && (
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0">
                Skills & Technical Expertise
              </h3>
              {profile.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 m-0">
                  No technical skills listed yet. Add skills in Edit Profile to increase your visibility in the campus directory.
                </p>
              )}
            </div>
          )}

          {/* Admin & Moderator: Governance Shortcuts */}
          {currentRole === 'SUPER_ADMIN' && (
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0">
                Administrative Shortcuts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <Link
                  href="/admin/activity-logs"
                  className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-2.5 font-semibold text-slate-800"
                >
                  <ShieldAlert size={16} className="text-amber-600" />
                  <span>Security Audit Logs</span>
                </Link>
                <Link
                  href="/admin/verification/pending"
                  className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-2.5 font-semibold text-slate-800"
                >
                  <ShieldCheck size={16} className="text-blue-600" />
                  <span>Verification Queue</span>
                </Link>
                <Link
                  href="/admin/analytics"
                  className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-2.5 font-semibold text-slate-800"
                >
                  <Layers size={16} className="text-indigo-600" />
                  <span>Platform Analytics</span>
                </Link>
                <Link
                  href="/admin/settings/security"
                  className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-2.5 font-semibold text-slate-800"
                >
                  <Key size={16} className="text-slate-600" />
                  <span>Security & Re-auth</span>
                </Link>
              </div>
            </div>
          )}

          {currentRole === 'MODERATOR' && (
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0">
                Moderation Queues
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <Link
                  href="/moderator/jobs/pending"
                  className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-2.5 font-semibold text-slate-800"
                >
                  <Clock size={16} className="text-amber-600" />
                  <span>Pending Job Approvals</span>
                </Link>
                <Link
                  href="/moderator/reports/open"
                  className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-2.5 font-semibold text-slate-800"
                >
                  <Shield size={16} className="text-rose-600" />
                  <span>Open Safety Reports</span>
                </Link>
              </div>
            </div>
          )}

          {/* Quick Shortcuts to Settings */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-slate-800 m-0">Need to update your security credentials?</p>
              <p className="text-slate-500 m-0 mt-0.5">Manage your password, phone visibility, and session preferences.</p>
            </div>
            <Button size="sm" variant="secondary" asChild>
              <Link href={`${basePath}/settings`}>Account Settings</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
