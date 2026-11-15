'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Clock,
  Compass,
  GraduationCap,
  Handshake,
  Mail,
  MapPin,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { CardGridSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { useDebounce } from '@/hooks/use-debounce';
import { useDepartments } from '@/hooks/use-departments';
import {
  searchDirectory,
  type DirectoryFilters,
  type DirectoryMemberCard,
} from '@/lib/api/directory.api';
import { sendConnectionRequest } from '@/lib/api/connection.api';
import { sendMentorshipRequest } from '@/lib/api/mentorship.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface MemberDirectoryViewProps {
  currentRole: UserRole;
  basePath: string; // e.g. '/student' or '/alumni' or '/admin'
}

export function MemberDirectoryView({ currentRole, basePath }: MemberDirectoryViewProps) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const { departments: activeDepts } = useDepartments();

  // Active directory group: ALUMNI can toggle between Alumni and Students; STUDENT is locked to 'alumni'
  const [group, setGroup] = useState<'alumni' | 'students'>('alumni');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [department, setDepartment] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [mentorshipFilter, setMentorshipFilter] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'graduationYear' | 'recentlyJoined'>('recentlyJoined');
  const [page, setPage] = useState(1);

  // Connect modal state
  const [connectModalMember, setConnectModalMember] = useState<DirectoryMemberCard | null>(null);
  const [connectMessage, setConnectMessage] = useState('');
  const [connectSuccess, setConnectSuccess] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Mentorship request modal state (Student proposing to Alumni)
  const [mentorModalMember, setMentorModalMember] = useState<DirectoryMemberCard | null>(null);
  const [mentorTopic, setMentorTopic] = useState('');
  const [mentorCareerGoal, setMentorCareerGoal] = useState('');
  const [mentorMessage, setMentorMessage] = useState('');
  const [mentorComm, setMentorComm] = useState('CHAT');
  const [mentorAvailability, setMentorAvailability] = useState('Flexible weekday evenings');
  const [mentorDuration, setMentorDuration] = useState('4 weeks');
  const [mentorSuccess, setMentorSuccess] = useState<string | null>(null);
  const [mentorError, setMentorError] = useState<string | null>(null);

  // Live backend query for directory candidates
  const effectiveGroup = currentRole === 'STUDENT' ? 'alumni' : group;

  const directoryQuery = useQuery({
    queryKey: [
      'directory',
      effectiveGroup,
      debouncedSearch,
      department,
      batchFilter,
      mentorshipFilter,
      sortBy,
      page,
      accessToken,
    ],
    queryFn: async () => {
      const filters: DirectoryFilters = {
        group: effectiveGroup,
        q: debouncedSearch || undefined,
        department: department === 'All' ? undefined : department,
        gradYear: batchFilter === 'All' ? undefined : batchFilter,
        mentorship: mentorshipFilter ? true : undefined,
        sort: sortBy,
        page,
        limit: 18,
      };
      const res = await searchDirectory(accessToken, filters);
      return res;
    },
    enabled: Boolean(accessToken),
  });

  const members: DirectoryMemberCard[] = directoryQuery.data?.data ?? [];
  const meta = directoryQuery.data?.meta;

  // Connect mutation
  const connectMutation = useMutation({
    mutationFn: (recipientId: string) =>
      sendConnectionRequest(accessToken, {
        recipientId,
        message: connectMessage.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['directory'] });
      setConnectSuccess(`Connection request dispatched to ${connectModalMember?.name}!`);
      setConnectModalMember(null);
      setConnectMessage('');
      setConnectError(null);
      setTimeout(() => setConnectSuccess(null), 4000);
    },
    onError: (err: any) => {
      setConnectError(err?.message || 'Failed to dispatch connection request. Please try again.');
    },
  });

  // Mentorship mutation
  const mentorshipMutation = useMutation({
    mutationFn: () =>
      sendMentorshipRequest(accessToken, {
        mentorId: mentorModalMember!.id,
        topic: mentorTopic.trim(),
        careerGoal: mentorCareerGoal.trim(),
        message: mentorMessage.trim(),
        preferredCommunication: mentorComm,
        availability: mentorAvailability.trim(),
        expectedDuration: mentorDuration.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship'] });
      queryClient.invalidateQueries({ queryKey: ['directory'] });
      setMentorSuccess(
        `Mentorship proposal on "${mentorTopic}" submitted to ${mentorModalMember?.name}! They will review your inquiry.`,
      );
      setMentorModalMember(null);
      setMentorTopic('');
      setMentorCareerGoal('');
      setMentorMessage('');
      setMentorError(null);
      setTimeout(() => setMentorSuccess(null), 5000);
    },
    onError: (err: any) => {
      setMentorError(err?.message || 'Unable to submit mentorship inquiry. Please check availability.');
    },
  });

  const handleSendConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectModalMember) return;
    setConnectError(null);
    connectMutation.mutate(connectModalMember.id);
  };

  const handleSendMentorship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorModalMember) return;
    setMentorError(null);
    mentorshipMutation.mutate();
  };

  const departments = useMemo(() => {
    if (activeDepts && activeDepts.length > 0) {
      return ['All', ...activeDepts.map((d) => d.code)];
    }
    return ['All', 'CSE', 'EEE', 'BBA', 'ECON', 'ENG', 'CE'];
  }, [activeDepts]);

  const batches = ['All', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CAMPUS NETWORK & DIRECTORY"
        title="Institutional Member Directory"
        description="Discover accredited alumni, active researchers, and graduating seniors across all university academic units."
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href={`${basePath}/connections`}>
                <Handshake size={14} /> My Connections
              </Link>
            </Button>
            {currentRole === 'STUDENT' ? (
              <Button asChild size="sm">
                <Link href={`${basePath}/mentorship`}>
                  <Compass size={14} /> Mentorship Hub
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      {/* Role-based group toggle for ALUMNI viewers */}
      {currentRole === 'ALUMNI' ? (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => {
              setGroup('alumni');
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              group === 'alumni'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users size={15} /> Alumni Directory
          </button>
          <button
            type="button"
            onClick={() => {
              setGroup('students');
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              group === 'students'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <GraduationCap size={15} /> Enrolled Students
          </button>
        </div>
      ) : null}

      {connectSuccess ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{connectSuccess}</span>
        </div>
      ) : null}

      {mentorSuccess ? (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-800 flex items-center gap-2 animate-in fade-in">
          <Compass size={16} className="text-blue-600 shrink-0" />
          <span>{mentorSuccess}</span>
        </div>
      ) : null}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, current employer, position, or skills (e.g. AWS, React)…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={batchFilter}
              onChange={(e) => {
                setBatchFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Batches</option>
              {batches
                .filter((b) => b !== 'All')
                .map((b) => (
                  <option key={b} value={b}>
                    Batch {b}
                  </option>
                ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recentlyJoined">Recently Joined</option>
              <option value="name">Name (A–Z)</option>
              <option value="graduationYear">Graduation Year</option>
            </select>

            {effectiveGroup === 'alumni' ? (
              <button
                type="button"
                onClick={() => {
                  setMentorshipFilter(!mentorshipFilter);
                  setPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  mentorshipFilter
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Compass size={14} /> Open to Mentor
              </button>
            ) : null}
          </div>
        </div>

        {/* Department Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <SlidersHorizontal size={14} className="text-slate-400 shrink-0 mr-1" />
          {departments.map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => {
                setDepartment(dept);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                department === dept
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      {directoryQuery.isLoading ? (
        <CardGridSkeleton count={6} />
      ) : directoryQuery.isError ? (
        <div className="p-8 text-center bg-white rounded-xl border border-rose-200 space-y-3">
          <AlertCircle size={32} className="mx-auto text-rose-500" />
          <h3 className="text-sm font-bold text-slate-900">Failed to load directory members</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {(directoryQuery.error as any)?.message || 'An error occurred while querying the campus directory.'}
          </p>
          <Button size="sm" variant="secondary" onClick={() => directoryQuery.refetch()}>
            <RefreshCw size={14} /> Try Again
          </Button>
        </div>
      ) : members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No community members match your filters"
          description={`No verified ${effectiveGroup} match "${search || department}". Try refining your query or resetting filters.`}
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearch('');
                setDepartment('All');
                setBatchFilter('All');
                setMentorshipFilter(false);
                setSortBy('recentlyJoined');
                setPage(1);
              }}
            >
              Reset All Filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <article
                key={member.id}
                className="group p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} src={member.avatarUrl} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-slate-900 m-0 group-hover:text-blue-600 transition-colors">
                            {member.name}
                          </h3>
                          {member.verificationStatus === 'APPROVED' ? (
                            <span title="Verified Member" className="text-emerald-600">
                              <CheckCircle2 size={14} />
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-slate-500 m-0">
                          {member.position || (member.role === 'ALUMNI' ? 'Alumni Member' : 'Undergraduate Scholar')}
                          {member.currentCompany ? (
                            <>
                              {' '}
                              · <strong className="text-slate-700">{member.currentCompany}</strong>
                            </>
                          ) : null}
                        </p>
                      </div>
                    </div>

                    {member.mentorshipBadge === 'OPEN' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                        <Compass size={11} /> Mentor
                      </span>
                    ) : member.mentorshipBadge === 'FULL' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                        Capacity Full
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-3 pb-2.5 border-b border-slate-100 flex-wrap">
                    <span className="flex items-center gap-1 truncate">
                      <GraduationCap size={13} className="shrink-0 text-slate-400" />
                      <span className="truncate">{member.department || 'Academic Unit'}</span>
                    </span>
                    <span>•</span>
                    <span className="shrink-0">
                      {member.graduationYear ? `Class of ${member.graduationYear}` : `Batch ${member.batch || 'Class'}`}
                    </span>
                    {member.location ? (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 truncate">
                          <MapPin size={12} className="shrink-0 text-slate-400" />
                          <span className="truncate">{member.location}</span>
                        </span>
                      </>
                    ) : null}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {member.bio || member.headline || 'Verified member of the institutional university community.'}
                  </p>

                  {member.skills && member.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {member.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60"
                        >
                          {skill}
                        </span>
                      ))}
                      {member.skills.length > 3 ? (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{member.skills.length - 3} more
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  {member.connectionStatus === 'CONNECTED' ? (
                    <Button size="sm" variant="secondary" className="flex-1 text-emerald-700 bg-emerald-50 border-emerald-200" asChild>
                      <Link href={`${basePath}/connections`}>
                        <CheckCircle2 size={14} /> Connected
                      </Link>
                    </Button>
                  ) : member.connectionStatus === 'PENDING_SENT' ? (
                    <Button size="sm" variant="secondary" className="flex-1 text-amber-700 bg-amber-50 border-amber-200" asChild>
                      <Link href={`${basePath}/connections?tab=sent`}>
                        <Clock size={14} /> Request Pending
                      </Link>
                    </Button>
                  ) : member.connectionStatus === 'PENDING_RECEIVED' ? (
                    <Button size="sm" variant="primary" className="flex-1" asChild>
                      <Link href={`${basePath}/connections?tab=received`}>
                        <Handshake size={14} /> Review Request
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="primary"
                      className="flex-1"
                      onClick={() => setConnectModalMember(member)}
                    >
                      <Handshake size={14} /> Connect
                    </Button>
                  )}

                  {currentRole === 'STUDENT' && member.role === 'ALUMNI' ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={member.mentorshipBadge === 'FULL' || member.mentorshipBadge === 'CLOSED'}
                      onClick={() => {
                        setMentorModalMember(member);
                        setMentorTopic(`Career Consultation in ${member.currentCompany || 'Industry'}`);
                        setMentorCareerGoal(`Pathways into ${member.position || 'Professional Engineering'}`);
                      }}
                      title={
                        member.mentorshipBadge === 'FULL'
                          ? 'Mentor currently at capacity'
                          : member.mentorshipBadge === 'CLOSED'
                          ? 'Mentor not accepting new mentees'
                          : 'Propose 1-on-1 Mentorship'
                      }
                    >
                      <Compass size={14} /> Mentor
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`${basePath}/messages?user=${member.id}`}>
                        <MessageSquare size={14} />
                      </Link>
                    </Button>
                  )}

                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`${basePath}/directory/${member.id}`}>Details</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 ? (
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">
                Page {meta.page} of {meta.totalPages} ({meta.total} members)
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
          ) : null}
        </div>
      )}

      {/* Connection Request Modal */}
      {connectModalMember ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95 space-y-4">
            <button
              type="button"
              onClick={() => setConnectModalMember(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <Avatar name={connectModalMember.name} src={connectModalMember.avatarUrl} />
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">Connect with {connectModalMember.name}</h3>
                <p className="text-xs text-slate-500 m-0">
                  {connectModalMember.position || 'Campus Member'} {connectModalMember.currentCompany ? `at ${connectModalMember.currentCompany}` : ''}
                </p>
              </div>
            </div>

            {connectError ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{connectError}</span>
              </div>
            ) : null}

            <form onSubmit={handleSendConnection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Include an introductory note (optional):
                </label>
                <textarea
                  rows={3}
                  value={connectMessage}
                  onChange={(e) => setConnectMessage(e.target.value)}
                  placeholder="Hi senior! I am an enrolled student in your department and would love to connect…"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setConnectModalMember(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={connectMutation.isPending}>
                  <Send size={14} /> {connectMutation.isPending ? 'Sending…' : 'Send Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Mentorship Request Modal */}
      {mentorModalMember ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95 space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setMentorModalMember(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <Avatar name={mentorModalMember.name} src={mentorModalMember.avatarUrl} />
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">Propose Mentorship to {mentorModalMember.name}</h3>
                <p className="text-xs text-slate-500 m-0">
                  {mentorModalMember.position} at {mentorModalMember.currentCompany || 'Institutional Alumni'}
                </p>
              </div>
            </div>

            {mentorError ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{mentorError}</span>
              </div>
            ) : null}

            <form onSubmit={handleSendMentorship} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Focus Area / Discussion Topic *
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
                  Your Career Goal *
                </label>
                <input
                  type="text"
                  required
                  value={mentorCareerGoal}
                  onChange={(e) => setMentorCareerGoal(e.target.value)}
                  placeholder="e.g. Securing a backend engineering internship in a top tech firm"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Personal Message & Specific Objectives *
                </label>
                <textarea
                  rows={3}
                  required
                  value={mentorMessage}
                  onChange={(e) => setMentorMessage(e.target.value)}
                  placeholder="Detail your background, questions on architecture, or what you hope to accomplish together…"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Medium
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
                    placeholder="e.g. 4 weeks (bi-weekly syncs)"
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
                  placeholder="e.g. Weekends after 6 PM, or Friday afternoons"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="ghost" size="sm" onClick={() => setMentorModalMember(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={mentorshipMutation.isPending}>
                  <Compass size={14} /> {mentorshipMutation.isPending ? 'Submitting…' : 'Submit Proposal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
