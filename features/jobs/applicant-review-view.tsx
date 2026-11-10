'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Mail,
  MessageSquare,
  Sparkles,
  Users,
  XCircle,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import type { UserRole } from '@/types/domain';

interface ApplicantRecord {
  id: string;
  name: string;
  department: string;
  batch: string;
  studentId: string;
  jobTitle: string;
  appliedDate: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'SHORTLISTED';
  coverNote: string;
  email: string;
}

const SAMPLE_APPLICANTS: ApplicantRecord[] = [
  {
    id: 'app-1',
    name: 'Purnendu Sarkar',
    department: 'Computer Science & Engineering',
    batch: 'Batch 2022',
    studentId: '220104001',
    jobTitle: 'Junior Backend Engineer (Go/Node.js)',
    appliedDate: 'Nov 6, 2026',
    status: 'PENDING',
    coverNote:
      'Completed distributed systems thesis using Go microservices and Redis. Eager to contribute to production payment flows and backend reliability.',
    email: 'purnendu.sarkar@nwu.ac.bd',
  },
  {
    id: 'app-2',
    name: 'Farhana Yeasmin',
    department: 'Electrical & Electronic Engineering',
    batch: 'Batch 2023',
    studentId: '230204018',
    jobTitle: 'Product Design Intern',
    appliedDate: 'Nov 8, 2026',
    status: 'SHORTLISTED',
    coverNote:
      'Strong Figma foundation, user persona research, and component library design experience from university hackathon wins.',
    email: 'farhana.yeasmin@nwu.ac.bd',
  },
];

interface ApplicantReviewViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function ApplicantReviewView({ currentRole, basePath }: ApplicantReviewViewProps) {
  const [applicants, setApplicants] = useState<ApplicantRecord[]>(SAMPLE_APPLICANTS);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleUpdateStatus = (appId: string, newStatus: 'ACCEPTED' | 'REJECTED' | 'SHORTLISTED') => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );
    setActionNotice(`Applicant status updated to ${newStatus}.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`${basePath}/jobs/my-jobs`}
        backLabel="Back to My Jobs"
        eyebrow="TALENT ACQUISITION"
        title="Campus Applicants Review"
        description="Review candidate profiles, evaluate student applications, and advance candidates through recruitment stages."
      />

      {actionNotice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      ) : null}

      {applicants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No applicants received yet"
          description="Applications from students and graduates will appear here once submitted."
        />
      ) : (
        <div className="space-y-4">
          {applicants.map((app) => (
            <div
              key={app.id}
              className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Avatar name={app.name} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 m-0">{app.name}</h3>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="text-xs text-slate-500 m-0 mt-0.5">
                      Applied for <strong className="text-slate-800">{app.jobTitle}</strong> · {app.appliedDate}
                    </p>
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <Button
                    size="sm"
                    variant={app.status === 'SHORTLISTED' ? 'secondary' : 'ghost'}
                    onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')}
                  >
                    Shortlist
                  </Button>
                  <Button
                    size="sm"
                    variant={app.status === 'ACCEPTED' ? 'primary' : 'secondary'}
                    onClick={() => handleUpdateStatus(app.id, 'ACCEPTED')}
                  >
                    Accept Candidate
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                    className="text-rose-600 hover:bg-rose-50"
                  >
                    Reject
                  </Button>
                </div>
              </div>

              {/* Academic info & cover note */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Department & Batch</p>
                  <p className="font-semibold text-slate-800 m-0 mt-0.5">{app.department} ({app.batch})</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">University ID</p>
                  <p className="font-semibold text-slate-800 m-0 mt-0.5">{app.studentId}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Institutional Email</p>
                  <p className="font-semibold text-slate-800 m-0 mt-0.5">{app.email}</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg text-xs leading-relaxed text-slate-700">
                <strong className="block text-slate-900 mb-1">Candidate Cover Message:</strong>
                &quot;{app.coverNote}&quot;
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button size="sm" variant="ghost" asChild>
                  <a href={`mailto:${app.email}`}>
                    <Mail size={13} /> Email Candidate
                  </a>
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`${basePath}/messages?user=${app.id}`}>
                    <MessageSquare size={13} /> Chat in Platform
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
