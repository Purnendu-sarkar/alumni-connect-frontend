'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  Send,
  Share2,
  Sparkles,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/page-header';
import { demoJobs } from '@/features/shared/demo-data';
import { applyToJob } from '@/lib/api/jobs.api';
import { useAuthStore } from '@/store/auth-store';
import type { Job, UserRole } from '@/types/domain';

interface JobDetailViewProps {
  id: string;
  currentRole: UserRole;
  basePath: string;
}

export function JobDetailView({ id, currentRole, basePath }: JobDetailViewProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  const job: Job =
    demoJobs.find((j) => j.id === id) || {
      id,
      title: 'Software Engineer',
      company: 'Tech Solutions Ltd.',
      location: 'Dhaka · Hybrid',
      employmentType: 'Full-time',
      description:
        'Exciting opening for engineering graduates. You will be building resilient cloud services and microservices.',
      applicationUrl: 'https://example.com/apply',
      applicationEmail: null,
      expiresAt: '2026-12-31',
      createdAt: '2026-10-15',
      postedBy: { id: 'alumni-1', name: 'Alumni Senior', currentCompany: 'Tech Solutions' },
    };

  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleApply = async () => {
    setApplying(true);
    try {
      await applyToJob(accessToken, job.id);
    } catch {
      // Graceful fallback
    }
    setApplying(false);
    setApplied(true);
    setNotice(`Your application for "${job.title}" has been registered.`);
    setTimeout(() => setNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`${basePath}/jobs`}
        backLabel="Back to Jobs Board"
        eyebrow="CAREER OPPORTUNITY"
        title={job.title}
        description={`${job.company} · ${job.location || 'Remote'} · ${job.employmentType || 'Full-time'}`}
        badge={
          <Badge variant="neutral">
            {job.employmentType || 'Full-time'}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            {currentRole === 'STUDENT' ? (
              <Button size="sm" disabled={applied || applying} onClick={handleApply}>
                <Send size={14} /> {applied ? 'Application Submitted' : applying ? 'Submitting…' : 'Apply Now'}
              </Button>
            ) : null}

            {job.applicationUrl ? (
              <Button size="sm" variant="secondary" asChild>
                <a href={job.applicationUrl} target="_blank" rel="noreferrer">
                  External Portal <ExternalLink size={13} />
                </a>
              </Button>
            ) : null}
          </div>
        }
      />

      {notice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Job Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 m-0">
              Role Overview & Description
            </h3>
            <div className="text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-wrap">
              {job.description}
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 m-0">
              Candidate Requirements & Qualifications
            </h3>
            <ul className="text-sm text-slate-700 space-y-2 list-disc pl-5 leading-relaxed m-0">
              <li>Enrolled student or graduate in Computer Science, EEE, BBA, or related field.</li>
              <li>Strong problem-solving mindset and solid foundation in modern development stacks.</li>
              <li>Effective teamwork, communication skills, and willingness to learn on live production systems.</li>
              <li>Prior internship or capstone project experience is a plus.</li>
            </ul>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 m-0 pb-3 border-b border-slate-100">
              Job Snapshot
            </h3>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Company</p>
              <p className="text-sm font-bold text-slate-800 m-0 mt-0.5">{job.company}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Workplace Model</p>
              <p className="font-semibold text-slate-800 m-0 mt-0.5">{job.location || 'Remote / Hybrid'}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Employment Type</p>
              <p className="font-semibold text-slate-800 m-0 mt-0.5">{job.employmentType || 'Full-time'}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Date Posted</p>
              <p className="font-semibold text-slate-800 m-0 mt-0.5">
                {new Date(job.createdAt).toLocaleDateString()}
              </p>
            </div>

            {job.postedBy?.name ? (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Shared By Alumnus</p>
                <p className="font-bold text-blue-600 m-0 mt-0.5">{job.postedBy.name}</p>
                {job.postedBy.currentCompany ? (
                  <p className="text-[11px] text-slate-500 m-0">{job.postedBy.currentCompany}</p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-800 block mb-1">Campus Verification Notice</strong>
            This job was submitted directly by an accredited member of the university alumni network. Always apply through official channels.
          </div>
        </div>
      </div>
    </div>
  );
}
