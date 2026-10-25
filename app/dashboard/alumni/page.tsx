'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock,
  Plus,
  Send,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { createJob, getMyJobs, type CreateJobInput } from '@/lib/api/jobs.api';
import { useAuthStore } from '@/store/auth-store';

export default function AlumniDashboardPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const firstName = user?.name ? user.name.split(' ')[0] : 'Alumnus';

  const [showPostModal, setShowPostModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Job form state
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState(user?.department ? `${user.department} Network` : '');
  const [location, setLocation] = useState('Remote / Hybrid');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [description, setDescription] = useState('');

  const jobsQuery = useQuery({
    queryKey: ['my-jobs', accessToken],
    queryFn: () => getMyJobs(accessToken),
    enabled: Boolean(accessToken),
  });

  const postJobMutation = useMutation({
    mutationFn: (data: CreateJobInput) => createJob(accessToken, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
      setShowPostModal(false);
      setSuccessMessage('Your job opening has been submitted to the moderation queue.');
      setTitle('');
      setDescription('');
      setApplicationUrl('');
      setFormError(null);
    },
    onError: (err: unknown) => {
      setFormError(err instanceof Error ? err.message : 'Failed to submit job posting.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!title.trim() || !company.trim() || !description.trim()) {
      setFormError('Please provide job title, company name, and job description.');
      return;
    }
    postJobMutation.mutate({
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      employmentType,
      applicationUrl: applicationUrl.trim() || undefined,
      description: description.trim(),
    });
  };

  const postedJobs = jobsQuery.data?.data?.postedJobs ?? [];

  return (
    <section className="dashboard-page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <p className="eyebrow">{user?.university?.name ? user.university.name.toUpperCase() : 'ALUMNI PROFESSIONAL DESK'}</p>
          <h1>Welcome back, {firstName}.</h1>
          <p className="lede">
            Graduated Alumni Member · {user?.department || 'Department Alumni'} · Class of {user?.batch || 'Alumni'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {user?.verificationStatus === 'APPROVED' ? (
            <Badge variant="success">
              <CheckCircle2 size={13} style={{ marginRight: '4px' }} /> Verified Alumnus
            </Badge>
          ) : (
            <Badge variant="neutral" style={{ color: '#d97706', borderColor: '#fcd34d' }}>
              <Clock size={13} style={{ marginRight: '4px' }} /> Verification Pending
            </Badge>
          )}

          <Button onClick={() => setShowPostModal(true)}>
            <Plus size={16} /> Post Opportunity
          </Button>
        </div>
      </div>

      {successMessage ? (
        <div style={{ marginTop: '1.25rem' }}>
          <Badge variant="success">{successMessage}</Badge>
        </div>
      ) : null}

      {/* Metrics */}
      <div className="dashboard-stats" style={{ marginTop: '1.5rem' }}>
        <article>
          <Building2 size={24} style={{ color: '#16a34a' }} />
          <strong>{postedJobs.length}</strong>
          <span>POSTED OPPORTUNITIES</span>
        </article>
        <article>
          <UserCheck size={24} style={{ color: '#0284c7' }} />
          <strong>{user?.verificationStatus === 'APPROVED' ? 'Verified' : 'Pending'}</strong>
          <span>ALUMNI ACCREDITATION</span>
        </article>
        <article>
          <Users size={24} style={{ color: '#7c3aed' }} />
          <strong>{user?.batch || 'Alumni'}</strong>
          <span>GRADUATION CLASS</span>
        </article>
      </div>

      {/* Post Job Inline Dialog / Modal */}
      {showPostModal ? (
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
              <p className="eyebrow" style={{ margin: 0 }}>NEW CAREER LISTING</p>
              <h2 style={{ margin: '0.25rem 0 0' }}>Share an opening with your university network</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowPostModal(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>

          {formError ? <FormAlert>{formError}</FormAlert> : null}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <Input
                label="Job Title *"
                placeholder="e.g. Senior Software Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Input
                label="Company / Organization *"
                placeholder="e.g. Tech Innovations Ltd."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <Input
                label="Location"
                placeholder="e.g. Dhaka, Bangladesh / Hybrid"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <div className="field">
                <label className="field__label">Employment Type</label>
                <select
                  className="field__input"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
            </div>

            <Input
              label="Application Link or Referral URL"
              placeholder="https://company.com/careers/apply-123"
              value={applicationUrl}
              onChange={(e) => setApplicationUrl(e.target.value)}
            />

            <div className="field">
              <label className="field__label">Job Description & Candidate Requirements *</label>
              <textarea
                className="field__input"
                rows={4}
                placeholder="Describe role responsibilities, required skills, and any alumni referral advantages…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button type="button" variant="ghost" onClick={() => setShowPostModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={postJobMutation.isPending}>
                <Send size={16} /> {postJobMutation.isPending ? 'Submitting…' : 'Publish to Review Queue'}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      {/* My Postings Section */}
      <div style={{ marginTop: '2.5rem' }}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">YOUR RECRUITMENT POSTINGS</p>
            <h2>Opportunities you have shared.</h2>
          </div>
          <Button variant="secondary" onClick={() => jobsQuery.refetch()} disabled={jobsQuery.isFetching}>
            Refresh
          </Button>
        </div>

        {jobsQuery.isLoading ? (
          <p className="empty-state">Loading your job postings…</p>
        ) : postedJobs.length === 0 ? (
          <div
            style={{
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              border: '1px dashed var(--border, #d1d5db)',
              borderRadius: '8px',
              marginTop: '1rem',
            }}
          >
            <BriefcaseBusiness size={32} style={{ margin: '0 auto 0.75rem', color: '#9ca3af' }} />
            <p style={{ fontWeight: 600, margin: '0 0 0.25rem' }}>You haven&apos;t shared any jobs yet</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted, #666)', margin: '0 0 1rem' }}>
              Help current students and fellow alumni jumpstart their careers by posting roles from your company.
            </p>
            <Button onClick={() => setShowPostModal(true)}>
              <Plus size={16} /> Post Your First Opportunity
            </Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
            {postedJobs.map((job) => {
              const status = job.status || 'APPROVED';
              return (
                <div
                  key={job.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    padding: '1.25rem',
                    borderRadius: '8px',
                    background: 'var(--surface-muted, #f8f8f8)',
                    border: '1px solid var(--border, #e5e5e5)',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '1.05rem' }}>{job.title}</strong>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--muted, #666)', marginTop: '0.25rem' }}>
                      <span>{job.company}</span>
                      {job.location ? <span>• {job.location}</span> : null}
                      <span>• Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Badge variant={status === 'APPROVED' ? 'success' : status === 'REJECTED' ? 'neutral' : 'neutral'}>
                      {status === 'APPROVED' ? 'Live on Board' : status === 'REJECTED' ? 'Rejected' : 'Under Moderation'}
                    </Badge>
                    {job.applicationUrl ? (
                      <Button asChild variant="ghost" style={{ fontSize: '0.85rem' }}>
                        <a href={job.applicationUrl} target="_blank" rel="noreferrer">
                          Link <ArrowUpRight size={14} />
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Directory & Profile Shortcuts */}
      <div className="dashboard-split" style={{ marginTop: '2.5rem' }}>
        <section>
          <div className="section-heading">
            <div>
              <p className="eyebrow">CAMPUS TALENT</p>
              <h2>Discover promising graduates.</h2>
            </div>
          </div>
          <p style={{ color: 'var(--muted, #666)', lineHeight: 1.6 }}>
            Browse enrolled students and recent alumni seeking mentorship or career openings. Share insights from your industry experience.
          </p>
          <Button asChild style={{ marginTop: '1rem' }}>
            <Link href="/alumni">Browse Member Directory</Link>
          </Button>
        </section>

        <aside className="dashboard-note">
          <p className="eyebrow">PROFESSIONAL BRAND</p>
          <h2>Keep your experience up to date.</h2>
          <p>Highlight your current company, job title, and skills to help students find you for relevant industry advice.</p>
          <Button asChild variant="secondary" style={{ marginTop: '0.75rem' }}>
            <Link href="/dashboard/profile">Edit Professional Profile</Link>
          </Button>
        </aside>
      </div>
    </section>
  );
}
