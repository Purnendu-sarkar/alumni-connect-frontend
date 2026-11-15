'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Ban,
  Check,
  CheckCircle2,
  Clock,
  Handshake,
  Mail,
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  ShieldAlert,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { CardGridSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { useDebounce } from '@/hooks/use-debounce';
import {
  blockUser,
  cancelConnection,
  getConnections,
  removeConnection,
  respondConnection,
  unblockUser,
  type ConnectionRecord,
} from '@/lib/api/connection.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface ConnectionsViewProps {
  currentRole: UserRole;
  basePath: string;
  initialTab?: 'connected' | 'received' | 'sent' | 'blocked';
}

export function ConnectionsView({
  currentRole,
  basePath,
  initialTab = 'connected',
}: ConnectionsViewProps) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentUser = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<'connected' | 'received' | 'sent' | 'blocked'>(initialTab);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);

  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modals
  const [removeTarget, setRemoveTarget] = useState<{ id: string; name: string } | null>(null);
  const [blockTarget, setBlockTarget] = useState<{ id: string; name: string } | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [unblockTarget, setUnblockTarget] = useState<{ id: string; name: string } | null>(null);
  const [cancelTarget, setCancelTarget] = useState<{ id: string; name: string } | null>(null);

  // Real backend query for connections based on activeTab
  const connectionsQuery = useQuery({
    queryKey: ['connections', activeTab, debouncedSearch, page, accessToken],
    queryFn: async () => {
      const res = await getConnections(accessToken, {
        tab: activeTab,
        q: debouncedSearch || undefined,
        page,
        limit: 20,
      });
      return res;
    },
    enabled: Boolean(accessToken),
  });

  const items = connectionsQuery.data?.data ?? [];
  const meta = connectionsQuery.data?.meta;

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setActionError(null);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Mutations
  const acceptMutation = useMutation({
    mutationFn: (connectionId: string) => respondConnection(accessToken, connectionId, 'ACCEPTED'),
    onSuccess: (_, connectionId) => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['directory'] });
      showNotification('Connection invitation accepted!');
    },
    onError: (err: any) => {
      setActionError(err?.message || 'Failed to accept connection request.');
    },
  });

  const declineMutation = useMutation({
    mutationFn: (connectionId: string) => respondConnection(accessToken, connectionId, 'REJECTED'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['directory'] });
      showNotification('Connection invitation declined.');
    },
    onError: (err: any) => {
      setActionError(err?.message || 'Failed to decline connection request.');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (connectionId: string) => cancelConnection(accessToken, connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['directory'] });
      setCancelTarget(null);
      showNotification('Sent connection request cancelled.');
    },
    onError: (err: any) => {
      setActionError(err?.message || 'Failed to cancel request.');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (connectionId: string) => removeConnection(accessToken, connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['directory'] });
      setRemoveTarget(null);
      showNotification('Connection removed from your network.');
    },
    onError: (err: any) => {
      setActionError(err?.message || 'Failed to remove connection.');
    },
  });

  const blockMutation = useMutation({
    mutationFn: (blockedId: string) =>
      blockUser(accessToken, {
        blockedId,
        reason: blockReason.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['directory'] });
      setBlockTarget(null);
      setBlockReason('');
      showNotification('Member blocked. Connections and interaction severed.');
    },
    onError: (err: any) => {
      setActionError(err?.message || 'Failed to block member.');
    },
  });

  const unblockMutation = useMutation({
    mutationFn: (userId: string) => unblockUser(accessToken, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['directory'] });
      setUnblockTarget(null);
      showNotification('Member unblocked successfully.');
    },
    onError: (err: any) => {
      setActionError(err?.message || 'Failed to unblock member.');
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="ACADEMIC & PROFESSIONAL RELATIONSHIPS"
        title="Network Connections"
        description="Build relationships across graduating cohorts, seek career guidance, and collaborate on shared initiatives."
        actions={
          <Button asChild size="sm">
            <Link href={`${basePath}/directory`}>
              <Plus size={14} /> Find New Connections
            </Link>
          </Button>
        }
      />

      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2 animate-in fade-in">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setActiveTab('connected');
            setPage(1);
          }}
          className={`flex items-center gap-2 pb-3 transition-all border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'connected'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck size={16} /> Active Connections
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('received');
            setPage(1);
          }}
          className={`flex items-center gap-2 pb-3 transition-all border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'received'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock size={16} /> Received Inquiries
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('sent');
            setPage(1);
          }}
          className={`flex items-center gap-2 pb-3 transition-all border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'sent'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send size={16} /> Sent Requests
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('blocked');
            setPage(1);
          }}
          className={`flex items-center gap-2 pb-3 transition-all border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'blocked'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Ban size={16} /> Blocked Members
        </button>
      </div>

      {/* Search Bar for Connected tab */}
      {activeTab === 'connected' && (
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Search connections by name, company, or department…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Tab Content */}
      {connectionsQuery.isLoading ? (
        <CardGridSkeleton count={4} />
      ) : connectionsQuery.isError ? (
        <div className="p-8 text-center bg-white rounded-xl border border-rose-200 space-y-3">
          <AlertCircle size={32} className="mx-auto text-rose-500" />
          <h3 className="text-sm font-bold text-slate-900">Failed to load connection data</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {(connectionsQuery.error as any)?.message || 'An error occurred while fetching connections.'}
          </p>
          <Button size="sm" variant="secondary" onClick={() => connectionsQuery.refetch()}>
            <RefreshCw size={14} /> Retry
          </Button>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={activeTab === 'blocked' ? Ban : activeTab === 'received' ? CheckCircle2 : activeTab === 'sent' ? Send : Users}
          title={
            activeTab === 'connected'
              ? 'No active connections found'
              : activeTab === 'received'
              ? 'No pending invitations awaiting review'
              : activeTab === 'sent'
              ? 'No outstanding sent requests'
              : 'No blocked members'
          }
          description={
            activeTab === 'connected'
              ? 'Explore the member directory to discover classmates and departmental alumni.'
              : activeTab === 'received'
              ? 'You have reviewed all incoming connection invitations.'
              : activeTab === 'sent'
              ? 'You do not have any pending connection requests sent to other members.'
              : 'Members you choose to block will appear here.'
          }
          action={
            activeTab !== 'blocked' && activeTab !== 'received' ? (
              <Button size="sm" asChild>
                <Link href={`${basePath}/directory`}>Explore Directory</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Active Connected Cards */}
          {activeTab === 'connected' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((conn: ConnectionRecord) => {
                const partner = conn.requesterId === currentUser?.id ? conn.recipient : conn.requester;
                return (
                  <div
                    key={conn.id}
                    className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3">
                          <Avatar name={partner.name} src={partner.avatarUrl} />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 m-0">{partner.name}</h4>
                            <p className="text-xs text-slate-500 m-0 mt-0.5">
                              {partner.position || (partner.role?.name === 'ALUMNI' ? 'Alumni' : 'Student')}
                              {partner.currentCompany ? ` · ${partner.currentCompany}` : ''}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 m-0 mb-4">
                        {partner.department || 'Enrolled'} {partner.batch ? `(Batch ${partner.batch})` : ''} · Connected
                      </p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        {partner.email ? (
                          <Button size="sm" variant="secondary" className="flex-1" asChild>
                            <a href={`mailto:${partner.email}`}>
                              <Mail size={13} /> Email
                            </a>
                          </Button>
                        ) : null}
                        <Button size="sm" variant="primary" className="flex-1" asChild>
                          <Link href={`${basePath}/messages?user=${partner.id}`}>
                            <MessageSquare size={13} /> Chat
                          </Link>
                        </Button>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <button
                          type="button"
                          onClick={() => setRemoveTarget({ id: conn.id, name: partner.name })}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          Remove
                        </button>
                        <button
                          type="button"
                          onClick={() => setBlockTarget({ id: partner.id, name: partner.name })}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          Block
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Received Pending Inquiries */}
          {activeTab === 'received' && (
            <div className="space-y-3">
              {items.map((conn: ConnectionRecord) => (
                <div
                  key={conn.id}
                  className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar name={conn.requester.name} src={conn.requester.avatarUrl} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 m-0">{conn.requester.name}</h4>
                        <span className="text-[10px] font-semibold text-slate-400">
                          • {new Date(conn.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 m-0 mt-0.5">
                        {conn.requester.position || 'Campus Member'} {conn.requester.currentCompany ? `at ${conn.requester.currentCompany}` : ''} ({conn.requester.department || 'Enrolled'})
                      </p>
                      {conn.message && (
                        <div className="mt-2.5 p-3 rounded-lg bg-slate-50 border-l-2 border-blue-500 text-xs italic text-slate-700">
                          &quot;{conn.message}&quot;
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={acceptMutation.isPending}
                      onClick={() => acceptMutation.mutate(conn.id)}
                    >
                      <Check size={14} /> Accept Request
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={declineMutation.isPending}
                      onClick={() => declineMutation.mutate(conn.id)}
                    >
                      <X size={14} /> Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sent Pending Requests */}
          {activeTab === 'sent' && (
            <div className="space-y-3">
              {items.map((conn: ConnectionRecord) => (
                <div
                  key={conn.id}
                  className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar name={conn.recipient.name} src={conn.recipient.avatarUrl} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 m-0">{conn.recipient.name}</h4>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock size={10} /> Pending Review
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 m-0 mt-0.5">
                        {conn.recipient.position || 'Member'} {conn.recipient.currentCompany ? `at ${conn.recipient.currentCompany}` : ''} ({conn.recipient.department || 'Academic Unit'})
                      </p>
                      {conn.message && (
                        <p className="text-xs text-slate-500 italic mt-1.5 m-0">
                          Your note: &quot;{conn.message}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-500 hover:text-rose-600"
                      onClick={() => setCancelTarget({ id: conn.id, name: conn.recipient.name })}
                    >
                      <X size={14} /> Cancel Request
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Blocked Members */}
          {activeTab === 'blocked' && (
            <div className="space-y-3">
              {items.map((b: any) => (
                <div
                  key={b.id}
                  className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                      <Ban size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 m-0">{b.name}</h4>
                      <p className="text-xs text-slate-500 m-0 mt-0.5">
                        {b.position || b.role} {b.currentCompany ? `at ${b.currentCompany}` : ''} · {b.department || 'Campus'}
                      </p>
                      {b.reason && (
                        <p className="text-[11px] text-slate-400 mt-1 m-0">
                          Reason recorded: {b.reason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setUnblockTarget({ id: b.blockedId, name: b.name })}
                    >
                      Unblock Member
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">
                Page {meta.page} of {meta.totalPages} ({meta.total} records)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((prev) => Math.min(prev + 1, meta.totalPages))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Remove Connection Modal */}
      {removeTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95 space-y-4">
            <h3 className="text-base font-bold text-slate-900 m-0">Remove Connection?</h3>
            <p className="text-xs text-slate-600 leading-relaxed m-0">
              Are you sure you want to remove your connection with <strong>{removeTarget.name}</strong>? You will no longer see each other&apos;s connection-only profile fields.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setRemoveTarget(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={removeMutation.isPending}
                onClick={() => removeMutation.mutate(removeTarget.id)}
              >
                {removeMutation.isPending ? 'Removing…' : 'Confirm Removal'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Request Modal */}
      {cancelTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95 space-y-4">
            <h3 className="text-base font-bold text-slate-900 m-0">Cancel Connection Request?</h3>
            <p className="text-xs text-slate-600 leading-relaxed m-0">
              Cancel the pending request sent to <strong>{cancelTarget.name}</strong>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setCancelTarget(null)}>
                Keep Request
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate(cancelTarget.id)}
              >
                {cancelMutation.isPending ? 'Cancelling…' : 'Cancel Request'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Block Modal */}
      {blockTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Ban size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">Block {blockTarget.name}?</h3>
                <p className="text-xs text-slate-500 m-0">Freezes all platform interactions.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed m-0">
              Blocking {blockTarget.name} will terminate connections, cancel mentorships, and prevent either of you from seeing each other in directory searches or sending direct messages.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for blocking (optional):
              </label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g. Unsolicited messages"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setBlockTarget(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={blockMutation.isPending}
                onClick={() => blockMutation.mutate(blockTarget.id)}
              >
                {blockMutation.isPending ? 'Blocking…' : 'Confirm Block'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Unblock Modal */}
      {unblockTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95 space-y-4">
            <h3 className="text-base font-bold text-slate-900 m-0">Unblock {unblockTarget.name}?</h3>
            <p className="text-xs text-slate-600 leading-relaxed m-0">
              Unblocking will allow both of you to discover each other&apos;s public directory profiles again. You can send a fresh connection request if desired.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setUnblockTarget(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={unblockMutation.isPending}
                onClick={() => unblockMutation.mutate(unblockTarget.id)}
              >
                {unblockMutation.isPending ? 'Unblocking…' : 'Confirm Unblock'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
