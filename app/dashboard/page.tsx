'use client';

import { ArrowUpRight, CheckCircle2, Clock, Sparkles, UserCheck, XCircle } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const firstName = user?.name ? user.name.split(' ')[0] : 'Member';

  return (
    <section className="dashboard-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <p className="eyebrow">{user?.university?.name ? user.university.name.toUpperCase() : 'MEMBER DESK'}</p>
          <h1>Welcome back, {firstName}.</h1>
          <p className="lede">
            {user?.role === 'ALUMNI' ? 'Alumni Network Member' : 'Enrolled Student Member'} ·{' '}
            {user?.department || 'Department Member'}
          </p>
        </div>

        <div>
          {user?.verificationStatus === 'APPROVED' ? (
            <Badge variant="success">
              <CheckCircle2 size={13} style={{ marginRight: '4px' }} /> Verified Member
            </Badge>
          ) : user?.verificationStatus === 'REJECTED' ? (
            <Badge variant="neutral" style={{ color: '#dc2626', borderColor: '#fca5a5' }}>
              <XCircle size={13} style={{ marginRight: '4px' }} /> Needs Action
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
            {user?.verificationStatus === 'REJECTED' ? 'Verification Rejected' : 'Account Under University Review'}
          </strong>
          <p style={{ margin: '0.25rem 0 0.75rem', fontSize: '0.9rem' }}>
            {user?.verificationStatus === 'REJECTED'
              ? user.rejectionReason
                ? `Reason: ${user.rejectionReason}. Please update your academic credentials to resubmit.`
                : 'Your submission could not be verified. Please update your profile.'
              : 'Your alumni or student registration is currently in the institutional verification queue.'}
          </p>
          <Button asChild variant="secondary">
            <Link href="/dashboard/profile">Review & Edit Profile</Link>
          </Button>
        </div>
      ) : null}

      <div className="dashboard-stats" style={{ marginTop: '1.5rem' }}>
        <article>
          <UserCheck size={24} />
          <strong>{user?.verificationStatus === 'APPROVED' ? 'Active' : 'Pending'}</strong>
          <span>MEMBERSHIP STATUS</span>
        </article>
        <article>
          <Sparkles size={24} />
          <strong>{user?.department || 'Set'}</strong>
          <span>DEPARTMENT</span>
        </article>
        <article>
          <CheckCircle2 size={24} />
          <strong>{user?.batch || 'Set'}</strong>
          <span>CLASS / BATCH</span>
        </article>
      </div>

      <div className="dashboard-split" style={{ marginTop: '2rem' }}>
        <section>
          <div className="section-heading">
            <div>
              <p className="eyebrow">COMMUNITY DIRECTORY</p>
              <h2>Explore your verified network.</h2>
            </div>
            <Link href="/alumni" className="text-link">
              Directory <ArrowUpRight size={16} />
            </Link>
          </div>
          <p style={{ color: 'var(--muted, #666)', lineHeight: 1.6 }}>
            Browse fellow graduates, discover mentors across tech and corporate industries, and
            expand your professional horizon.
          </p>
          <Button asChild style={{ marginTop: '1rem' }}>
            <Link href="/alumni">Browse Alumni Directory</Link>
          </Button>
        </section>

        <aside className="dashboard-note">
          <p className="eyebrow">YOUR PROFILE</p>
          <h2>Keep your details current.</h2>
          <p>
            Make sure your student ID, skills, and current company are up to date so your alumni network
            can find and connect with you.
          </p>
          <Button asChild variant="secondary" style={{ marginTop: '0.75rem' }}>
            <Link href="/dashboard/profile">Manage Profile</Link>
          </Button>
        </aside>
      </div>
    </section>
  );
}
