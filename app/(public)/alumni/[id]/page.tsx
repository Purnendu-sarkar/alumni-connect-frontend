'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  Building2,
  CheckCircle2,
  ExternalLink,
  Globe,
  GraduationCap,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAlumniById, sendConnectionRequest } from '@/lib/api/user.api';
import { useAuthStore } from '@/store/auth-store';

export default function AlumniProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const [showMessageBox, setShowMessageBox] = useState(false);
  const [connectMessage, setConnectMessage] = useState('');
  const [connectSuccess, setConnectSuccess] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['alumnus', id, accessToken],
    queryFn: () => getAlumniById(accessToken, id as string),
    enabled: Boolean(id),
  });

  const connectMutation = useMutation({
    mutationFn: () =>
      sendConnectionRequest(accessToken, {
        recipientId: id as string,
        message: connectMessage.trim() || undefined,
      }),
    onSuccess: () => {
      setConnectSuccess(true);
      setShowMessageBox(false);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to send connection request.';
      setConnectError(msg);
    },
  });

  if (query.isLoading) {
    return (
      <section className="page-shell profile-page">
        <Link href="/alumni" className="back-link">
          <ArrowLeft size={16} /> Back to directory
        </Link>
        <p className="empty-state">Loading profile details...</p>
      </section>
    );
  }

  if (query.isError || !query.data?.data) {
    return (
      <section className="page-shell profile-page">
        <Link href="/alumni" className="back-link">
          <ArrowLeft size={16} /> Back to directory
        </Link>
        <div className="dashboard-note" style={{ borderLeft: '4px solid #ef4444' }}>
          <h2>Alumni profile not found</h2>
          <p>
            This member profile either does not exist, has not been verified yet, or is not in your
            university network.
          </p>
          <Button asChild variant="secondary" style={{ marginTop: '1rem' }}>
            <Link href="/alumni">Browse Alumni Directory</Link>
          </Button>
        </div>
      </section>
    );
  }

  const alumnus = query.data.data;
  const isSelf = user?.id === alumnus.id;

  return (
    <section className="page-shell profile-page">
      <Link href="/alumni" className="back-link">
        <ArrowLeft size={16} /> Back to directory
      </Link>

      <div className="profile-hero">
        <Avatar name={alumnus.name} src={alumnus.avatarUrl} className="avatar--xl" />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Badge variant={alumnus.verified ? 'success' : 'neutral'}>
              <UserCheck size={14} style={{ marginRight: '4px' }} />
              {alumnus.verified ? 'Verified Alumnus' : 'Pending Verification'}
            </Badge>
            {alumnus.employmentStatus ? (
              <Badge variant="neutral">{alumnus.employmentStatus}</Badge>
            ) : null}
          </div>

          <h1 style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>{alumnus.name}</h1>

          {alumnus.headline ? (
            <p style={{ fontWeight: 600, color: 'var(--foreground, #111)', marginBottom: '0.5rem' }}>
              {alumnus.headline}
            </p>
          ) : null}

          <p className="profile-hero__role">
            {alumnus.position || 'Graduate'} {alumnus.currentCompany ? `· ${alumnus.currentCompany}` : ''}
          </p>

          {alumnus.location ? (
            <p style={{ fontSize: '0.9rem', color: 'var(--muted, #666)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
              <MapPin size={15} /> {alumnus.location}
            </p>
          ) : null}

          {alumnus.bio ? <p style={{ marginTop: '0.75rem', lineHeight: 1.6 }}>{alumnus.bio}</p> : null}
        </div>

        {/* Action Button */}
        <div>
          {isSelf ? (
            <Button asChild variant="secondary">
              <Link href="/dashboard/profile">Edit your profile</Link>
            </Button>
          ) : !user ? (
            <Button asChild>
              <Link href={`/login?redirect=/alumni/${alumnus.id}`}>
                Sign in to connect <ArrowUpRight size={17} />
              </Link>
            </Button>
          ) : connectSuccess ? (
            <Button disabled variant="secondary" style={{ color: '#16a34a' }}>
              <CheckCircle2 size={16} /> Request sent
            </Button>
          ) : (
            <div>
              <Button onClick={() => setShowMessageBox(!showMessageBox)}>
                <MessageSquare size={16} /> Connect with {alumnus.name.split(' ')[0]}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Connection Message Form */}
      {showMessageBox && !connectSuccess ? (
        <div
          className="dashboard-note"
          style={{
            maxWidth: '600px',
            marginTop: '1.5rem',
            border: '2px solid var(--accent, #111)',
          }}
        >
          <p className="eyebrow">MAKE AN INTRODUCTION</p>
          <h2>Send a connection request to {alumnus.name}</h2>
          <p>Tell them why you would like to connect or what career advice you are seeking.</p>

          <textarea
            value={connectMessage}
            onChange={(e) => setConnectMessage(e.target.value)}
            placeholder="e.g. Hi Sadia, I'm a fellow CSE student at NWU interested in product design. Would love to connect and follow your work."
            rows={4}
            className="field__input"
            style={{ width: '100%', marginTop: '0.75rem', resize: 'vertical' }}
          />

          {connectError ? (
            <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              {connectError}
            </p>
          ) : null}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <Button
              onClick={() => connectMutation.mutate()}
              disabled={connectMutation.isPending}
            >
              <Send size={15} /> {connectMutation.isPending ? 'Sending...' : 'Send Request'}
            </Button>
            <Button variant="ghost" onClick={() => setShowMessageBox(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <div className="profile-grid" style={{ marginTop: '2rem' }}>
        <article>
          <p className="eyebrow">ACADEMIC BACKGROUND</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
            <GraduationCap size={18} />
            <strong>Department:</strong> {alumnus.department || 'Not specified'}
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
            <Building2 size={18} />
            <strong>Batch / Passing Year:</strong> {alumnus.batch || alumnus.graduationYear || 'Not specified'}
          </p>
        </article>

        <article>
          <p className="eyebrow">PROFESSIONAL FOCUS</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
            <Briefcase size={18} />
            <strong>Current Role:</strong> {alumnus.position || 'Open to opportunities'}
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
            <Building2 size={18} />
            <strong>Company:</strong> {alumnus.currentCompany || 'Independent / Exploring'}
          </p>
        </article>
      </div>

      {alumnus.skills && alumnus.skills.length > 0 ? (
        <article style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--surface-muted, #f8f8f8)', borderRadius: 'var(--radius, 8px)' }}>
          <p className="eyebrow">AREAS OF EXPERTISE & SKILLS</p>
          <div className="tag-list" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            {alumnus.skills.map((skill) => (
              <span key={skill} className="filter-chip" style={{ cursor: 'default' }}>
                {skill}
              </span>
            ))}
          </div>
        </article>
      ) : null}

      {/* Social & Contact Links */}
      {(alumnus.linkedinUrl || alumnus.websiteUrl || alumnus.githubUrl || alumnus.phone) ? (
        <article style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--surface-muted, #f8f8f8)', borderRadius: 'var(--radius, 8px)' }}>
          <p className="eyebrow">LINKS & CONTACT</p>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            {alumnus.linkedinUrl ? (
              <a
                href={alumnus.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent, #111)', fontWeight: 500 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28Z" />
                </svg> LinkedIn <ExternalLink size={13} />
              </a>
            ) : null}

            {alumnus.websiteUrl ? (
              <a
                href={alumnus.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent, #111)', fontWeight: 500 }}
              >
                <Globe size={17} /> Website / Portfolio <ExternalLink size={13} />
              </a>
            ) : null}

            {alumnus.phone ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--foreground, #111)' }}>
                <Phone size={17} /> {alumnus.phone}
              </span>
            ) : null}
          </div>
        </article>
      ) : null}
    </section>
  );
}
