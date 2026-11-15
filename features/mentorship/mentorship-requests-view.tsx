'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  HelpCircle,
  MessageSquare,
  Send,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { CardGridSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import {
  acceptMentorshipRequest,
  cancelMentorshipRequest,
  clarifyMentorshipRequest,
  getMyMentorships,
  rejectMentorshipRequest,
  replyMentorshipClarification,
  type MentorshipItem,
} from '@/lib/api/mentorship.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface MentorshipRequestsViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function MentorshipRequestsView({ currentRole, basePath }: MentorshipRequestsViewProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [clarifyModal, setClarifyModal] = useState<{ id: string; menteeName: string } | null>(null);
  const [clarifyQuestion, setClarifyQuestion] = useState('');

  const [replyModal, setReplyModal] = useState<{ id: string; question: string } | null>(null);
  const [clarifyReply, setClarifyReply] = useState('');

  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [cancelModal, setCancelModal] = useState<{ id: string; title: string } | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const {
    data: requests = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['mentorship', 'requests'],
    queryFn: async () => {
      const res = await getMyMentorships(accessToken, { group: 'requests' });
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to fetch mentorship requests');
      }
      return res.data;
    },
    enabled: Boolean(accessToken),
  });

  const invalidateMentorship = () => {
    queryClient.invalidateQueries({ queryKey: ['mentorship'] });
  };

  const acceptMutation = useMutation({
    mutationFn: (id: string) => acceptMentorshipRequest(accessToken, id),
    onSuccess: (res) => {
      if (!res.success) throw new Error(res.message);
      invalidateMentorship();
      setNotice({
        type: 'success',
        message: 'Mentorship request accepted! An active workspace has been created.',
      });
      setTimeout(() => setNotice(null), 4000);
    },
    onError: (err: any) => {
      setNotice({ type: 'error', message: err.message || 'Failed to accept request.' });
      setTimeout(() => setNotice(null), 5000);
    },
  });

  const clarifyMutation = useMutation({
    mutationFn: ({ id, question }: { id: string; question: string }) =>
      clarifyMentorshipRequest(accessToken, id, question),
    onSuccess: (res) => {
      if (!res.success) throw new Error(res.message);
      invalidateMentorship();
      setClarifyModal(null);
      setClarifyQuestion('');
      setNotice({
        type: 'success',
        message: 'Clarification inquiry sent to student mentee.',
      });
      setTimeout(() => setNotice(null), 4000);
    },
    onError: (err: any) => {
      setNotice({ type: 'error', message: err.message || 'Failed to send clarification.' });
      setTimeout(() => setNotice(null), 5000);
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, reply }: { id: string; reply: string }) =>
      replyMentorshipClarification(accessToken, id, reply),
    onSuccess: (res) => {
      if (!res.success) throw new Error(res.message);
      invalidateMentorship();
      setReplyModal(null);
      setClarifyReply('');
      setNotice({
        type: 'success',
        message: 'Your clarification response was sent to the mentor.',
      });
      setTimeout(() => setNotice(null), 4000);
    },
    onError: (err: any) => {
      setNotice({ type: 'error', message: err.message || 'Failed to send clarification reply.' });
      setTimeout(() => setNotice(null), 5000);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectMentorshipRequest(accessToken, id, reason),
    onSuccess: (res) => {
      if (!res.success) throw new Error(res.message);
      invalidateMentorship();
      setRejectModal(null);
      setRejectReason('');
      setNotice({
        type: 'success',
        message: 'Mentorship inquiry was politely declined.',
      });
      setTimeout(() => setNotice(null), 4000);
    },
    onError: (err: any) => {
      setNotice({ type: 'error', message: err.message || 'Failed to decline request.' });
      setTimeout(() => setNotice(null), 5000);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      cancelMentorshipRequest(accessToken, id, note),
    onSuccess: (res) => {
      if (!res.success) throw new Error(res.message);
      invalidateMentorship();
      setCancelModal(null);
      setCancelReason('');
      setNotice({
        type: 'success',
        message: 'Mentorship request withdrawn successfully.',
      });
      setTimeout(() => setNotice(null), 4000);
    },
    onError: (err: any) => {
      setNotice({ type: 'error', message: err.message || 'Failed to cancel request.' });
      setTimeout(() => setNotice(null), 5000);
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`${basePath}/mentorship`}
        backLabel="Back to Mentorship Hub"
        eyebrow="INQUIRY PIPELINE"
        title="Mentorship Requests"
        description="Review incoming proposals, clarify learning objectives, or confirm 1-on-1 coaching agreements."
      />

      {notice ? (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 animate-in fade-in ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
          )}
          <span>{notice.message}</span>
        </div>
      ) : null}

      {isLoading ? (
        <CardGridSkeleton count={2} />
      ) : isError ? (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
          {(error as any)?.message || 'Failed to load mentorship requests.'}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="All mentorship requests have been reviewed"
          description={
            currentRole === 'STUDENT'
              ? 'You do not have any pending mentorship proposals at this time.'
              : 'There are no pending student mentorship inquiries in your queue.'
          }
          action={
            <Button size="sm" asChild>
              <Link href={`${basePath}/mentorship`}>Return to Mentorship Hub</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const partner = currentRole === 'STUDENT' ? req.mentor : req.mentee;
            const partnerName = partner?.name || 'Verified Member';
            const partnerSubtitle =
              currentRole === 'STUDENT'
                ? `${partner?.position || 'Alumni'} at ${partner?.currentCompany || 'Industry'}`
                : `${partner?.department || 'Department'} ${partner?.batch ? `(Batch ${partner.batch})` : ''}`;

            return (
              <div
                key={req.id}
                className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <Avatar name={partnerName} src={partner?.avatarUrl} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 m-0">
                          {currentRole === 'STUDENT' ? `Mentor: ${partnerName}` : partnerName}
                        </h3>
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="text-xs text-slate-500 m-0 mt-0.5">{partnerSubtitle}</p>
                    </div>
                  </div>

                  {currentRole === 'ALUMNI' ? (
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <Button
                        size="sm"
                        disabled={acceptMutation.isPending}
                        onClick={() => acceptMutation.mutate(req.id)}
                      >
                        <Check size={14} /> Accept Mentee
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setClarifyModal({ id: req.id, menteeName: partnerName })}
                      >
                        <HelpCircle size={14} /> Clarify
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setRejectModal({ id: req.id, name: partnerName })}
                        className="text-rose-600 hover:bg-rose-50"
                      >
                        <X size={14} /> Decline
                      </Button>
                    </div>
                  ) : currentRole === 'STUDENT' ? (
                    <div className="flex items-center gap-2 self-end md:self-center">
                      {req.status === 'CLARIFICATION_REQUESTED' ? (
                        <Button
                          size="sm"
                          onClick={() =>
                            setReplyModal({
                              id: req.id,
                              question: req.clarificationQuestion || 'Please provide details.',
                            })
                          }
                        >
                          <Send size={14} /> Reply to Mentor
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setCancelModal({ id: req.id, title: req.topic })}
                        className="text-slate-500 hover:text-rose-600"
                      >
                        Withdraw Request
                      </Button>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0 font-mono">
                      Proposed Topic & Career Goal
                    </p>
                    <span className="text-[11px] text-slate-400">
                      Comm: {req.preferredCommunication} · Avail: {req.availability}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 m-0">{req.topic}</h4>
                  <p className="text-xs text-blue-700 font-medium m-0">
                    <strong>Career Target:</strong> {req.careerGoal}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg text-xs leading-relaxed text-slate-700">
                  <strong className="block text-slate-900 mb-1">Inquiry Statement:</strong>
                  &quot;{req.message}&quot;
                </div>

                {req.clarificationQuestion ? (
                  <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-lg text-xs space-y-1 text-amber-900">
                    <strong className="block text-amber-950 font-bold">
                      Clarification Question from Mentor:
                    </strong>
                    <p className="m-0 italic">&quot;{req.clarificationQuestion}&quot;</p>
                    {req.clarificationReply ? (
                      <div className="pt-2 mt-2 border-t border-amber-200/80">
                        <strong className="block text-emerald-900 font-bold">
                          Student Mentee Response:
                        </strong>
                        <p className="m-0 text-slate-800">&quot;{req.clarificationReply}&quot;</p>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>Requested on {new Date(req.createdAt).toLocaleDateString()}</span>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`${basePath}/messages?user=${partner?.id}`}>
                      <MessageSquare size={13} /> Chat Privately
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clarification Modal (Alumni -> Student) */}
      {clarifyModal ? (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div>
              <h3 className="text-base font-bold text-slate-900 m-0">Ask for Clarification</h3>
              <p className="text-xs text-slate-500 m-0 mt-1">
                Pose a clarifying question to {clarifyModal.menteeName} before accepting the inquiry.
              </p>
            </div>
            <textarea
              rows={4}
              required
              value={clarifyQuestion}
              onChange={(e) => setClarifyQuestion(e.target.value)}
              placeholder="e.g. Could you clarify your timeline, current programming proficiency, or specific project milestones?"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setClarifyModal(null);
                  setClarifyQuestion('');
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!clarifyQuestion.trim() || clarifyMutation.isPending}
                onClick={() =>
                  clarifyMutation.mutate({
                    id: clarifyModal.id,
                    question: clarifyQuestion.trim(),
                  })
                }
              >
                Send Clarification Request
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Reply Clarification Modal (Student -> Mentor) */}
      {replyModal ? (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div>
              <h3 className="text-base font-bold text-slate-900 m-0">Respond to Mentor</h3>
              <p className="text-xs text-slate-500 m-0 mt-1">
                Mentor asked: <em>&quot;{replyModal.question}&quot;</em>
              </p>
            </div>
            <textarea
              rows={4}
              required
              value={clarifyReply}
              onChange={(e) => setClarifyReply(e.target.value)}
              placeholder="Type your response addressing the mentor's inquiry in detail…"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReplyModal(null);
                  setClarifyReply('');
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!clarifyReply.trim() || replyMutation.isPending}
                onClick={() =>
                  replyMutation.mutate({
                    id: replyModal.id,
                    reply: clarifyReply.trim(),
                  })
                }
              >
                Deliver Response
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Decline / Reject Modal */}
      {rejectModal ? (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div>
              <h3 className="text-base font-bold text-rose-950 m-0">Decline Mentorship Request</h3>
              <p className="text-xs text-slate-500 m-0 mt-1">
                Politely decline the mentorship inquiry from {rejectModal.name}. You may optionally add a courteous note.
              </p>
            </div>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Currently at maximum mentee capacity for this quarter. Wishing you all the best!"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-rose-500 leading-relaxed"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={rejectMutation.isPending}
                onClick={() =>
                  rejectMutation.mutate({
                    id: rejectModal.id,
                    reason: rejectReason.trim() || undefined,
                  })
                }
              >
                Confirm Decline
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Withdraw / Cancel Modal */}
      {cancelModal ? (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div>
              <h3 className="text-base font-bold text-slate-900 m-0">Withdraw Mentorship Proposal</h3>
              <p className="text-xs text-slate-500 m-0 mt-1">
                Are you sure you want to withdraw your inquiry on &quot;{cancelModal.title}&quot;?
              </p>
            </div>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Optional withdrawal note…"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCancelModal(null);
                  setCancelReason('');
                }}
              >
                Keep Request
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={cancelMutation.isPending}
                onClick={() =>
                  cancelMutation.mutate({
                    id: cancelModal.id,
                    note: cancelReason.trim() || undefined,
                  })
                }
              >
                Withdraw Request
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}