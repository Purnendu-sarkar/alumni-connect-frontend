'use client';

import { useEffect, useState } from 'react';
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
  FileText,
  GraduationCap,
  HelpCircle,
  Lock,
  MessageSquare,
  Save,
  Send,
  UserCheck,
  XCircle,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CardGridSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import {
  cancelMentorshipRequest,
  endMentorship,
  getMentorshipById,
  replyMentorshipClarification,
  updateMentorshipNote,
  type MentorshipItem,
} from '@/lib/api/mentorship.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface MentorshipDetailViewProps {
  id: string;
  currentRole: UserRole;
  basePath: string;
}

export function MentorshipDetailView({ id, currentRole, basePath }: MentorshipDetailViewProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const [notes, setNotes] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // End / Conclude modal state
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [endNote, setEndNote] = useState('');

  // Reply clarification state
  const [clarifyReply, setClarifyReply] = useState('');

  const {
    data: session,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['mentorship', id],
    queryFn: async () => {
      const res = await getMentorshipById(accessToken, id);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to load mentorship session');
      }
      return res.data;
    },
    enabled: Boolean(accessToken && id),
  });

  useEffect(() => {
    if (session) {
      if (session.alumniNote) setNotes(session.alumniNote);
      if (session.scheduledAt) setScheduledAt(session.scheduledAt);
    }
  }, [session]);

  const saveNoteMutation = useMutation({
    mutationFn: async () => {
      const res = await updateMentorshipNote(accessToken, id, {
        note: notes,
        scheduledAt: scheduledAt || null,
      });
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship', id] });
      setNotice({
        type: 'success',
        message: 'Workspace log and meeting schedule updated successfully!',
      });
      setTimeout(() => setNotice(null), 4000);
    },
    onError: (err: any) => {
      setNotice({ type: 'error', message: err.message || 'Failed to save notes.' });
      setTimeout(() => setNotice(null), 5000);
    },
  });

  const endMutation = useMutation({
    mutationFn: async () => {
      const res = await endMentorship(accessToken, id, endNote.trim() || undefined);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship'] });
      setIsEndModalOpen(false);
      setNotice({
        type: 'success',
        message: 'Mentorship session has been officially concluded.',
      });
      setTimeout(() => setNotice(null), 4000);
    },
    onError: (err: any) => {
      setNotice({ type: 'error', message: err.message || 'Failed to conclude session.' });
      setTimeout(() => setNotice(null), 5000);
    },
  });

  const replyMutation = useMutation({
    mutationFn: async () => {
      const res = await replyMentorshipClarification(accessToken, id, clarifyReply.trim());
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship', id] });
      setClarifyReply('');
      setNotice({
        type: 'success',
        message: 'Clarification response sent to mentor!',
      });
      setTimeout(() => setNotice(null), 4000);
    },
    onError: (err: any) => {
      setNotice({ type: 'error', message: err.message || 'Failed to submit response.' });
      setTimeout(() => setNotice(null), 5000);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          backHref={`${basePath}/mentorship`}
          backLabel="Back to Mentorship Desk"
          eyebrow="MENTORSHIP WORKSPACE"
          title="Loading Session Details…"
        />
        <CardGridSkeleton count={2} />
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="space-y-6">
        <PageHeader
          backHref={`${basePath}/mentorship`}
          backLabel="Back to Mentorship Desk"
          eyebrow="MENTORSHIP WORKSPACE"
          title="Mentorship Session Not Found"
        />
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
          {(error as any)?.message || 'The requested mentorship session could not be retrieved.'}
        </div>
      </div>
    );
  }

  const mentor = session.mentor;
  const mentee = session.mentee;
  const partnerId = currentRole === 'STUDENT' ? session.mentorId : session.menteeId;
  const partnerName = currentRole === 'STUDENT' ? mentor?.name : mentee?.name;

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`${basePath}/mentorship`}
        backLabel="Back to Mentorship Desk"
        eyebrow="MENTORSHIP WORKSPACE"
        title={session.topic}
        description={`Collaboration between ${mentor?.name || 'Mentor'} and ${mentee?.name || 'Mentee'}`}
        badge={<StatusBadge status={session.status} />}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" asChild>
              <Link href={`${basePath}/messages?user=${partnerId}`}>
                <MessageSquare size={14} /> Open Chat
              </Link>
            </Button>
            {session.status === 'ACTIVE' ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEndModalOpen(true)}
                className="text-rose-600 hover:bg-rose-50 border-rose-200"
              >
                Conclude Partnership
              </Button>
            ) : null}
          </div>
        }
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Workspace Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Workspace Form / Notes */}
          {session.status === 'ACTIVE' ? (
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 m-0 font-mono">
                  Session Milestones & Meeting Log
                </h3>
                {currentRole === 'ALUMNI' ? (
                  <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                    <Lock size={12} /> Notes Private to Mentor
                  </span>
                ) : null}
              </div>

              {currentRole === 'ALUMNI' ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveNoteMutation.mutate();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Meeting Frequency & Next Sync Link:
                    </label>
                    <input
                      type="text"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      placeholder="e.g. Alternate Thursdays 8:00 PM via Google Meet (meet.google.com/xyz)"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Private Session Log & Action Items:
                    </label>
                    <textarea
                      rows={6}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Record topics covered, assigned readings, resume review feedback, or code repository review notes…"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" size="sm" disabled={saveNoteMutation.isPending}>
                      <Save size={14} />
                      {saveNoteMutation.isPending ? 'Saving…' : 'Save Workspace Log'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3 text-xs">
                  {session.scheduledAt ? (
                    <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg text-blue-900 flex items-center gap-2">
                      <Calendar size={15} className="text-blue-600 shrink-0" />
                      <span>
                        <strong>Upcoming Session Sync:</strong> {session.scheduledAt}
                      </span>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic m-0">
                      No scheduled meeting times set yet. Use the chat window to coordinate your next session.
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : null}

          {/* Clarification Box if in CLARIFICATION_REQUESTED state */}
          {session.status === 'CLARIFICATION_REQUESTED' ? (
            <div className="p-6 bg-amber-50/70 border border-amber-200 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <HelpCircle size={16} className="text-amber-600" />
                Clarification In Progress
              </div>
              <div className="p-3.5 bg-white rounded-lg border border-amber-200/60 text-xs text-amber-950">
                <strong>Mentor&apos;s Inquiry:</strong>
                <p className="mt-1 m-0 italic">&quot;{session.clarificationQuestion}&quot;</p>
              </div>

              {session.clarificationReply ? (
                <div className="p-3.5 bg-white rounded-lg border border-emerald-200 text-xs text-emerald-950">
                  <strong>Mentee&apos;s Response:</strong>
                  <p className="mt-1 m-0">&quot;{session.clarificationReply}&quot;</p>
                </div>
              ) : currentRole === 'STUDENT' ? (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-amber-950">
                    Respond to Clarification Request:
                  </label>
                  <textarea
                    rows={4}
                    value={clarifyReply}
                    onChange={(e) => setClarifyReply(e.target.value)}
                    placeholder="Provide additional details regarding your background, current availability, or career goals…"
                    className="w-full p-3 bg-white border border-amber-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 leading-relaxed"
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      disabled={!clarifyReply.trim() || replyMutation.isPending}
                      onClick={() => replyMutation.mutate()}
                    >
                      <Send size={14} /> Send Reply
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-800 m-0 italic">
                  Awaiting reply from student mentee.
                </p>
              )}
            </div>
          ) : null}

          {/* Terminal State Info Box */}
          {['COMPLETED', 'CANCELLED', 'REJECTED'].includes(session.status) ? (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] font-mono m-0">
                Partnership Conclusion Record
              </h4>
              <div className="space-y-1 text-slate-600">
                <p className="m-0">
                  <strong>Status:</strong> {session.status}
                </p>
                {session.startedAt ? (
                  <p className="m-0">
                    <strong>Started:</strong> {new Date(session.startedAt).toLocaleDateString()}
                  </p>
                ) : null}
                {session.endedAt ? (
                  <p className="m-0">
                    <strong>Ended:</strong> {new Date(session.endedAt).toLocaleDateString()}
                  </p>
                ) : null}
                {session.endNote ? (
                  <p className="m-0 pt-2 text-slate-800 italic">
                    <strong>Conclusion Note:</strong> &quot;{session.endNote}&quot;
                  </p>
                ) : null}
                {session.decisionNote ? (
                  <p className="m-0 pt-2 text-slate-800 italic">
                    <strong>Decision Note:</strong> &quot;{session.decisionNote}&quot;
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Original Agreement Details */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 m-0 font-mono">
              Original Mentorship Proposal
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="font-semibold text-slate-500 block text-[10px] uppercase">
                  Career Goal
                </span>
                <span className="font-bold text-slate-900">{session.careerGoal}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="font-semibold text-slate-500 block text-[10px] uppercase">
                  Communication & Availability
                </span>
                <span className="font-bold text-slate-900">
                  {session.preferredCommunication} · {session.availability}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed m-0 italic bg-slate-50 p-3.5 rounded-lg border-l-2 border-blue-500">
              &quot;{session.message}&quot;
            </p>
          </div>
        </div>

        {/* Participant Profiles Side Column */}
        <div className="space-y-6">
          {/* Mentor Profile */}
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600 font-mono">
              ACADEMIC MENTOR
            </span>
            <div className="flex items-center gap-3">
              <Avatar name={mentor?.name || 'Mentor'} src={mentor?.avatarUrl} />
              <div>
                <h4 className="text-sm font-bold text-slate-900 m-0">
                  {mentor?.name || 'Alumni Mentor'}
                </h4>
                <p className="text-xs text-slate-500 m-0">
                  {mentor?.position} at {mentor?.currentCompany}
                </p>
                <p className="text-[11px] text-slate-400 m-0 mt-0.5">{mentor?.department}</p>
              </div>
            </div>
          </div>

          {/* Mentee Profile */}
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-600 font-mono">
              STUDENT MENTEE
            </span>
            <div className="flex items-center gap-3">
              <Avatar name={mentee?.name || 'Mentee'} src={mentee?.avatarUrl} />
              <div>
                <h4 className="text-sm font-bold text-slate-900 m-0">
                  {mentee?.name || 'Student Mentee'}
                </h4>
                <p className="text-xs text-slate-500 m-0">{mentee?.department}</p>
                {mentee?.batch ? (
                  <p className="text-[11px] text-slate-400 m-0 mt-0.5">Batch {mentee.batch}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conclude Modal */}
      {isEndModalOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div>
              <h3 className="text-base font-bold text-slate-900 m-0">Conclude Mentorship</h3>
              <p className="text-xs text-slate-500 m-0 mt-1">
                Mark this mentorship partnership as completed. You may add an optional summary note or acknowledgment.
              </p>
            </div>
            <textarea
              rows={4}
              value={endNote}
              onChange={(e) => setEndNote(e.target.value)}
              placeholder="e.g. Completed comprehensive system design coaching and code reviews. Mentee successfully prepared for tech interviews."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEndModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={endMutation.isPending}
                onClick={() => endMutation.mutate()}
              >
                Conclude Partnership
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}