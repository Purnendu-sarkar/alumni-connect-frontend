'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { getPendingJobs, reviewJob } from '@/lib/api/jobs.api';
import { useAuthStore } from '@/store/auth-store';

import type { Job } from '@/types/domain';

export default function ModeratorDashboardPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const firstName = user?.name ? user.name.split(' ')[0] : 'Moderator';

  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectingJob, setRejectingJob] = useState<Job | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const pendingJobsQuery = useQuery({
    queryKey: ['pending-jobs', accessToken],
    queryFn: () => getPendingJobs(accessToken),
    enabled: Boolean(accessToken),
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      jobId,
      status,
      reason,
    }: {
      jobId: string;
      status: 'APPROVED' | 'REJECTED';
      reason?: string;
    }) => reviewJob(accessToken, jobId, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
      setRejectingJob(null);
      setRejectionReason('');
      setActionError(null);
    },
    onError: (err: unknown) => {
      setActionError(err instanceof Error ? err.message : 'Failed to update job status.');
    },
  });

  const pendingJobs = pendingJobsQuery.data?.data ?? [];

  return (
    <section className="dashboard-page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <p className="eyebrow">{user?.university?.name ? user.university.name.toUpperCase() : 'COMMUNITY MODERATION'}</p>
          <h1>Moderator Desk — {firstName}.</h1>
          <p className="lede">
            Institutional Content & Safety Desk · Review submitted jobs, maintain post standards, and audit queues.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Badge variant="neutral" style={{ backgroundColor: '#fef3c7', color: '#b45309', borderColor: '#fde68a' }}>
            <ShieldAlert size={14} style={{ marginRight: '4px' }} /> Moderator Access
          </Badge>
          <Button variant="secondary" onClick={() => pendingJobsQuery.refetch()} disabled={pendingJobsQuery.isFetching}>
            <RefreshCw size={14} className={pendingJobsQuery.isFetching ? 'animate-spin' : ''} /> Refresh Queue
          </Button>
        </div>
      </div>

      {actionError ? (
        <div style={{ marginTop: '1.25rem' }}>
          <FormAlert>{actionError}</FormAlert>
        </div>
      ) : null}

      {/* Overview Metric Cards */}
      <div className="dashboard-stats" style={{ marginTop: '1.5rem' }}>
        <article>
          <Clock size={24} style={{ color: '#d97706' }} />
          <strong>{pendingJobs.length}</strong>
          <span>JOBS PENDING REVIEW</span>
        </article>
        <article>
          <ShieldCheck size={24} style={{ color: '#16a34a' }} />
          <strong>Active</strong>
          <span>QUEUE STATUS</span>
        </article>
        <article>
          <Users size={24} style={{ color: '#0284c7' }} />
          <strong>{user?.university?.slug || 'Campus'}</strong>
          <span>ASSIGNED TENANT</span>
        </article>
      </div>

      {/* Moderation Queues Split */}
      <div className="dashboard-split" style={{ marginTop: '2rem' }}>
        <aside className="dashboard-note">
          <p className="eyebrow"><ShieldCheck size={14} /> IDENTITY VERIFICATION</p>
          <h2>Student & Alumni ID Queue</h2>
          <p>
            Verify university enrollment records, graduation batches, and student IDs submitted during registration.
          </p>
          <Button asChild style={{ marginTop: '0.75rem' }}>
            <Link href="/admin/verification">Open Verification Queue <ArrowUpRight size={14} /></Link>
          </Button>
        </aside>

        <section>
          <div className="section-heading">
            <div>
              <p className="eyebrow">STANDARDS & GUIDELINES</p>
              <h2>Job Posting Verification Rules</h2>
            </div>
          </div>
          <p style={{ color: 'var(--muted, #666)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Ensure each posting provides a clear company name, legitimate job description, non-spam referral link,
            and respectful compensation or internship criteria. Reject duplicate or fraudulent posts.
          </p>
        </section>
      </div>

      {/* Pending Job Review Queue */}
      <div id="job-queue" style={{ marginTop: '2.5rem' }}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">APPROVAL QUEUE</p>
            <h2>Pending Career Opportunities ({pendingJobs.length})</h2>
          </div>
        </div>

        {/* Rejection Modal / Dialog */}
        {rejectingJob ? (
          <div
            className="dashboard-note"
            style={{
              border: '2px solid #ef4444',
              background: '#fff5f5',
              margin: '1.5rem 0',
              padding: '1.25rem',
              borderRadius: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#b91c1c' }}>
                Reject Posting: {rejectingJob.title} ({rejectingJob.company})
              </h3>
              <button
                type="button"
                onClick={() => setRejectingJob(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#7f1d1d', margin: '0.5rem 0' }}>
              Please provide a clear reason for rejecting this job posting (e.g. duplicate post, missing compensation details, broken link).
            </p>

            <textarea
              className="field__input"
              rows={3}
              placeholder="e.g. Broken application URL or missing company verification details."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              style={{ width: '100%', marginTop: '0.5rem' }}
            />

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <Button
                onClick={() =>
                  reviewMutation.mutate({
                    jobId: rejectingJob.id,
                    status: 'REJECTED',
                    reason: rejectionReason,
                  })
                }
                disabled={reviewMutation.isPending || rejectionReason.trim().length < 5}
                style={{ background: '#dc2626', color: '#fff' }}
              >
                {reviewMutation.isPending ? 'Rejecting…' : 'Confirm Rejection'}
              </Button>
              <Button variant="ghost" onClick={() => setRejectingJob(null)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {pendingJobsQuery.isLoading ? (
          <p className="empty-state">Loading pending job submissions…</p>
        ) : pendingJobs.length === 0 ? (
          <div
            style={{
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              border: '1px dashed var(--border, #d1d5db)',
              borderRadius: '8px',
              marginTop: '1rem',
            }}
          >
            <CheckCircle2 size={32} style={{ margin: '0 auto 0.75rem', color: '#16a34a' }} />
            <p style={{ fontWeight: 600, margin: '0 0 0.25rem' }}>All job postings are moderated</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted, #666)', margin: 0 }}>
              There are no pending job submissions awaiting review in your institutional queue.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            {pendingJobs.map((job) => (
              <article
                key={job.id}
                style={{
                  padding: '1.25rem',
                  borderRadius: '8px',
                  background: 'var(--surface-muted, #f8f8f8)',
                  border: '1px solid var(--border, #e5e5e5)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{job.title}</strong>
                      <Badge variant="neutral" style={{ color: '#d97706', borderColor: '#fcd34d' }}>
                        Pending Review
                      </Badge>
                    </div>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: 'var(--muted, #666)' }}>
                      <strong>{job.company}</strong> · {job.location || 'Remote'} · {job.employmentType || 'Full-time'}
                    </p>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.8rem', color: 'var(--muted, #888)' }}>
                      Submitted by: {job.postedBy?.name || 'Alumnus'} {job.postedBy?.currentCompany ? `(${job.postedBy.currentCompany})` : ''} ·{' '}
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Approve / Reject Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      onClick={() => reviewMutation.mutate({ jobId: job.id, status: 'APPROVED' })}
                      disabled={reviewMutation.isPending}
                      style={{ background: '#16a34a', color: '#fff' }}
                    >
                      <Check size={16} /> Approve
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setRejectingJob(job);
                        setRejectionReason('');
                      }}
                      disabled={reviewMutation.isPending}
                      style={{ color: '#dc2626' }}
                    >
                      <X size={16} /> Reject
                    </Button>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    background: '#fff',
                    borderRadius: '6px',
                    border: '1px solid var(--border, #eaeaea)',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                  }}
                >
                  <p style={{ margin: '0 0 0.5rem', fontWeight: 600, color: 'var(--foreground, #111)' }}>
                    Description & Details:
                  </p>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--muted, #444)' }}>
                    {job.description}
                  </p>
                  {job.applicationUrl ? (
                    <div style={{ marginTop: '0.5rem' }}>
                      <a
                        href={job.applicationUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#0284c7',
                          fontSize: '0.8rem',
                          textDecoration: 'underline',
                        }}
                      >
                        Destination: {job.applicationUrl} <ExternalLink size={12} />
                      </a>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
