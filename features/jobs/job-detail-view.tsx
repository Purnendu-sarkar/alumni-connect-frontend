'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  FileCheck,
  Flag,
  Mail,
  MapPin,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SanitizedRichText } from '@/components/shared/sanitized-rich-text';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/page-header';
import { JobApplyModal } from '@/components/jobs/job-apply-modal';
import { ReportContentModal } from '@/components/shared/report-content-modal';
import { getJobById } from '@/lib/api/jobs.api';
import { formatDate } from '@/lib/utils/format';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface JobDetailViewProps {
  id: string;
  currentRole: UserRole;
  basePath: string;
}

export function JobDetailView({ id, currentRole, basePath }: JobDetailViewProps) {
  const user = useAuthStore((state) => state.user);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const jobQuery = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const res = await getJobById(id);
      return res.data;
    },
  });

  const job = jobQuery.data;

  if (jobQuery.isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-100 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-64 bg-slate-100 rounded-2xl" />
            <div className="h-48 bg-slate-100 rounded-2xl" />
          </div>
          <div className="h-80 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (jobQuery.isError || !job) {
    return (
      <EmptyState
        icon={BriefcaseBusiness}
        title="Career Opportunity Not Found"
        description="This job listing may have expired, been removed, or is no longer available on the campus network."
        action={
          <Button asChild size="sm">
            <Link href={`${basePath}/jobs`}>
              <ArrowLeft size={14} /> Back to Jobs Board
            </Link>
          </Button>
        }
      />
    );
  }

  const isAuthor = user?.id && job.postedBy?.id === user.id;
  const hasApplied = Boolean(job.hasApplied);
  const isClosed = job.status === 'CLOSED' || (job.daysLeft !== undefined && job.daysLeft === 0);

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`${basePath}/jobs`}
        backLabel="Back to Jobs Board"
        eyebrow="CAREER OPPORTUNITY"
        title={job.title}
        description={`${job.company} · ${job.location || 'Remote'} · ${job.employmentType || 'Full-time'}`}
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="warning">{job.employmentType || 'Full-time'}</Badge>
            {job.referralAvailable && (
              <Badge variant="secondary" className="bg-amber-50 text-amber-800 border-amber-200">
                <Sparkles size={11} className="mr-1 text-amber-600 inline" /> Alumni Referral
              </Badge>
            )}
            {isClosed && (
              <Badge variant="destructive" className="bg-rose-50 text-rose-700 border-rose-200">
                Listing Closed
              </Badge>
            )}
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            {isAuthor ? (
              <Button asChild size="sm" variant="secondary">
                <Link href={`${basePath}/jobs/my-jobs`}>Manage My Listing</Link>
              </Button>
            ) : hasApplied ? (
              <Badge variant="success" className="px-3 py-1.5 text-xs font-semibold">
                Applied ({job.viewerApplicationStatus || 'Under Review'})
              </Badge>
            ) : !isClosed && (currentRole === 'STUDENT' || currentRole === 'ALUMNI') ? (
              <Button size="sm" onClick={() => setIsApplyModalOpen(true)}>
                <Send size={14} /> Apply for Position
              </Button>
            ) : null}

            {job.applicationUrl && (
              <Button size="sm" variant="outline" asChild>
                <a href={job.applicationUrl} target="_blank" rel="noreferrer">
                  External Portal <ExternalLink size={13} />
                </a>
              </Button>
            )}

            {!isAuthor && (
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                onClick={() => setIsReportModalOpen(true)}
                title="Report Job Listing"
              >
                <Flag size={14} />
              </Button>
            )}
          </div>
        }
      />

      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Description & Requirements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 m-0">About the Role</h2>
            <SanitizedRichText content={job.description} className="text-xs sm:text-sm text-slate-700 leading-relaxed" />
          </Card>

          {/* Requirements */}
          {job.requirements && (
            <Card className="p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 m-0">Key Qualifications & Skills</h2>
              <SanitizedRichText content={job.requirements} className="text-xs sm:text-sm text-slate-700 leading-relaxed" />
            </Card>
          )}

          {/* Institutional Trust Assurance */}
          <div className="p-5 bg-blue-50/50 border border-blue-200 rounded-2xl flex items-start gap-3.5">
            <ShieldCheck size={24} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-blue-900 m-0">Institutional Trust Guarantee</h3>
              <p className="text-[11px] text-blue-800 mt-1 leading-relaxed m-0">
                This opportunity has undergone verification by university moderators. Student applicants receive direct alumni consideration with verified identity guarantees.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Key Details & Poster Info */}
        <div className="space-y-6">
          {/* Position Overview Card */}
          <Card className="p-5 space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 m-0">
              POSITION OVERVIEW
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-2.5">
                <DollarSign size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Compensation</span>
                  <span className="font-bold text-slate-900">{job.salary || 'Negotiable / Undisclosed'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Location & Workplace</span>
                  <span className="font-bold text-slate-900">{job.location || 'Remote'} ({job.workMode || 'On-site'})</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <BriefcaseBusiness size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Experience Level</span>
                  <span className="font-bold text-slate-900">{job.experienceLevel || 'Open / Any'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Application Deadline</span>
                  <span className="font-bold text-slate-900">
                    {job.deadline ? formatDate(job.deadline) : 'Rolling Admissions'}
                    {job.daysLeft !== undefined && (
                      <span className="text-amber-600 font-semibold ml-1.5">
                        ({job.daysLeft === 0 ? 'Ends today' : `${job.daysLeft} days remaining`})
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <FileCheck size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Application Requirements</span>
                  <span className="font-medium text-slate-700">
                    {job.requireResume ? 'PDF Resume Mandatory' : 'Resume Optional'} ·{' '}
                    {job.requireCoverLetter ? 'Cover Letter Required' : 'Cover Letter Optional'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Verified Alumni Poster Card */}
          {job.postedBy && (
            <Card className="p-5 space-y-4">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 m-0">
                POSTED BY ALUMNI
              </h3>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                  {job.postedBy.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 m-0 flex items-center gap-1.5">
                    {job.postedBy.name}
                    {job.postedBy.verified && (
                      <span title="Verified Alumni">
                        <UserCheck size={14} className="text-blue-600" />
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-500 m-0 mt-0.5">
                    {job.postedBy.position ? `${job.postedBy.position} at ` : ''}
                    {job.postedBy.currentCompany || job.company}
                  </p>
                  <p className="text-[11px] text-slate-400 m-0 mt-0.5">
                    {job.postedBy.department || 'Alumni Member'}
                    {job.postedBy.batch ? ` · ${job.postedBy.batch}` : ''}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <Button variant="ghost" size="sm" asChild className="w-full text-xs">
                  <Link href={`${basePath}/directory/${job.postedBy.id}`}>
                    View Alumni Profile
                  </Link>
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      <JobApplyModal
        job={job}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={(title) => {
          setSuccessToast(`Congratulations! Your application for "${title}" was successfully submitted.`);
          setTimeout(() => setSuccessToast(null), 6000);
        }}
      />

      {/* Report Job Modal */}
      {isReportModalOpen && (
        <ReportContentModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          targetType="JOB"
          targetId={job.id}
          targetName={job.title}
        />
      )}
    </div>
  );
}
