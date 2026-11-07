'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  Clock,
  Handshake,
  MessageSquare,
  Search,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { getConnections, respondConnection, type ConnectionRecord } from '@/lib/api/connection.api';
import { useAuth } from '@/lib/hooks/use-auth';
import { DirectoryGridSkeleton } from '@/components/shared/skeletons';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';

export default function StudentConnectionsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'CONNECTED' | 'PENDING'>('CONNECTED');
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['connections', activeTab],
    queryFn: () => getConnections({ status: activeTab === 'CONNECTED' ? 'ACCEPTED' : 'PENDING' }),
    enabled: Boolean(user),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'ACCEPT' | 'REJECT' }) =>
      respondConnection(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.message || 'Failed to update connection request.');
    },
  });

  const connections: ConnectionRecord[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Network & Connections</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your academic connections, mentorship networks, and incoming requests.
          </p>
        </div>

        <Link
          href="/student/directory"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
        >
          <UserPlus className="h-4 w-4" />
          <span>Find Mentors & Peers</span>
        </Link>
      </div>

      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
          {actionError}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('CONNECTED')}
          className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-semibold transition ${
            activeTab === 'CONNECTED'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Connected Network</span>
        </button>

        <button
          onClick={() => setActiveTab('PENDING')}
          className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-semibold transition ${
            activeTab === 'PENDING'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Pending Inquiries</span>
        </button>
      </div>

      {isLoading ? (
        <DirectoryGridSkeleton count={6} />
      ) : isError ? (
        <ErrorState
          title="Failed to load connections"
          message="Could not load your network. Please check your connection and retry."
          onRetry={() => refetch()}
        />
      ) : connections.length === 0 ? (
        <EmptyState
          title={activeTab === 'CONNECTED' ? 'No connections yet' : 'No pending inquiries'}
          description={
            activeTab === 'CONNECTED'
              ? 'Reach out to alumni mentors in the directory to build your professional circle.'
              : 'You do not have any pending connection or mentorship invitations.'
          }
          actionLabel={activeTab === 'CONNECTED' ? 'Explore Directory' : undefined}
          onAction={() => {
            window.location.href = '/student/directory';
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {connections.map((c) => {
            const isIncoming = c.initiatorId !== user?.id;
            const other = c.otherUser || (c.userLowId === user?.id ? c.userHigh : c.userLow);

            return (
              <div
                key={c.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:border-blue-200 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 font-bold text-sm text-blue-700">
                    {other?.profile?.fullName?.[0] ?? other?.email?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {other?.profile?.fullName ?? other?.email ?? 'Member'}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">
                      {other?.profile?.currentJob
                        ? `${other.profile.currentJob} at ${other.profile.company ?? ''}`
                        : other?.profile?.department ?? other?.role ?? 'University Network'}
                    </p>
                  </div>
                </div>

                {c.note && (
                  <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2.5 italic">
                    &ldquo;{c.note}&rdquo;
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  {c.status === 'ACCEPTED' ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Connected</span>
                    </span>
                  ) : isIncoming ? (
                    <div className="flex items-center gap-2 w-full justify-end">
                      <button
                        type="button"
                        onClick={() => respondMutation.mutate({ id: c.id, action: 'ACCEPT' })}
                        disabled={respondMutation.isPending}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => respondMutation.mutate({ id: c.id, action: 'REJECT' })}
                        disabled={respondMutation.isPending}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400 font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Awaiting response</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

