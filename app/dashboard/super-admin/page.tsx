'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  Layers,
  Plus,
  RefreshCw,
  Send,
  Shield,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import {
  getAdminStats,
  getModeratorInvitations,
  inviteModerator,
  resendModeratorInvitation,
  revokeModeratorInvitation,
  type ModeratorInvitation,
} from '@/lib/api/admin.api';
import { useAuthStore } from '@/store/auth-store';

export default function SuperAdminDashboardPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const firstName = user?.name ? user.name.split(' ')[0] : 'Administrator';

  // Moderator invitation modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);

  const statsQuery = useQuery({
    queryKey: ['admin-stats', accessToken],
    queryFn: () => getAdminStats(accessToken),
    enabled: Boolean(accessToken),
  });

  const invitationsQuery = useQuery({
    queryKey: ['moderator-invitations', accessToken],
    queryFn: () => getModeratorInvitations(accessToken),
    enabled: Boolean(accessToken),
  });

  const inviteMutation = useMutation({
    mutationFn: (email: string) => inviteModerator(accessToken, email),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['moderator-invitations'] });
      setShowInviteModal(false);
      setInviteEmail('');
      setActionSuccess(`Invitation sent to ${res.data?.email || 'moderator'}.`);
      if (res.data?.invitationUrl) {
        setLastInviteUrl(res.data.invitationUrl);
      }
      setActionError(null);
    },
    onError: (err: unknown) => {
      setActionError(err instanceof Error ? err.message : 'Failed to dispatch moderator invitation.');
    },
  });

  const resendMutation = useMutation({
    mutationFn: (id: string) => resendModeratorInvitation(accessToken, id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['moderator-invitations'] });
      setActionSuccess('Invitation resent successfully.');
      if (res.data?.invitationUrl) {
        setLastInviteUrl(res.data.invitationUrl);
      }
      setActionError(null);
    },
    onError: (err: unknown) => {
      setActionError(err instanceof Error ? err.message : 'Failed to resend invitation.');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => revokeModeratorInvitation(accessToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderator-invitations'] });
      setActionSuccess('Invitation revoked successfully.');
      setActionError(null);
    },
    onError: (err: unknown) => {
      setActionError(err instanceof Error ? err.message : 'Failed to revoke invitation.');
    },
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    if (!inviteEmail.trim()) {
      setActionError('Please provide an email address.');
      return;
    }
    inviteMutation.mutate(inviteEmail.trim().toLowerCase());
  };

  const stats = statsQuery.data?.data;
  const invitations: ModeratorInvitation[] = invitationsQuery.data?.data ?? [];

  return (
    <section className="dashboard-page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <p className="eyebrow">ROOT PLATFORM ADMINISTRATION</p>
          <h1>Super Admin Console — {firstName}.</h1>
          <p className="lede">
            Campus Platform Oversight · Moderator management, alumni verification, and security governance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Badge variant="neutral" style={{ backgroundColor: '#ede9fe', color: '#6d28d9', borderColor: '#ddd6fe' }}>
            <Layers size={14} style={{ marginRight: '4px' }} /> Super Admin
          </Badge>
          <Button
            variant="secondary"
            onClick={() => {
              statsQuery.refetch();
              invitationsQuery.refetch();
            }}
            disabled={statsQuery.isFetching || invitationsQuery.isFetching}
          >
            <RefreshCw size={14} className={statsQuery.isFetching ? 'animate-spin' : ''} /> Refresh Console
          </Button>
        </div>
      </div>

      {actionSuccess ? (
        <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {actionSuccess}
        </div>
      ) : null}

      {lastInviteUrl ? (
        <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '6px', fontSize: '0.85rem' }}>
          <strong>Development Setup Link: </strong>
          <a href={lastInviteUrl} style={{ color: '#b45309', textDecoration: 'underline' }}>
            {lastInviteUrl}
          </a>
        </div>
      ) : null}

      {actionError ? (
        <div style={{ marginTop: '1.25rem' }}>
          <FormAlert>{actionError}</FormAlert>
        </div>
      ) : null}

      {/* Platform Stats */}
      <div className="dashboard-stats" style={{ marginTop: '1.5rem' }}>
        <article>
          <Users size={24} style={{ color: '#2563eb' }} />
          <strong>{stats?.totalUsers ?? '…'}</strong>
          <span>TOTAL COMMUNITY MEMBERS</span>
        </article>
        <article>
          <Clock size={24} style={{ color: '#d97706' }} />
          <strong>{stats?.pendingVerifications ?? '…'}</strong>
          <span>ALUMNI ACCREDITATIONS PENDING</span>
        </article>
        <article>
          <BriefcaseBusiness size={24} style={{ color: '#16a34a' }} />
          <strong>{stats?.totalJobs ?? '…'}</strong>
          <span>CAREER OPPORTUNITIES</span>
        </article>
        <article>
          <Shield size={24} style={{ color: '#7c3aed' }} />
          <strong>{invitations.filter((i) => !i.acceptedAt && !i.revokedAt).length}</strong>
          <span>PENDING MODERATOR INVITES</span>
        </article>
      </div>

      {/* Quick Governance Links */}
      <div className="dashboard-split" style={{ marginTop: '2rem' }}>
        <section>
          <div className="section-heading">
            <div>
              <p className="eyebrow">ADMINISTRATIVE QUEUES</p>
              <h2>Platform Operations & Review</h2>
            </div>
          </div>
          <p style={{ color: 'var(--muted, #666)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Direct access to core administrative queues. Review alumni accreditation requests, monitor job postings, and inspect immutable system audit logs.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <Button asChild>
              <Link href="/admin/verification">Alumni Verifications <ArrowUpRight size={14} /></Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/dashboard/moderator">Job Moderation Desk <ArrowUpRight size={14} /></Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/dashboard/admin/audit-logs">Security Audit Logs <ArrowUpRight size={14} /></Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/alumni">Campus Directory</Link>
            </Button>
          </div>
        </section>

        <aside className="dashboard-note">
          <p className="eyebrow">GOVERNANCE POLICY</p>
          <h2>Role Separation & Security</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted, #444)', lineHeight: 1.5 }}>
            • <strong>Super Admin:</strong> Full root privileges, user verification, moderator invitations, and security logs.<br />
            • <strong>Moderators:</strong> Review and approve job postings and content flags.<br />
            • <strong>Accredited Alumni:</strong> Verified by administration before gaining network access.<br />
            • <strong>Single University:</strong> Scoped strictly to the university campus community.
          </p>
        </aside>
      </div>

      {/* Invite Moderator Modal / Drawer */}
      {showInviteModal ? (
        <div
          className="dashboard-note"
          style={{
            marginTop: '2rem',
            padding: '1.75rem',
            borderRadius: '10px',
            border: '2px solid #7c3aed',
            background: 'var(--surface, #fff)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <p className="eyebrow" style={{ margin: 0, color: '#7c3aed' }}>MODERATOR APPOINTMENT</p>
              <h2 style={{ margin: '0.25rem 0 0' }}>Invite New Platform Moderator</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowInviteModal(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleInviteSubmit} style={{ display: 'grid', gap: '1rem' }}>
            <Input
              label="Staff / Faculty Email Address *"
              type="email"
              placeholder="e.g. faculty.staff@university.edu"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              hint="An invitation with a secure 72-hour single-use setup link will be dispatched to this address."
              required
            />

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button type="button" variant="ghost" onClick={() => setShowInviteModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={inviteMutation.isPending}>
                <Send size={16} /> {inviteMutation.isPending ? 'Sending Invitation…' : 'Dispatch Invitation'}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Moderator Invitations Table */}
      <div style={{ marginTop: '2.5rem' }}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">STAFF DELEGATION</p>
            <h2>Moderator Invitations ({invitations.length})</h2>
          </div>
          <Button onClick={() => setShowInviteModal(true)}>
            <Plus size={16} /> Invite Moderator
          </Button>
        </div>

        {invitationsQuery.isLoading ? (
          <p className="empty-state">Loading moderator invitations…</p>
        ) : invitations.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', border: '2px dashed var(--line, #ccc)' }}>
            <Shield size={32} style={{ margin: '0 auto 0.75rem', color: 'var(--muted)' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No moderator invitations yet.</p>
            <p style={{ margin: '0.25rem 0 1rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
              Invite faculty members or trusted staff to assist with campus job and content moderation.
            </p>
            <Button size="sm" onClick={() => setShowInviteModal(true)}>
              <Plus size={14} /> Invite First Moderator
            </Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
            {invitations.map((inv) => {
              const isAccepted = Boolean(inv.acceptedAt);
              const isRevoked = Boolean(inv.revokedAt);
              const isExpired = !isAccepted && !isRevoked && new Date(inv.expiresAt) < new Date();
              const isPending = !isAccepted && !isRevoked && !isExpired;

              return (
                <div
                  key={inv.id}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '1.05rem' }}>{inv.email}</strong>
                      <Badge
                        variant={
                          isAccepted
                            ? 'success'
                            : isRevoked
                            ? 'error'
                            : isExpired
                            ? 'neutral'
                            : 'neutral'
                        }
                      >
                        {isAccepted
                          ? 'Activated'
                          : isRevoked
                          ? 'Revoked'
                          : isExpired
                          ? 'Expired'
                          : 'Pending (72h)'}
                      </Badge>
                    </div>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--muted, #666)' }}>
                      Role: <code>{inv.role}</code> · Sent: {new Date(inv.createdAt).toLocaleString()} · Expires:{' '}
                      {new Date(inv.expiresAt).toLocaleString()}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isPending ? (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => resendMutation.mutate(inv.id)}
                          disabled={resendMutation.isPending}
                        >
                          <Send size={13} style={{ marginRight: '4px' }} /> Resend
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revokeMutation.mutate(inv.id)}
                          disabled={revokeMutation.isPending}
                          style={{ color: '#dc2626' }}
                        >
                          <Trash2 size={13} style={{ marginRight: '4px' }} /> Revoke
                        </Button>
                      </>
                    ) : isExpired ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => resendMutation.mutate(inv.id)}
                        disabled={resendMutation.isPending}
                      >
                        <RefreshCw size={13} style={{ marginRight: '4px' }} /> Re-invite
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
