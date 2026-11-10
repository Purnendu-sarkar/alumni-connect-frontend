'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  Edit3,
  ExternalLink,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  XCircle,
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
    department: user?.department || 'Computer Science & Engineering',
    batch: user?.batch || '2022',
    verificationStatus: user?.verificationStatus || 'APPROVED',
    university: user?.university,
    bio: 'Proud student member of the university community focusing on software engineering, distributed systems, and collaborative development.',
    skills: ['JavaScript', 'TypeScript', 'Node.js', 'React', 'PostgreSQL'],
    location: 'Dhaka, Bangladesh',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="MEMBERSHIP CREDENTIALS"
        title="My Institutional Profile"
        description="Your verified identity across the campus alumni network, directory listings, and application reviews."
        actions={
          <Button asChild size="sm">
            <Link href={`${basePath}/profile/edit`}>
              <Edit3 size={14} /> Edit Profile
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col items-center text-center">
              <Avatar name={profile.name || 'User'} src={profile.avatarUrl} className="h-20 w-20 text-xl mb-3" />
              <h2 className="text-lg font-bold text-slate-900 m-0">{profile.name}</h2>
              <p className="text-xs text-slate-500 mt-1 m-0">
                {profile.position ? `${profile.position} at ${profile.currentCompany}` : profile.department}
              </p>
              <div className="mt-2.5">
                <StatusBadge status={profile.verificationStatus || 'PENDING'} />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Department</p>
                <p className="font-semibold text-slate-800 m-0 mt-0.5">{profile.department || 'Enrolled Student'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Batch Year</p>
                <p className="font-semibold text-slate-800 m-0 mt-0.5">Batch {profile.batch || '2022'}</p>
              </div>

              {profile.studentId ? (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">University ID</p>
                  <p className="font-semibold text-slate-800 font-mono m-0 mt-0.5">{profile.studentId}</p>
                </div>
              ) : null}

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Campus Institution</p>
                <p className="font-semibold text-slate-800 m-0 mt-0.5">
                  {profile.university?.name || 'North Western University'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-3">
              {profile.linkedinUrl ? (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
                  title="LinkedIn"
                >
                  <Globe size={18} />
                </a>
              ) : null}
              {profile.githubUrl ? (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  title="GitHub"
                >
                  <Code2 size={18} />
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0">
              Personal Biography & Focus
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed m-0 whitespace-pre-wrap">
              {profile.bio || 'Add a personal biography to share your career aspirations and background with the network.'}
            </p>
          </div>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 ? (
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0">
                Skills & Technical Expertise
              </h3>
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
            </div>
          ) : null}

          {/* Quick shortcuts to settings */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-slate-800 m-0">Need to update your contact or security credentials?</p>
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
