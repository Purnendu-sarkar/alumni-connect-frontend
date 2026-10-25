'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { applyToJob, getJobById } from '@/lib/api/jobs.api';
import { useAuthStore } from '@/store/auth-store';
import { demoJobs } from '@/features/shared/demo-data';
import type { Job } from '@/types/domain';

export default function JobDetailPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const jobId = (params?.slug as string) || '';

  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const [message, setMessage] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  // Fetch real job data
  const { data } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJobById(jobId),
    enabled: Boolean(jobId),
  });

  const applyMutation = useMutation({
    mutationFn: (msg?: string) => applyToJob(accessToken, jobId, msg),
    onSuccess: () => {
      setApplySuccess(true);
      setShowApplyModal(false);
      setApplyError(null);
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
    },
    onError: (err: unknown) => {
      setApplyError(err instanceof Error ? err.message : 'Failed to submit application.');
    },
  });

  const job: Job = data?.data || demoJobs.find((j) => j.id === jobId) || demoJobs[0];

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError(null);
    applyMutation.mutate(message);
  };

  return (
    <section className="page-shell job-detail">
      <Link href="/jobs" className="back-link">
        <ArrowLeft size={16} /> Back to job board
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
        <Badge variant="warning">{job.employmentType ?? 'Full-time'}</Badge>
        <span style={{ fontSize: '0.85rem', color: 'var(--muted, #666)' }}>
          Posted {new Date(job.createdAt).toLocaleDateString()}
        </span>
      </div>

      <h1 style={{ marginTop: '0.5rem' }}>{job.title}</h1>
      <p className="job-detail__company">
        <strong>{job.company}</strong> <span>·</span> <MapPin size={17} /> {job.location || 'Location flexible'}
      </p>

      {applySuccess ? (
        <div style={{ marginTop: '1.25rem' }}>
          <Badge variant="success">
            <CheckCircle2 size={14} style={{ marginRight: '6px' }} />
            Application submitted successfully! Track it in your Student Desk.
          </Badge>
        </div>
      ) : null}

      {applyError ? (
        <div style={{ marginTop: '1.25rem' }}>
          <FormAlert>{applyError}</FormAlert>
        </div>
      ) : null}

      <div className="job-detail__grid" style={{ marginTop: '1.5rem' }}>
        <article>
          <p className="eyebrow">THE ROLE</p>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: 'var(--foreground, #222)' }}>
            {job.description}
          </div>

          <div
            style={{
              marginTop: '2rem',
              padding: '1.25rem',
              borderRadius: '8px',
              background: 'var(--surface-muted, #f9fafb)',
              border: '1px solid var(--border, #e5e5e5)',
            }}
          >
            <p className="eyebrow" style={{ margin: 0 }}>COMMUNITY NETWORK ADVANTAGE</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'var(--muted, #555)' }}>
              This opening is shared directly through your university alumni network. Applying through this platform
              attaches your verified academic enrollment or alumni profile to the application.
            </p>
          </div>
        </article>

        <aside>
          <p className="eyebrow">POSTED BY</p>
          <strong>{job.postedBy?.name || 'Verified Alumnus'}</strong>
          <p style={{ margin: '0.25rem 0 1rem', fontSize: '0.9rem', color: 'var(--muted, #666)' }}>
            {job.postedBy?.currentCompany || job.company}
          </p>

          {/* Action buttons */}
          {user ? (
            applySuccess ? (
              <Button disabled style={{ width: '100%', background: '#16a34a', color: '#fff' }}>
                <CheckCircle2 size={16} /> Application Sent
              </Button>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <Button
                  id="apply-job-btn"
                  onClick={() => setShowApplyModal(true)}
                  style={{ width: '100%' }}
                >
                  <Send size={16} /> Apply with Student Profile
                </Button>

                {job.applicationUrl ? (
                  <Button asChild variant="secondary" style={{ width: '100%' }}>
                    <a href={job.applicationUrl} target="_blank" rel="noreferrer">
                      External Link <ExternalLink size={14} />
                    </a>
                  </Button>
                ) : null}
              </div>
            )
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <Button asChild style={{ width: '100%' }}>
                <Link href="/login">Sign in to Apply <ArrowUpRight size={16} /></Link>
              </Button>
              {job.applicationUrl ? (
                <Button asChild variant="secondary" style={{ width: '100%' }}>
                  <a href={job.applicationUrl} target="_blank" rel="noreferrer">
                    External Link <ExternalLink size={14} />
                  </a>
                </Button>
              ) : null}
            </div>
          )}
        </aside>
      </div>

      {/* Application Dialog Modal */}
      {showApplyModal ? (
        <div
          className="dashboard-note"
          style={{
            marginTop: '2rem',
            padding: '1.75rem',
            borderRadius: '10px',
            border: '2px solid var(--accent, #000)',
            background: 'var(--surface, #fff)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <p className="eyebrow" style={{ margin: 0 }}>CONFIRM APPLICATION</p>
              <h2 style={{ margin: '0.25rem 0 0' }}>Apply to {job.title} at {job.company}</h2>
            </div>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--muted, #555)', margin: '0 0 1rem' }}>
            Your academic profile ({user?.name}, {user?.department || 'Department Member'}, Batch {user?.batch || 'Active'})
            will be submitted with this application.
          </p>

          <form onSubmit={handleApply} style={{ display: 'grid', gap: '1rem' }}>
            <div className="field">
              <label className="field__label">Introductory Note to Alumni Recruiter (Optional)</label>
              <textarea
                id="apply-note-input"
                className="field__input"
                rows={4}
                placeholder="Briefly state your interest in the position, projects relevant to the role, or questions about the team…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button type="button" variant="ghost" onClick={() => setShowApplyModal(false)}>
                Cancel
              </Button>
              <Button id="confirm-apply-btn" type="submit" disabled={applyMutation.isPending}>
                <Send size={16} /> {applyMutation.isPending ? 'Submitting…' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
