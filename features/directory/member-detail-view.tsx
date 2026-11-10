'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  Compass,
  ExternalLink,
  Globe,
  GraduationCap,
  Handshake,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/page-header';
import { demoAlumni } from '@/features/shared/demo-data';
import type { Alumni, UserRole } from '@/types/domain';

interface MemberDetailViewProps {
  id: string;
  currentRole: UserRole;
  basePath: string;
}

export function MemberDetailView({ id, currentRole, basePath }: MemberDetailViewProps) {
  const member: Alumni =
    demoAlumni.find((a) => a.id === id) || {
      id,
      name: id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      department: 'Computer Science & Engineering',
      batch: '2016',
      position: 'Senior Engineer',
      currentCompany: 'Technology Solutions',
      bio: 'Alumni member of the North Western University community. Open to networking and mentorship.',
      skills: ['Engineering', 'System Design', 'Mentorship'],
      avatarUrl: null,
      verified: true,
      verificationStatus: 'APPROVED',
      location: 'Dhaka, Bangladesh',
    };

  const [connected, setConnected] = useState(false);
  const [connectNotice, setConnectNotice] = useState<string | null>(null);

  const handleConnect = () => {
    setConnected(true);
    setConnectNotice(`Connection request dispatched to ${member.name}.`);
    setTimeout(() => setConnectNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`${basePath}/directory`}
        backLabel="Back to Directory"
        eyebrow="COMMUNITY MEMBER PROFILE"
        title={member.name}
        description={`${member.position || 'Alumni'} · ${member.currentCompany || 'Institutional Network'}`}
        badge={
          member.verificationStatus === 'APPROVED' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={13} /> Verified Member
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <Clock size={13} /> Pending Verification
            </span>
          )
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              disabled={connected}
              onClick={handleConnect}
            >
              <Handshake size={14} /> {connected ? 'Request Sent' : 'Connect'}
            </Button>
            <Button size="sm" variant="secondary" asChild>
              <Link href={`${basePath}/messages?user=${member.id}`}>
                <MessageSquare size={14} /> Message
              </Link>
            </Button>
          </div>
        }
      />

      {connectNotice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{connectNotice}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Academic & Contact Metadata Card */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col items-center text-center">
              <Avatar name={member.name} src={member.avatarUrl} className="h-20 w-20 text-xl mb-3" />
              <h2 className="text-lg font-bold text-slate-900 m-0">{member.name}</h2>
              <p className="text-xs text-slate-500 mt-1 m-0">
                {member.position} at {member.currentCompany}
              </p>
              {member.location ? (
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 m-0">
                  <MapPin size={12} /> {member.location}
                </p>
              ) : null}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Department</p>
                <p className="font-semibold text-slate-800 m-0 mt-0.5">{member.department || 'Enrolled Student'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Graduation Class / Batch</p>
                <p className="font-semibold text-slate-800 m-0 mt-0.5">Batch {member.batch || '2020'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Affiliated Institution</p>
                <p className="font-semibold text-slate-800 m-0 mt-0.5">
                  {member.university?.name || 'North Western University'}
                </p>
              </div>

              {member.employmentStatus ? (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Employment Status</p>
                  <p className="font-semibold text-slate-800 m-0 mt-0.5">{member.employmentStatus}</p>
                </div>
              ) : null}
            </div>

            {/* Social Links */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-3">
              {member.linkedinUrl ? (
                <a
                  href={member.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
                  title="LinkedIn Profile"
                >
                  <Globe size={18} />
                </a>
              ) : null}
              {member.githubUrl ? (
                <a
                  href={member.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  title="GitHub Profile"
                >
                  <Code2 size={18} />
                </a>
              ) : null}
              {member.websiteUrl ? (
                <a
                  href={member.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors"
                  title="Personal Portfolio"
                >
                  <Globe size={18} />
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {/* Right Column: Bio, Career History, Skills, Mentorship */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio Section */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold tracking-wider uppercase text-slate-400 mb-3 m-0">
              Professional Biography
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed m-0 whitespace-pre-line">
              {member.bio || 'This member has not yet published an extended biography.'}
            </p>
          </div>

          {/* Core Competencies & Skills */}
          {member.skills && member.skills.length > 0 ? (
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-400 mb-3 m-0">
                Skills & Technical Expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {member.skills.map((skill) => (
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

          {/* Mentorship & Guidance Opportunities */}
          <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-blue-100 text-blue-700 shrink-0">
                <Compass size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-blue-900 m-0">Mentorship & Knowledge Sharing</h3>
                <p className="text-xs text-blue-700 mt-1 leading-relaxed m-0">
                  {member.name} is available for advice regarding software engineering, system architectures, and early-career interviews. Connect to propose a discussion.
                </p>
                <div className="mt-4">
                  <Button size="sm" asChild>
                    <Link href={`${basePath}/mentorship`}>
                      Request Structured Mentorship
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
