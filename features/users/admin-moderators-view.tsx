'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  RefreshCw,
  Send,
  Shield,
  Trash2,
  Users,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/dashboard/empty-state';
import { TableSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import {
  getModeratorInvitations,
  inviteModerator,
  resendModeratorInvitation,
  revokeModeratorInvitation,
  type ModeratorInvitation,
} from '@/lib/api/admin.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface AdminModeratorsViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function AdminModeratorsView({ currentRole, basePath }: AdminModeratorsViewProps) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);

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
      setActionNotice(`Invitation dispatched to ${res.data?.email || 'moderator'}.`);
      if (res.data?.invitationUrl) {
        setLastInviteUrl(res.data.invitationUrl);
      }
      setActionError(null);
      setTimeout(() => setActionNotice(null), 5000);
    },
    onError: (err: unknown) => {
      setActionError(err instanceof Error ? err.message : 'Failed to dispatch moderator invitation.');
    },
  });

  const resendMutation = useMutation({
    mutationFn: (id: string) => resendModeratorInvitation(accessToken, id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['moderator-invitations'] });
      setActionNotice('Invitation resent with a fresh 72-hour token.');
      if (res.data?.invitationUrl) {
        setLastInviteUrl(res.data.invitationUrl);
      }
      setTimeout(() => setActionNotice(null), 4000);
    },
    onError: (err: unknown) => {
      setActionError(err instanceof Error ? err.message : 'Failed to resend invitation.');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => revokeModeratorInvitation(accessToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderator-invitations'] });
      setActionNotice('Invitation token has been revoked.');
      setTimeout(() => setActionNotice(null), 4000);
    },
    onError: (err: unknown) => {
      setActionError(err instanceof Error ? err.message : 'Failed to revoke invitation.');
    },
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    if (!inviteEmail.trim()) {
      setActionError('Please provide a valid staff email address.');
      return;
    }
    inviteMutation.mutate(inviteEmail.trim().toLowerCase());
  };

  const invitations: ModeratorInvitation[] = invitationsQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="STAFF DELEGATION"
        title="Moderator Staff Governance"
        description="Appoint trusted faculty members and academic staff to oversee content standards and job postings."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => invitationsQuery.refetch()}
              disabled={invitationsQuery.isFetching}
            >
              <RefreshCw size={13} className={invitationsQuery.isFetching ? 'animate-spin' : ''} /> Refresh
            </Button>
            <Button size="sm" onClick={() => setShowInviteModal(true)}>
              <Plus size={14} /> Invite New Moderator
            </Button>
          </div>
        }
      />

      {actionNotice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      ) : null}

      {lastInviteUrl ? (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-3">
          <div className="truncate">
            <strong>Sandbox Setup Token URL: </strong>
            <a href={lastInviteUrl} target="_blank" rel="noreferrer" className="underline font-mono">
              {lastInviteUrl}
            </a>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setLastInviteUrl(null)}>
            Dismiss
          </Button>
        </div>
      ) : null}

      {/* Invitations Table */}
      {invitationsQuery.isLoading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : invitations.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No moderator staff appointed yet"
          description="Dispatch single-use 72-hour invitation tokens to faculty or departmental staff."
          action={
            <Button size="sm" onClick={() => setShowInviteModal(true)}>
              <Plus size={14} /> Invite First Moderator
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
          {invitations.map((inv) => {
            const isAccepted = Boolean(inv.acceptedAt);
            const isRevoked = Boolean(inv.revokedAt);
            const isExpired = !isAccepted && !isRevoked && new Date(inv.expiresAt) < new Date();
            const isPending = !isAccepted && !isRevoked && !isExpired;

            return (
              <div
                key={inv.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-slate-900 m-0">{inv.email}</h3>
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
                          ? 'Activated Staff'
                          : isRevoked
                          ? 'Revoked'
                          : isExpired
                          ? 'Token Expired'
                          : 'Pending (72h)'
                      }
                    />
                  </div>
                  <p className="text-xs text-slate-500 m-0">
                    Role: <strong className="text-slate-800">MODERATOR</strong> · Sent on {new Date(inv.createdAt).toLocaleString()}
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

      {/* Invite Modal */}
      {showInviteModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-full bg-purple-50 text-purple-700">
                <Shield size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">Invite Platform Moderator</h3>
                <p className="text-xs text-slate-500 m-0">Staff Delegation System</p>
              </div>
            </div>

            {actionError ? <FormAlert>{actionError}</FormAlert> : null}

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
                  <Send size={14} /> {inviteMutation.isPending ? 'Dispatching…' : 'Dispatch Invitation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
