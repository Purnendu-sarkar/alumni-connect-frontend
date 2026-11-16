'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  MapPin,
  RefreshCw,
  Search,
  Undo2,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog';
import { EmptyState } from '@/components/dashboard/empty-state';
import { TableSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import {
  getApplicationResumeSignedUrl,
  getMyApplications,
  withdrawApplication,
  type ApplicationCandidateRecord,
} from '@/lib/api/jobs.api';
import { formatDate } from '@/lib/utils/format';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface JobApplicationsViewProps {
  currentRole: UserRole;
  basePath: string;
}

const ACTIVE_STATUSES = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED'];
const CONCLUDED_STATUSES = ['REJECTED', 'WITHDRAWN'];

export function JobApplicationsView({ currentRole, basePath }: JobApplicationsViewProps) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'CONCLUDED'>('ALL');
  const [withdrawingApp, setWithdrawingApp] = useState<ApplicationCandidateRecord | null>(null);
  const [withdrawNote, setWithdrawNote] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [downloadingResumeId, setDownloadingResumeId] = useState<string | null>(null);

  const applicationsQuery = useQuery({
    queryKey: ['my-applications', accessToken],
    queryFn: async () => {
      const res = await getMyApplications(accessToken, 1, 50);
      return res.data ?? [];
    },
    enabled: Boolean(accessToken),
  });

  const applications: ApplicationCandidateRecord[] = applicationsQuery.data ?? [];

  const withdrawMutation = useMutation({
    mutationFn: (applicationId: string) =>
      withdrawApplication(accessToken, applicationId, withdrawNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['published-jobs'] });
      setActionNotice('Application was successfully withdrawn.');
      setWithdrawingApp(null);
      setWithdrawNote('');
      setTimeout(() => setActionNotice(null), 4000);
    },
    onError: (err: unknown) => {
      setActionNotice(err instanceof Error ? err.message : 'Failed to withdraw application.');
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

  const filteredApplications = applications.filter((app) => {
    if (activeTab === 'ACTIVE') return ACTIVE_STATUSES.includes(app.status);
    if (activeTab === 'CONCLUDED') return CONCLUDED_STATUSES.includes(app.status);
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CAMPUS CAREER TRACKER"
        title="My Job Applications"
        description="Monitor recruitment progress, stage updates, and verified interview communications."
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
            <Button asChild size="sm">
              <Link href={`${basePath}/jobs`}>
                <BriefcaseBusiness size={14} /> Browse Jobs
              </Link>
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'ALL', label: `All Applications (${applications.length})` },
          {
            key: 'ACTIVE',
            label: `In Progress (${applications.filter((a) => ACTIVE_STATUSES.includes(a.status)).length})`,
          },
          {
            key: 'CONCLUDED',
            label: `Concluded (${applications.filter((a) => CONCLUDED_STATUSES.includes(a.status)).length})`,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as 'ALL' | 'ACTIVE' | 'CONCLUDED')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === tab.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {applicationsQuery.isLoading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : filteredApplications.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title={
            activeTab === 'ACTIVE'
              ? 'No active applications'
              : activeTab === 'CONCLUDED'
              ? 'No concluded applications'
              : 'You have not submitted any applications yet'
          }
          description="Explore verified campus job opportunities and apply directly with your accredited university profile."
          action={
            <Button size="sm" asChild>
              <Link href={`${basePath}/jobs`}>
                <BriefcaseBusiness size={14} /> Explore Openings
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const canWithdraw = app.status === 'APPLIED' || app.status === 'UNDER_REVIEW';

            return (
              <Card key={app.id} className="p-5 space-y-4 shadow-xs hover:border-slate-300 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap mb-1">
                      <h3 className="text-base font-bold text-slate-900 m-0">
                        {app.job?.title || 'Job Listing'}
                      </h3>
                      <StatusBadge status={app.status} />
                    </div>

                    <p className="text-xs text-slate-600 flex items-center gap-2 m-0">
                      <strong>{app.job?.company}</strong>
                      <span>•</span>
                      <span>{app.job?.location || 'Remote'}</span>
                      <span>•</span>
                      <span>Applied on {formatDate(app.createdAt)}</span>
                    </p>
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
                        My Resume
                      </Button>
                    )}

                    {canWithdraw && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setWithdrawingApp(app)}
                        className="text-xs h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      >
                        <Undo2 size={13} /> Withdraw
                      </Button>
                    )}

                    {app.job?.id && (
                      <Button size="sm" variant="secondary" asChild className="text-xs h-8">
                        <Link href={`${basePath}/jobs/${app.job.id}`}>
                          View Job <ArrowUpRight size={13} />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Cover Note Snippet */}
                {app.coverLetter && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600">
                    <span className="font-bold text-slate-700 block text-[11px] mb-0.5">Cover Note Sent:</span>
                    <p className="m-0 italic line-clamp-2">{app.coverLetter}</p>
                  </div>
                )}

                {/* Status Timeline History */}
                {app.history && app.history.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-400 block mb-2">
                      APPLICATION STAGE TIMELINE
                    </span>
                    <div className="flex items-center gap-3 overflow-x-auto text-[11px]">
                      {app.history.map((h, idx) => (
                        <div key={h.id || idx} className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                            <span className="font-bold text-slate-800">{h.toStatus.replace('_', ' ')}</span>
                            <span className="text-slate-400">({formatDate(h.createdAt)})</span>
                          </div>
                          {idx < (app.history?.length || 0) - 1 && (
                            <span className="text-slate-300">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Accessible Withdraw Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(withdrawingApp)}
        title="Withdraw Application?"
        description={`Are you sure you want to withdraw your application for "${withdrawingApp?.job?.title}" at ${withdrawingApp?.job?.company}? This will notify the recruiter and cannot be undone.`}
        confirmLabel="Withdraw Application"
        variant="destructive"
        isLoading={withdrawMutation.isPending}
        onConfirm={() => {
          if (withdrawingApp) {
            withdrawMutation.mutate(withdrawingApp.id);
          }
        }}
        onClose={() => {
          setWithdrawingApp(null);
          setWithdrawNote('');
        }}
      />
    </div>
  );
}
