'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
  UserCheck,
  Users,
  X,
  XCircle,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/dashboard/empty-state';
import { TableSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import {
  getApplicationResumeSignedUrl,
  getMyPostedJobs,
  getReceivedApplications,
  updateApplicationStatus,
  type ApplicationCandidateRecord,
  type MyJobsResponse,
} from '@/lib/api/jobs.api';
import { formatDate } from '@/lib/utils/format';
import { useAuthStore } from '@/store/auth-store';
import type { Job, UserRole } from '@/types/domain';

interface ApplicantReviewViewProps {
  currentRole: UserRole;
  basePath: string;
}

const STATUS_FILTERS = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Applied', value: 'APPLIED' },
  { label: 'Under Review', value: 'UNDER_REVIEW' },
  { label: 'Shortlisted', value: 'SHORTLISTED' },
  { label: 'Interview Scheduled', value: 'INTERVIEW_SCHEDULED' },
  { label: 'Offered', value: 'OFFERED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export function ApplicantReviewView({ currentRole, basePath }: ApplicantReviewViewProps) {
  const searchParams = useSearchParams();
  const initialJobId = searchParams?.get('jobId') || '';

  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeCandidate, setActiveCandidate] = useState<ApplicationCandidateRecord | null>(null);
  const [ownerNote, setOwnerNote] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [downloadingResumeId, setDownloadingResumeId] = useState<string | null>(null);

  // Fetch posted jobs to populate dropdown filter
  const postedJobsQuery = useQuery({
    queryKey: ['my-posted-jobs', accessToken],
    queryFn: async () => {
      const res = await getMyPostedJobs(accessToken);
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'postedJobs' in data && Array.isArray((data as MyJobsResponse).postedJobs)) {
        return (data as MyJobsResponse).postedJobs;
      }
      return [];
    },
    enabled: Boolean(accessToken),
  });

  const rawPosted = postedJobsQuery.data;
  const postedJobs: Job[] = Array.isArray(rawPosted)
    ? rawPosted
    : rawPosted && typeof rawPosted === 'object' && 'postedJobs' in rawPosted && Array.isArray((rawPosted as MyJobsResponse).postedJobs)
    ? (rawPosted as MyJobsResponse).postedJobs
    : [];

  // Fetch received applications
  const applicationsQuery = useQuery({
    queryKey: ['received-applications', accessToken, selectedJobId, statusFilter],
    queryFn: async () => {
      const res = await getReceivedApplications(accessToken, {
        jobId: selectedJobId || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      return res.data ?? [];
    },
    enabled: Boolean(accessToken),
  });

  const applications: ApplicationCandidateRecord[] = applicationsQuery.data ?? [];

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({
      jobId,
      applicationId,
      status,
      note,
    }: {
      jobId: string;
      applicationId: string;
      status: string;
      note?: string;
    }) => updateApplicationStatus(accessToken, jobId, applicationId, status, note),
    onSuccess: (updatedRecord, vars) => {
      queryClient.invalidateQueries({ queryKey: ['received-applications'] });
      queryClient.invalidateQueries({ queryKey: ['my-posted-jobs'] });
      setActionNotice(`Candidate status updated to ${vars.status.replace('_', ' ')}.`);
      if (activeCandidate && activeCandidate.id === vars.applicationId) {
        setActiveCandidate({
          ...activeCandidate,
          status: vars.status,
          ownerNote: vars.note,
        });
      }
      setTimeout(() => setActionNotice(null), 4000);
    },
    onError: (err: unknown) => {
      setActionNotice(err instanceof Error ? err.message : 'Failed to update candidate status.');
    },
  });

  const handleDownloadResume = async (appId: string) => {
    try {
      setDownloadingResumeId(appId);
      const res = await getApplicationResumeSignedUrl(accessToken, appId);
      if (res.data?.url) {
        window.open(res.data.url, '_blank', 'noopener,noreferrer');
      }
    } catch {
      setActionNotice('Failed to generate secure resume download link.');
    } finally {
      setDownloadingResumeId(null);
    }
  };

  const handleSelectCandidate = (candidate: ApplicationCandidateRecord) => {
    setActiveCandidate(candidate);
    setOwnerNote(candidate.ownerNote || '');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`${basePath}/jobs/my-jobs`}
        backLabel="Back to My Jobs"
        eyebrow="TALENT ACQUISITION"
        title="Campus Applicants Review"
        description="Review verified candidate academic records, evaluate applicant portfolios, and advance hiring stages."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => applicationsQuery.refetch()}
              disabled={applicationsQuery.isFetching}
            >
              <RefreshCw size={13} className={applicationsQuery.isFetching ? 'animate-spin' : ''} /> Refresh
            </Button>
          </div>
        }
      />

      {actionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <Card className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          {/* Job Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 whitespace-nowrap">
              Position:
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All My Postings ({postedJobs.length})</option>
              {postedJobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.applicantCount ?? 0})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 whitespace-nowrap">
              Stage:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-400 font-mono">
          {applications.length} Candidate{applications.length === 1 ? '' : 's'}
        </span>
      </Card>

      {/* Applicants List */}
      {applicationsQuery.isLoading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No campus applicants found"
          description={
            selectedJobId || statusFilter !== 'ALL'
              ? 'No applications match your selected filters. Try choosing "All My Postings" or clearing stage filters.'
              : 'You have not received any candidate applications yet. Once students apply, their verified profile snapshots will appear here.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {applications.map((app) => {
            const candidateName =
              app.profileSnapshot?.name || app.applicant?.name || 'Candidate';
            const candidateDept =
              app.profileSnapshot?.department || app.applicant?.department || 'University Student';
            const candidateBatch =
              app.profileSnapshot?.batch || app.applicant?.batch || '';
            const studentId = app.profileSnapshot?.studentId || '';

            return (
              <Card
                key={app.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-colors shadow-xs"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-base">
                    {candidateName.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-base font-bold text-slate-900 m-0">
                        {candidateName}
                      </h3>
                      {app.profileSnapshot?.verified && (
                        <span title="Verified Campus Student">
                          <UserCheck size={15} className="text-blue-600" />
                        </span>
                      )}
                      <StatusBadge status={app.status} />
                    </div>

                    <p className="text-xs text-slate-600 m-0 flex items-center gap-2 flex-wrap">
                      <span>{candidateDept}</span>
                      {candidateBatch && <span>• {candidateBatch}</span>}
                      {studentId && <span>• ID: {studentId}</span>}
                    </p>

                    <p className="text-xs text-slate-400 m-0 mt-1 flex items-center gap-2">
                      <BriefcaseBusiness size={12} />
                      <strong className="text-slate-700">{app.job?.title}</strong>
                      <span>• Applied {formatDate(app.createdAt)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {app.resumeKey && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadResume(app.id)}
                      disabled={downloadingResumeId === app.id}
                      className="text-xs h-8"
                    >
                      <Download size={13} className={downloadingResumeId === app.id ? 'animate-bounce' : ''} />
                      Resume (PDF)
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSelectCandidate(app)}
                    className="text-xs h-8 font-semibold"
                  >
                    Evaluate Candidate
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Candidate Evaluation Modal */}
      {activeCandidate && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-blue-400 block mb-1">
                  CANDIDATE DOSSIER
                </span>
                <h2 className="text-xl font-extrabold text-white m-0 flex items-center gap-2">
                  {activeCandidate.profileSnapshot?.name || activeCandidate.applicant?.name}
                  {activeCandidate.profileSnapshot?.verified && (
                    <UserCheck size={18} className="text-blue-400" />
                  )}
                </h2>
                <p className="text-xs text-slate-300 mt-1 m-0">
                  Applied for <strong>{activeCandidate.job?.title}</strong> on{' '}
                  {formatDate(activeCandidate.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveCandidate(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Profile Snapshot Grid */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-400 block">
                  VERIFIED ACADEMIC PROFILE SNAPSHOT
                </span>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Department</span>
                    <strong className="text-slate-800">
                      {activeCandidate.profileSnapshot?.department || 'N/A'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Academic Batch</span>
                    <strong className="text-slate-800">
                      {activeCandidate.profileSnapshot?.batch || 'N/A'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Student ID</span>
                    <strong className="text-slate-800">
                      {activeCandidate.profileSnapshot?.studentId || 'N/A'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Email</span>
                    <strong className="text-slate-800">
                      {activeCandidate.profileSnapshot?.email || activeCandidate.applicant?.email}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Cover Note */}
              {activeCandidate.coverLetter && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Applicant Cover Note / Message
                  </h4>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                    {activeCandidate.coverLetter}
                  </div>
                </div>
              )}

              {/* Resume download bar */}
              {activeCandidate.resumeKey && (
                <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-blue-600" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Verified PDF Resume Document
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Signed access expires in 5 minutes for candidate privacy.
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleDownloadResume(activeCandidate.id)}
                    disabled={downloadingResumeId === activeCandidate.id}
                    className="text-xs"
                  >
                    <Download size={13} /> View Resume
                  </Button>
                </div>
              )}

              {/* Internal Notes Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Recruiter Internal Notes (Private to Poster)
                </label>
                <textarea
                  rows={3}
                  value={ownerNote}
                  onChange={(e) => setOwnerNote(e.target.value)}
                  placeholder="Record interview notes, technical screening feedback, or salary expectations…"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Recruitment Stage Progression */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-500 block">
                  UPDATE RECRUITMENT STAGE
                </span>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateStatusMutation.mutate({
                        jobId: activeCandidate.jobId,
                        applicationId: activeCandidate.id,
                        status: 'SHORTLISTED',
                        note: ownerNote,
                      })
                    }
                    disabled={updateStatusMutation.isPending}
                    className="text-xs"
                  >
                    Shortlist Candidate
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateStatusMutation.mutate({
                        jobId: activeCandidate.jobId,
                        applicationId: activeCandidate.id,
                        status: 'INTERVIEW_SCHEDULED',
                        note: ownerNote,
                      })
                    }
                    disabled={updateStatusMutation.isPending}
                    className="text-xs text-blue-700 border-blue-300 hover:bg-blue-50"
                  >
                    Invite to Interview
                  </Button>

                  <Button
                    size="sm"
                    onClick={() =>
                      updateStatusMutation.mutate({
                        jobId: activeCandidate.jobId,
                        applicationId: activeCandidate.id,
                        status: 'OFFERED',
                        note: ownerNote,
                      })
                    }
                    disabled={updateStatusMutation.isPending}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Extend Job Offer
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      updateStatusMutation.mutate({
                        jobId: activeCandidate.jobId,
                        applicationId: activeCandidate.id,
                        status: 'REJECTED',
                        note: ownerNote,
                      })
                    }
                    disabled={updateStatusMutation.isPending}
                    className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <XCircle size={13} /> Reject
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
