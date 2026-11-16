'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  Globe,
  GraduationCap,
  Handshake,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardGridSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { getDirectoryMemberById } from '@/lib/api/directory.api';
import { blockUser, sendConnectionRequest } from '@/lib/api/connection.api';
import { sendMentorshipRequest } from '@/lib/api/mentorship.api';
import { getApiErrorMessage } from '@/lib/api/error-utils';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface MemberDetailViewProps {
  id: string;
  currentRole: UserRole;
  basePath: string;
}

export function MemberDetailView({ id, currentRole, basePath }: MemberDetailViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentUser = useAuthStore((state) => state.user);

  // Modals state
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectMessage, setConnectMessage] = useState('');
  const [connectNotice, setConnectNotice] = useState<string | null>(null);

  const [showMentorModal, setShowMentorModal] = useState(false);
  const [mentorTopic, setMentorTopic] = useState('');
  const [mentorCareerGoal, setMentorCareerGoal] = useState('');
  const [mentorMessage, setMentorMessage] = useState('');
  const [mentorComm, setMentorComm] = useState('CHAT');
  const [mentorAvailability, setMentorAvailability] = useState('Flexible weekday evenings');
  const [mentorDuration, setMentorDuration] = useState('4 weeks');

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  // Real backend query for community member details
  const detailQuery = useQuery({
    queryKey: ['directory', 'detail', id, accessToken],
    queryFn: async () => {
      const res = await getDirectoryMemberById(accessToken, id);
      return res.data;
    },
    enabled: Boolean(accessToken && id),
  });

  const member = detailQuery.data;

  // Connect mutation
  const connectMutation = useMutation({
    mutationFn: () =>
      sendConnectionRequest(accessToken, {
        recipientId: id,
        message: connectMessage.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directory', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      setShowConnectModal(false);
      setConnectNotice('Connection request dispatched successfully!');
      setTimeout(() => setConnectNotice(null), 4000);
    },
  });

  // Mentorship mutation
  const mentorshipMutation = useMutation({
    mutationFn: () =>
      sendMentorshipRequest(accessToken, {
        mentorId: id,
        topic: mentorTopic.trim(),
        careerGoal: mentorCareerGoal.trim(),
        message: mentorMessage.trim(),
        preferredCommunication: mentorComm,
        availability: mentorAvailability.trim(),
        expectedDuration: mentorDuration.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directory', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['mentorship'] });
      setShowMentorModal(false);
      setConnectNotice('Mentorship inquiry submitted successfully!');
      setTimeout(() => setConnectNotice(null), 4000);
    },
  });

  // Block mutation
  const blockMutation = useMutation({
    mutationFn: () =>
      blockUser(accessToken, {
        blockedId: id,
        reason: blockReason.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directory'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      router.push(`${basePath}/directory`);
    },
  });

  if (detailQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          backHref={`${basePath}/directory`}
          backLabel="Back to Directory"
          eyebrow="COMMUNITY MEMBER PROFILE"
          title="Loading Profile Details…"
          description="Fetching accredited member details from campus directory."
        />
        <CardGridSkeleton count={3} />
      </div>
    );
  }

  if (detailQuery.isError || !member) {
    return (
      <div className="space-y-6">
        <PageHeader
          backHref={`${basePath}/directory`}
          backLabel="Back to Directory"
          eyebrow="COMMUNITY MEMBER PROFILE"
          title="Member Not Found"
          description="This profile could not be located or has privacy restrictions."
        />
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 space-y-3">
          <AlertCircle size={32} className="mx-auto text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900">Profile Unavailable</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            This university member may have restricted their profile visibility, or the account is currently unavailable.
          </p>
          <Button size="sm" asChild>
            <Link href={`${basePath}/directory`}>Return to Directory</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isSelf = member.relationship === 'SELF';
  const isConnected = member.connectionStatus === 'CONNECTED';
  const isPendingSent = member.connectionStatus === 'PENDING_SENT';
  const isPendingReceived = member.connectionStatus === 'PENDING_RECEIVED';

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`${basePath}/directory`}
        backLabel="Back to Directory"
        eyebrow="COMMUNITY MEMBER PROFILE"
        title={member.name}
        description={`${member.position || (member.role === 'ALUMNI' ? 'Alumni' : 'Student')} · ${member.currentCompany || 'Institutional Network'}`}
        badge={
          member.verificationStatus === 'APPROVED' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={13} /> Verified Member
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <Clock size={13} /> Pending Verification
            </span>
          )
        }
        actions={
          <div className="flex items-center gap-2">
            {!isSelf && (
              <>
                {isConnected ? (
                  <Button size="sm" variant="secondary" className="text-emerald-700 bg-emerald-50 border-emerald-200" asChild>
                    <Link href={`${basePath}/connections`}>
                      <CheckCircle2 size={14} /> Connected
                    </Link>
                  </Button>
                ) : isPendingSent ? (
                  <Button size="sm" variant="secondary" className="text-amber-700 bg-amber-50 border-amber-200" asChild>
                    <Link href={`${basePath}/connections?tab=sent`}>
                      <Clock size={14} /> Request Pending
                    </Link>
                  </Button>
                ) : isPendingReceived ? (
                  <Button size="sm" variant="primary" asChild>
                    <Link href={`${basePath}/connections?tab=received`}>
                      <Handshake size={14} /> Review Request
                    </Link>
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setShowConnectModal(true)}>
                    <Handshake size={14} /> Connect
                  </Button>
                )}

                {currentRole === 'STUDENT' && member.role === 'ALUMNI' ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={member.mentorshipBadge === 'FULL' || member.mentorshipBadge === 'CLOSED' || Boolean(member.activeMentorshipStatus)}
                    onClick={() => {
                      setMentorTopic(`Career Guidance in ${member.currentCompany || 'Industry'}`);
                      setMentorCareerGoal(`Pathways into ${member.position || 'Engineering'}`);
                      setShowMentorModal(true);
                    }}
                  >
                    <Compass size={14} />{' '}
                    {member.activeMentorshipStatus
                      ? `Mentorship: ${member.activeMentorshipStatus}`
                      : member.mentorshipBadge === 'FULL'
                      ? 'Mentorship Full'
                      : 'Propose Mentorship'}
                  </Button>
                ) : null}

                <Button size="sm" variant="secondary" asChild>
                  <Link href={`${basePath}/messages?user=${member.id}`}>
                    <MessageSquare size={14} /> Message
                  </Link>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  onClick={() => setShowBlockModal(true)}
                  title="Block User"
                >
                  <Ban size={14} />
                </Button>
              </>
            )}
          </div>
        }
      />

      {connectNotice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{connectNotice}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Academic & Contact Metadata Card */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col items-center text-center">
              <Avatar name={member.name} src={member.avatarUrl} className="h-20 w-20 text-xl mb-3" />
              <h2 className="text-lg font-bold text-slate-900 m-0">{member.name}</h2>
              <p className="text-xs text-slate-500 mt-1 m-0">
                {member.position || 'Community Member'} {member.currentCompany ? `at ${member.currentCompany}` : ''}
              </p>
              {member.location ? (
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 m-0">
                  <MapPin size={12} /> {member.location}
                </p>
              ) : null}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 text-slate-400">
                  <GraduationCap size={14} /> Department
                </span>
                <span className="font-semibold text-slate-800 text-right">{member.department || 'Enrolled'}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 text-slate-400">
                  <Calendar size={14} /> Cohort
                </span>
                <span className="font-semibold text-slate-800">
                  {member.graduationYear ? `Class of ${member.graduationYear}` : `Batch ${member.batch || 'Class'}`}
                </span>
              </div>

              {member.email ? (
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-2 text-slate-400">
                    <Mail size={14} /> Email
                  </span>
                  <a href={`mailto:${member.email}`} className="font-semibold text-blue-600 hover:underline truncate max-w-[170px]">
                    {member.email}
                  </a>
                </div>
              ) : null}

              {member.phone ? (
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-2 text-slate-400">
                    <Phone size={14} /> Phone
                  </span>
                  <span className="font-semibold text-slate-800">{member.phone}</span>
                </div>
              ) : null}
            </div>

            {/* Social Links */}
            {(member.linkedinUrl || member.githubUrl || member.websiteUrl) && (
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2 justify-center">
                {member.linkedinUrl ? (
                  <Button size="sm" variant="secondary" asChild>
                    <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer">
                      LinkedIn <ExternalLink size={12} className="ml-1" />
                    </a>
                  </Button>
                ) : null}
                {member.githubUrl ? (
                  <Button size="sm" variant="secondary" asChild>
                    <a href={member.githubUrl} target="_blank" rel="noopener noreferrer">
                      GitHub <ExternalLink size={12} className="ml-1" />
                    </a>
                  </Button>
                ) : null}
                {member.websiteUrl ? (
                  <Button size="sm" variant="secondary" asChild>
                    <a href={member.websiteUrl} target="_blank" rel="noopener noreferrer">
                      Website <ExternalLink size={12} className="ml-1" />
                    </a>
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Bio, Career History, Skills, and Mentorship Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* About / Bio */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0">About Member</h3>
            <p className="text-xs text-slate-600 leading-relaxed m-0 whitespace-pre-line">
              {member.bio || member.headline || 'Verified member of the campus networking platform.'}
            </p>
          </div>

          {/* Professional Skills */}
          {member.skills && member.skills.length > 0 ? (
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-1.5">
                {member.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {/* Mentorship Offerings (for Alumni) */}
          {member.role === 'ALUMNI' && (
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0">Mentorship Status</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    member.mentorshipBadge === 'OPEN'
                      ? 'bg-emerald-100 text-emerald-800'
                      : member.mentorshipBadge === 'FULL'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {member.mentorshipBadge === 'OPEN'
                    ? 'Accepting Mentees'
                    : member.mentorshipBadge === 'FULL'
                    ? 'Capacity Full'
                    : 'Closed / Paused'}
                </span>
              </div>
              <p className="text-xs text-slate-600 m-0 leading-relaxed">
                {member.mentorshipBadge === 'OPEN'
                  ? 'This alumni graduate is currently accepting junior student mentees for 1-on-1 counseling, code review, and career navigation.'
                  : 'This graduate is currently not onboarding new student mentees.'}
              </p>
              {member.mentorshipTopics && member.mentorshipTopics.length > 0 ? (
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Mentorship Topics:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {member.mentorshipTopics.map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95 space-y-4">
            <button
              type="button"
              onClick={() => setShowConnectModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <Avatar name={member.name} src={member.avatarUrl} />
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">Connect with {member.name}</h3>
                <p className="text-xs text-slate-500 m-0">
                  {member.position || 'Campus Member'} {member.currentCompany ? `at ${member.currentCompany}` : ''}
                </p>
              </div>
            </div>

            {connectMutation.isError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{getApiErrorMessage(connectMutation.error, 'Failed to dispatch request.')}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                connectMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Include an introductory note (optional):
                </label>
                <textarea
                  rows={3}
                  value={connectMessage}
                  onChange={(e) => setConnectMessage(e.target.value)}
                  placeholder="Introduce yourself and share why you would like to connect…"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowConnectModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={connectMutation.isPending}>
                  <Send size={14} /> {connectMutation.isPending ? 'Sending…' : 'Send Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mentorship Modal */}
      {showMentorModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95 space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowMentorModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <Avatar name={member.name} src={member.avatarUrl} />
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">Propose Mentorship to {member.name}</h3>
                <p className="text-xs text-slate-500 m-0">
                  {member.position} at {member.currentCompany || 'Alumni Network'}
                </p>
              </div>
            </div>

            {mentorshipMutation.isError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{getApiErrorMessage(mentorshipMutation.error, 'Failed to submit proposal.')}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                mentorshipMutation.mutate();
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Discussion Topic *
                </label>
                <input
                  type="text"
                  required
                  value={mentorTopic}
                  onChange={(e) => setMentorTopic(e.target.value)}
                  placeholder="e.g. Distributed Go Microservices & Resume Review"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Career Goal *
                </label>
                <input
                  type="text"
                  required
                  value={mentorCareerGoal}
                  onChange={(e) => setMentorCareerGoal(e.target.value)}
                  placeholder="e.g. Securing a software engineering internship"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message & Specific Objectives *
                </label>
                <textarea
                  rows={3}
                  required
                  value={mentorMessage}
                  onChange={(e) => setMentorMessage(e.target.value)}
                  placeholder="Detail your background and questions…"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Communication
                  </label>
                  <select
                    value={mentorComm}
                    onChange={(e) => setMentorComm(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CHAT">Platform Chat</option>
                    <option value="VIDEO">Google Meet / Video</option>
                    <option value="EMAIL">University Email</option>
                    <option value="IN_PERSON">Campus In-Person</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expected Duration
                  </label>
                  <input
                    type="text"
                    value={mentorDuration}
                    onChange={(e) => setMentorDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Availability
                </label>
                <input
                  type="text"
                  value={mentorAvailability}
                  onChange={(e) => setMentorAvailability(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowMentorModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={mentorshipMutation.isPending}>
                  <Compass size={14} /> {mentorshipMutation.isPending ? 'Submitting…' : 'Submit Proposal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {showBlockModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95 space-y-4">
            <button
              type="button"
              onClick={() => setShowBlockModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Ban size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">Block {member.name}?</h3>
                <p className="text-xs text-slate-500 m-0">This will terminate connections and freeze interactions.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed m-0">
              When blocked, neither you nor {member.name} will be able to view each other&apos;s profiles, discover each other in directory searches, or exchange messages.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for blocking (optional / confidential):
              </label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g. Unsolicited messages or spam"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowBlockModal(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={blockMutation.isPending}
                onClick={() => blockMutation.mutate()}
              >
                {blockMutation.isPending ? 'Blocking…' : 'Confirm Block'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
