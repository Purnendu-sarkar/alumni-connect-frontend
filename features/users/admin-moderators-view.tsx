'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Ban,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  Plus,
  RefreshCw,
  Send,
  Shield,
  ShieldAlert,
  ShieldOff,
  Sparkles,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog';
import { EmptyState } from '@/components/dashboard/empty-state';
import { TableSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import {
  getAdminModerators,
  inviteModerator,
  removeAdminModerator,
  resendModeratorInvitation,
  revokeModeratorInvitation,
  toggleUserSuspension,
  type ModeratorInvitation,
  type ModeratorStaffItem,
} from '@/lib/api/admin.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface AdminModeratorsViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function AdminModeratorsView({ basePath }: AdminModeratorsViewProps) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFormError, setInviteFormError] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const [suspendTarget, setSuspendTarget] = useState<{
    mod: ModeratorStaffItem;
    nextIsActive: boolean;
  } | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  const [removeTarget, setRemoveTarget] = useState<ModeratorStaffItem | null>(null);
  const [removeReason, setRemoveReason] = useState('');

  useEffect(() => {
    if (!showInviteModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowInviteModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showInviteModal]);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  const overviewQuery = useQuery({
    queryKey: ['admin-moderators-overview', accessToken],
    queryFn: () => getAdminModerators(accessToken),
    enabled: Boolean(accessToken),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 15_000,
  });

  const inviteMutation = useMutation({
    mutationFn: (email: string) => inviteModerator(accessToken, email),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-moderators-overview'] });
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteFormError(null);
      const url = res.data?.setupUrl || res.data?.invitationUrl || null;
      if (url) {
        setLastInviteUrl(url);
        setCopiedUrl(false);
      }
      showFeedback(
        'success',
        `Invitation dispatched to ${res.data?.email || 'moderator'} with a 72-hour single-use setup token.`,
      );
    },
    onError: (err: unknown) => {
      setInviteFormError(
        err instanceof Error ? err.message : 'Failed to dispatch moderator invitation.',
      );
    },
  });

  const resendMutation = useMutation({
    mutationFn: (id: string) => resendModeratorInvitation(accessToken, id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-moderators-overview'] });
      const url = res.data?.setupUrl || res.data?.invitationUrl || null;
      if (url) {
        setLastInviteUrl(url);
        setCopiedUrl(false);
      }
      showFeedback('success', 'Invitation resent with a fresh 72-hour token.');
    },
    onError: (err: unknown) => {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to resend invitation.');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => revokeModeratorInvitation(accessToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-moderators-overview'] });
      showFeedback('success', 'Invitation token has been revoked.');
    },
    onError: (err: unknown) => {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to revoke invitation.');
    },
  });

  const suspendMutation = useMutation({
    mutationFn: ({
      userId,
      isActive,
      reason,
    }: {
      userId: string;
      isActive: boolean;
      reason?: string;
    }) => toggleUserSuspension(accessToken, userId, isActive, reason),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-moderators-overview'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-roles-overview'] });
      setSuspendTarget(null);
      setSuspendReason('');
      showFeedback(
        'success',
        vars.isActive
          ? 'Moderator account restored to active standing.'
          : 'Moderator account suspended and active sessions revoked.',
      );
    },
    onError: (err: unknown) => {
      showFeedback(
        'error',
        err instanceof Error ? err.message : 'Failed to update moderator status.',
      );
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      removeAdminModerator(accessToken, userId, reason),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-moderators-overview'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setRemoveTarget(null);
      setRemoveReason('');
      const releasedJobs = res.data?.releasedJobsCount ?? 0;
      const releasedStories = res.data?.releasedStoriesCount ?? 0;
      showFeedback(
        'success',
        `Moderator deactivated. Released ${releasedJobs} claimed job(s) and ${releasedStories} claimed story/stories back to the review queue.`,
      );
    },
    onError: (err: unknown) => {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to remove moderator.');
    },
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteFormError(null);
    if (!inviteEmail.trim()) {
      setInviteFormError('Please provide a valid staff email address.');
      return;
    }
    inviteMutation.mutate(inviteEmail.trim().toLowerCase());
  };

  const handleCopyInviteUrl = async () => {
    if (!lastInviteUrl) return;
    try {
      await navigator.clipboard.writeText(lastInviteUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      showFeedback('error', 'Unable to copy to clipboard. Copy the link manually.');
    }
  };

  const moderators: ModeratorStaffItem[] = overviewQuery.data?.data?.moderators ?? [];
  const invitations: ModeratorInvitation[] = overviewQuery.data?.data?.invitations ?? [];

  const isSuspendReasonValid = suspendTarget?.nextIsActive
    ? true
    : suspendReason.trim().length >= 10;
  const isRemoveReasonValid = removeReason.trim().length >= 10;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="STAFF DELEGATION"
        title="Moderator Staff Governance"
        description="Oversee active faculty and campus moderators, inspect 30-day review throughput, revoke staff privileges, and dispatch single-use invitations."
        badge={
          <Badge variant="neutral">
            {moderators.filter((m) => m.isActive).length} active · {invitations.length} invitation
            {invitations.length === 1 ? '' : 's'}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync Active
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => overviewQuery.refetch()}
              disabled={overviewQuery.isFetching}
            >
              <RefreshCw size={13} className={overviewQuery.isFetching ? 'animate-spin' : ''} />{' '}
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setInviteFormError(null);
                setShowInviteModal(true);
              }}
            >
              <Plus size={14} /> Invite New Moderator
            </Button>
          </div>
        }
      />

      {feedback ? (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            feedback.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          {feedback.type === 'error' ? (
            <ShieldAlert size={16} className="text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      ) : null}

      {lastInviteUrl ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <strong className="block mb-0.5">Moderator Setup Token URL (72h single-use):</strong>
            <a
              href={lastInviteUrl}
              target="_blank"
              rel="noreferrer"
              className="underline font-mono break-all text-amber-900"
            >
              {lastInviteUrl}
            </a>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="secondary" onClick={handleCopyInviteUrl}>
              {copiedUrl ? <Check size={13} /> : <Copy size={13} />}{' '}
              {copiedUrl ? 'Copied' : 'Copy Link'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setLastInviteUrl(null)}>
              Dismiss
            </Button>
          </div>
        </div>
      ) : null}

      {/* Error State */}
      {overviewQuery.isError ? (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-rose-950 m-0">Unable to load moderator roster</p>
              <p className="text-rose-700 m-0 mt-0.5">
                {overviewQuery.error instanceof Error
                  ? overviewQuery.error.message
                  : 'An error occurred while fetching active moderators and invitations.'}
              </p>
            </div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => overviewQuery.refetch()}>
            <RefreshCw size={13} /> Retry
          </Button>
        </div>
      ) : overviewQuery.isLoading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : (
        <>
          {/* Section 1: Active Moderator Staff */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 m-0">Active Moderator Staff</h2>
                <p className="text-xs text-slate-500 m-0">
                  Appointed faculty and editorial reviewers currently provisioned with moderation
                  permissions.
                </p>
              </div>
              <Badge variant="neutral">{moderators.length} staff</Badge>
            </div>

            {moderators.length === 0 ? (
              <EmptyState
                icon={Shield}
                title="No moderator accounts provisioned yet"
                description="Once invited staff complete account setup, their moderation throughput and controls appear here."
                action={
                  <Button size="sm" onClick={() => setShowInviteModal(true)}>
                    <Plus size={14} /> Invite First Moderator
                  </Button>
                }
              />
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
                {moderators.map((mod) => {
                  const stats = mod.stats ?? mod.activityStats ?? {
                    jobsReviewed30d: 0,
                    storiesReviewed30d: 0,
                    activeClaimedJobs: 0,
                    activeClaimedStories: 0,
                  };
                  const totalClaimed =
                    stats.activeClaimedJobs + stats.activeClaimedStories;

                  return (
                    <div
                      key={mod.id}
                      className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar name={mod.name} src={mod.avatarUrl} />
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              href={`${basePath}/users/${mod.id}`}
                              className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors"
                            >
                              {mod.name}
                            </Link>
                            <StatusBadge status="MODERATOR" />
                            {mod.isActive ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 size={11} /> Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                <Ban size={11} /> Inactive / Suspended
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 m-0">
                            {mod.email}
                            {mod.department ? ` · ${mod.department}` : ''} · Appointed{' '}
                            {new Date(mod.createdAt).toLocaleDateString()}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 text-[11px]">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                              <BriefcaseBusiness size={11} className="text-blue-600" />{' '}
                              {stats.jobsReviewed30d} jobs reviewed (30d)
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                              <Sparkles size={11} className="text-purple-600" />{' '}
                              {stats.storiesReviewed30d} stories reviewed (30d)
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold ${
                                totalClaimed > 0
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {stats.activeClaimedJobs} claimed jobs ·{' '}
                              {stats.activeClaimedStories} claimed stories
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap shrink-0 self-end lg:self-center">
                        <Button size="sm" variant="secondary" asChild>
                          <Link href={`${basePath}/users/${mod.id}`}>
                            <Eye size={13} /> View Profile
                          </Link>
                        </Button>

                        {mod.isActive ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSuspendTarget({ mod, nextIsActive: false });
                                setSuspendReason('');
                              }}
                              className="text-amber-700 hover:bg-amber-50"
                            >
                              <Ban size={13} /> Suspend
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setRemoveTarget(mod);
                                setRemoveReason('');
                              }}
                              className="text-rose-600 hover:bg-rose-50"
                            >
                              <ShieldOff size={13} /> Remove Moderator
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSuspendTarget({ mod, nextIsActive: true });
                              setSuspendReason('');
                            }}
                            className="text-emerald-700 hover:bg-emerald-50"
                          >
                            <UserCheck size={13} /> Restore
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section 2: Moderator Invitations */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 m-0">Moderator Invitations</h2>
                <p className="text-xs text-slate-500 m-0">
                  Track pending 72-hour staff invitations, resend expired links, or revoke unused
                  tokens.
                </p>
              </div>
              <Badge variant="neutral">{invitations.length} total</Badge>
            </div>

            {invitations.length === 0 ? (
              <EmptyState
                icon={Send}
                title="No moderator invitations sent"
                description="Dispatch single-use 72-hour invitation tokens to appoint faculty or departmental reviewers."
              />
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
                {invitations.map((inv) => {
                  const isAccepted = Boolean(inv.acceptedAt);
                  const isRevoked = Boolean(inv.revokedAt);
                  const isExpired =
                    !isAccepted && !isRevoked && new Date(inv.expiresAt) < new Date();
                  const isPending = !isAccepted && !isRevoked && !isExpired;

                  return (
                    <div
                      key={inv.id}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-900 m-0">{inv.email}</h3>
                          <StatusBadge
                            status={
                              isAccepted
                                ? 'APPROVED'
                                : isRevoked
                                  ? 'REJECTED'
                                  : isExpired
                                    ? 'SUSPENDED'
                                    : 'PENDING'
                            }
                            label={
                              isAccepted
                                ? 'Accepted'
                                : isRevoked
                                  ? 'Revoked'
                                  : isExpired
                                    ? 'Token Expired'
                                    : 'Pending (72h)'
                            }
                          />
                        </div>
                        <p className="text-xs text-slate-500 m-0">
                          Role: <strong className="text-slate-800">MODERATOR</strong> · Sent{' '}
                          {new Date(inv.createdAt).toLocaleString()}
                          {inv.invitedBy ? ` by ${inv.invitedBy.name}` : ''}
                        </p>
                        <p className="text-[11px] text-slate-400 m-0 mt-0.5">
                          Token Expires: {new Date(inv.expiresAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        {isPending ? (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => resendMutation.mutate(inv.id)}
                              disabled={resendMutation.isPending}
                            >
                              <Send size={13} /> Resend Token
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => revokeMutation.mutate(inv.id)}
                              disabled={revokeMutation.isPending}
                              className="text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 size={13} /> Revoke
                            </Button>
                          </>
                        ) : isExpired ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => resendMutation.mutate(inv.id)}
                            disabled={resendMutation.isPending}
                          >
                            <RefreshCw size={13} /> Re-invite Staff
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* Invite Modal */}
      {showInviteModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-moderator-modal-title"
        >
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              aria-label="Close invite modal"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-full bg-purple-50 text-purple-700">
                <Shield size={22} />
              </div>
              <div>
                <h3
                  id="invite-moderator-modal-title"
                  className="text-base font-bold text-slate-900 m-0"
                >
                  Invite Platform Moderator
                </h3>
                <p className="text-xs text-slate-500 m-0">Staff Delegation System</p>
              </div>
            </div>

            {inviteFormError ? <FormAlert>{inviteFormError}</FormAlert> : null}

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <Input
                label="Staff Email Address *"
                type="email"
                placeholder="faculty.member@university.edu"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                hint="An email with a secure 72-hour single-use setup link will be dispatched."
                required
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={inviteMutation.isPending}>
                  <Send size={14} />{' '}
                  {inviteMutation.isPending ? 'Dispatching…' : 'Dispatch Invitation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Suspend / Restore Moderator Dialog */}
      {suspendTarget ? (
        <ConfirmDialog
          isOpen={Boolean(suspendTarget)}
          onClose={() => {
            setSuspendTarget(null);
            setSuspendReason('');
          }}
          onConfirm={() => {
            if (!isSuspendReasonValid) return;
            suspendMutation.mutate({
              userId: suspendTarget.mod.id,
              isActive: suspendTarget.nextIsActive,
              reason: suspendTarget.nextIsActive ? undefined : suspendReason.trim(),
            });
          }}
          title={`${suspendTarget.nextIsActive ? 'Restore' : 'Suspend'} Moderator: ${suspendTarget.mod.name}`}
          description={
            suspendTarget.nextIsActive
              ? `Restore active moderator login access for ${suspendTarget.mod.email}.`
              : `Suspending will immediately revoke all active sessions for ${suspendTarget.mod.email}.`
          }
          confirmLabel={suspendTarget.nextIsActive ? 'Restore Moderator' : 'Suspend Moderator'}
          variant={suspendTarget.nextIsActive ? 'primary' : 'destructive'}
          isLoading={suspendMutation.isPending}
          confirmDisabled={!isSuspendReasonValid}
        >
          {!suspendTarget.nextIsActive ? (
            <div className="mt-3 space-y-1.5 text-left">
              <label
                htmlFor="mod-suspend-reason"
                className="block text-xs font-bold text-slate-700"
              >
                Mandatory Reason for Suspension (minimum 10 characters) *
              </label>
              <textarea
                id="mod-suspend-reason"
                rows={3}
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g. Temporary leave of absence from moderation committee."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:bg-white"
              />
              <p
                className={`text-[11px] m-0 ${
                  isSuspendReasonValid ? 'text-emerald-600' : 'text-slate-500'
                }`}
              >
                {suspendReason.trim().length}/10 minimum characters
              </p>
            </div>
          ) : null}
        </ConfirmDialog>
      ) : null}

      {/* Remove Moderator Dialog */}
      {removeTarget ? (
        <ConfirmDialog
          isOpen={Boolean(removeTarget)}
          onClose={() => {
            setRemoveTarget(null);
            setRemoveReason('');
          }}
          onConfirm={() => {
            if (!isRemoveReasonValid) return;
            removeMutation.mutate({
              userId: removeTarget.id,
              reason: removeReason.trim(),
            });
          }}
          title={`Remove Moderator: ${removeTarget.name}`}
          description={`Removing ${removeTarget.email} will deactivate their moderator account, terminate all active sessions, and automatically release ${removeTarget.stats?.activeClaimedJobs ?? removeTarget.activityStats?.activeClaimedJobs ?? 0} claimed job(s) and ${removeTarget.stats?.activeClaimedStories ?? removeTarget.activityStats?.activeClaimedStories ?? 0} claimed story/stories back to the SUBMITTED moderation queue.`}
          confirmLabel="Remove Moderator & Release Claims"
          variant="destructive"
          isLoading={removeMutation.isPending}
          confirmDisabled={!isRemoveReasonValid}
        >
          <div className="mt-3 space-y-1.5 text-left">
            <label htmlFor="mod-remove-reason" className="block text-xs font-bold text-slate-700">
              Mandatory Audit Reason (minimum 10 characters) *
            </label>
            <textarea
              id="mod-remove-reason"
              rows={3}
              value={removeReason}
              onChange={(e) => setRemoveReason(e.target.value)}
              placeholder="e.g. Faculty member completed moderation committee term and transitioned departments."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:bg-white"
            />
            <p
              className={`text-[11px] m-0 ${
                isRemoveReasonValid ? 'text-emerald-600' : 'text-slate-500'
              }`}
            >
              {removeReason.trim().length}/10 minimum characters
            </p>
          </div>
        </ConfirmDialog>
      ) : null}
    </div>
  );
}
