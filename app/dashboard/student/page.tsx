'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  GraduationCap,
  Sparkles,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getMyJobs } from '@/lib/api/jobs.api';
import { useAuthStore } from '@/store/auth-store';

export default function StudentDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';

  const jobsQuery = useQuery({
    queryKey: ['my-jobs', accessToken],
    queryFn: () => getMyJobs(accessToken),
    enabled: Boolean(accessToken),
  });

  const applications = jobsQuery.data?.data?.applications ?? [];

  return (
    <section className="dashboard-page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <p className="eyebrow">{user?.university?.name ? user.university.name.toUpperCase() : 'STUDENT DESK'}</p>
          <h1>Welcome back, {firstName}.</h1>
          <p className="lede">
            Enrolled Student Member · {user?.department || 'Academic Department'} · Batch {user?.batch || 'Active'}
          </p>
        </div>

        <div>
          {user?.verificationStatus === 'APPROVED' ? (
            <Badge variant="success">
              <CheckCircle2 size={13} style={{ marginRight: '4px' }} /> Verified Student
            </Badge>
          ) : user?.verificationStatus === 'REJECTED' ? (
            <Badge variant="neutral" style={{ color: '#dc2626', borderColor: '#fca5a5' }}>
              <XCircle size={13} style={{ marginRight: '4px' }} /> Verification Rejected
            </Badge>
          ) : (
            <Badge variant="neutral" style={{ color: '#d97706', borderColor: '#fcd34d' }}>
              <Clock size={13} style={{ marginRight: '4px' }} /> Verification Pending
            </Badge>
          )}
        </div>
      </div>

      {/* Verification Notice */}
      {user?.verificationStatus !== 'APPROVED' ? (
        <div
          className="dashboard-note"
          style={{
            marginTop: '1.5rem',
            borderLeft: user?.verificationStatus === 'REJECTED' ? '4px solid #ef4444' : '4px solid #f59e0b',
            background: user?.verificationStatus === 'REJECTED' ? '#fef2f2' : '#fffbeb',
          }}
        >
          <strong>
            {user?.verificationStatus === 'REJECTED'
              ? 'Institutional Verification Needs Attention'
              : 'Academic Verification Under Institutional Review'}
          </strong>
          <p style={{ margin: '0.25rem 0 0.75rem', fontSize: '0.9rem' }}>
            {user?.verificationStatus === 'REJECTED'
              ? user.rejectionReason
                ? `Admin feedback: "${user.rejectionReason}". Please update your academic details to resubmit.`
                : 'Your submission was returned. Please check your student ID and academic credentials.'
              : 'Your student enrollment is in the university registrar verification queue. Full directory messaging unlocks upon approval.'}
          </p>
          <Button asChild variant="secondary">
            <Link href="/dashboard/profile">Review & Edit Academic Profile</Link>
          </Button>
        </div>
      ) : null}

      {/* Key Metric Cards */}
      <div className="dashboard-stats" style={{ marginTop: '1.5rem' }}>
        <article>
          <GraduationCap size={24} style={{ color: '#0284c7' }} />
          <strong>{user?.department || 'Enrolled'}</strong>
          <span>DEPARTMENT</span>
        </article>
        <article>
          <Sparkles size={24} style={{ color: '#7c3aed' }} />
          <strong>Batch {user?.batch || '—'}</strong>
          <span>CLASS YEAR</span>
        </article>
        <article>
          <BriefcaseBusiness size={24} style={{ color: '#16a34a' }} />
          <strong>{applications.length}</strong>
          <span>ACTIVE APPLICATIONS</span>
        </article>
      </div>

      {/* Quick Action Split Grid */}
      <div className="dashboard-split" style={{ marginTop: '2rem' }}>
        {/* Left: Explore Alumni Mentors */}
        <section>
          <div className="section-heading">
            <div>
              <p className="eyebrow">MENTORSHIP & DIRECTORY</p>
              <h2>Connect with departmental alumni.</h2>
            </div>
            <Link href="/alumni" className="text-link">
              Directory <ArrowUpRight size={16} />
            </Link>
          </div>
          <p style={{ color: 'var(--muted, #666)', lineHeight: 1.6 }}>
            Reach out to graduates from your department working at leading engineering and corporate institutions.
            Ask for career guidance, resume reviews, and industry insights.
          </p>
          <Button asChild style={{ marginTop: '1rem' }}>
            <Link href="/alumni">Browse Verified Alumni</Link>
          </Button>
        </section>

        {/* Right: Career Opportunities */}
        <aside className="dashboard-note">
          <p className="eyebrow">CAMPUS OPPORTUNITIES</p>
          <h2>Explore jobs posted by alumni.</h2>
          <p>
            Alumni frequently post early-career, internship, and junior openings exclusively for your university community.
          </p>
          <Button asChild variant="secondary" style={{ marginTop: '0.75rem' }}>
            <Link href="/jobs">View Job Board <ArrowUpRight size={14} /></Link>
          </Button>
        </aside>
      </div>

      {/* My Applications Section */}
      <div style={{ marginTop: '2.5rem' }}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">CAREER PROGRESS</p>
            <h2>Your submitted applications.</h2>
          </div>
        </div>

        {jobsQuery.isLoading ? (
          <p className="empty-state">Loading your application records…</p>
        ) : applications.length === 0 ? (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              border: '1px dashed var(--border, #d1d5db)',
              borderRadius: '8px',
              marginTop: '1rem',
            }}
          >
            <BriefcaseBusiness size={32} style={{ margin: '0 auto 0.75rem', color: '#9ca3af' }} />
            <p style={{ fontWeight: 600, margin: '0 0 0.25rem' }}>No active applications submitted yet</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted, #666)', margin: '0 0 1rem' }}>
              Browse verified alumni job listings and apply directly with your academic credentials.
            </p>
            <Button asChild>
              <Link href="/jobs">Browse Alumni Jobs</Link>
            </Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
            {applications.map((app) => (
              <div
                key={app.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  borderRadius: '8px',
                  background: 'var(--surface-muted, #f8f8f8)',
                  border: '1px solid var(--border, #e5e5e5)',
                }}
              >
                <div>
                  <strong style={{ fontSize: '1rem' }}>{app.job.title}</strong>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--muted, #666)' }}>
                    {app.job.company} · {app.job.location || 'Remote'} · Applied on{' '}
                    {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={app.status === 'ACCEPTED' ? 'success' : 'neutral'}>
                  {app.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
