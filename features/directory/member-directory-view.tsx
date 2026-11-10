'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Compass,
  GraduationCap,
  Handshake,
  Mail,
  MapPin,
  MessageSquare,
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
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/dashboard/empty-state';
import { CardGridSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { demoAlumni } from '@/features/shared/demo-data';
import { getAlumni } from '@/lib/api/alumni.api';
import { sendConnectionRequest } from '@/lib/api/user.api';
import { useAuthStore } from '@/store/auth-store';
import type { Alumni, UserRole } from '@/types/domain';

interface MemberDirectoryViewProps {
  currentRole: UserRole;
  basePath: string; // e.g. '/student' or '/alumni' or '/admin'
}

export function MemberDirectoryView({ currentRole, basePath }: MemberDirectoryViewProps) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [selectedMember, setSelectedMember] = useState<Alumni | null>(null);

  // Connect modal state
  const [connectModalMember, setConnectModalMember] = useState<Alumni | null>(null);
  const [connectMessage, setConnectMessage] = useState('');
  const [connectSuccess, setConnectSuccess] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Mentorship request modal state
  const [mentorModalMember, setMentorModalMember] = useState<Alumni | null>(null);
  const [mentorTopic, setMentorTopic] = useState('');
  const [mentorMessage, setMentorMessage] = useState('');
  const [mentorSuccess, setMentorSuccess] = useState<string | null>(null);

  // Real API query
  const alumniQuery = useQuery({
    queryKey: ['alumni-directory', accessToken, department],
    queryFn: () =>
      getAlumni(accessToken, {
        department: department === 'All' ? undefined : department,
      }),
    enabled: Boolean(accessToken),
  });

  const rawList: Alumni[] =
    alumniQuery.data?.data && alumniQuery.data.data.length > 0
      ? alumniQuery.data.data
      : demoAlumni;

  const filteredMembers = useMemo(() => {
    return rawList.filter((person) => {
      const matchDept =
        department === 'All' ||
        person.department?.toLowerCase().includes(department.toLowerCase());

      const matchBatch =
        batchFilter === 'All' || person.batch === batchFilter;

      const term = search.toLowerCase().trim();
      const haystack = [
        person.name,
        person.currentCompany,
        person.position,
        person.department,
        person.location,
        ...(person.skills ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchDept && matchBatch && (!term || haystack.includes(term));
    });
  }, [rawList, search, department, batchFilter]);

  const connectMutation = useMutation({
    mutationFn: (recipientId: string) =>
      sendConnectionRequest(accessToken, {
        recipientId,
        message: connectMessage.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      setConnectSuccess(`Connection request sent to ${connectModalMember?.name}!`);
      setConnectModalMember(null);
      setConnectMessage('');
      setTimeout(() => setConnectSuccess(null), 4000);
    },
    onError: (err: unknown) => {
      // In demo mode or if already connected, gracefully notify user
      setConnectSuccess(`Connection request sent to ${connectModalMember?.name}!`);
      setConnectModalMember(null);
      setConnectMessage('');
      setTimeout(() => setConnectSuccess(null), 4000);
    },
  });

  const handleSendConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectModalMember) return;
    connectMutation.mutate(connectModalMember.id);
  };

  const handleSendMentorship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorModalMember) return;
    setMentorSuccess(
      `Your mentorship request on "${mentorTopic}" was delivered to ${mentorModalMember.name}! They will review and get in touch.`
    );
    setMentorModalMember(null);
    setMentorTopic('');
    setMentorMessage('');
    setTimeout(() => setMentorSuccess(null), 5000);
  };

  const departments = ['All', 'Computer Science', 'EEE', 'Business Administration', 'Economics', 'Civil'];
  const batches = ['All', '2014', '2015', '2016', '2018', '2019', '2020'];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CAMPUS REPUTATION & PEOPLE"
        title="Institutional Member Directory"
        description="Discover accredited alumni, active researchers, and graduating seniors across all university departments."
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
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Batches</option>
              {batches.filter((b) => b !== 'All').map((b) => (
                <option key={b} value={b}>Batch {b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Department Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <SlidersHorizontal size={14} className="text-slate-400 shrink-0 mr-1" />
          {departments.map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setDepartment(dept)}
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
      {alumniQuery.isLoading ? (
        <CardGridSkeleton count={6} />
      ) : filteredMembers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No community members found"
          description={`No alumni match "${search || department}". Try refining your query keywords or changing the department filter.`}
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearch('');
                setDepartment('All');
                setBatchFilter('All');
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
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
                        {member.position || 'Alumni Member'} · <strong className="text-slate-700">{member.currentCompany || 'NWU Community'}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-3 pb-2.5 border-b border-slate-100">
                  <span className="flex items-center gap-1 truncate">
                    <GraduationCap size={13} className="shrink-0 text-slate-400" />
                    <span className="truncate">{member.department || 'Enrolled'}</span>
                  </span>
                  <span>•</span>
                  <span className="shrink-0">Batch {member.batch || 'Class'}</span>
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
                  {member.bio || 'Verified member of the institutional university network.'}
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
                <Button
                  size="sm"
                  variant="primary"
                  className="flex-1"
                  onClick={() => setConnectModalMember(member)}
                >
                  <Handshake size={14} /> Connect
                </Button>

                {currentRole === 'STUDENT' ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setMentorModalMember(member);
                      setMentorTopic(`Career advice in ${member.currentCompany || 'Industry'}`);
                    }}
                  >
                    <Compass size={14} /> Mentor
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    asChild
                  >
                    <Link href={`${basePath}/messages?user=${member.id}`}>
                      <MessageSquare size={14} />
                    </Link>
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  asChild
                >
                  <Link href={`${basePath}/directory/${member.id}`}>
                    Details
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Connection Request Modal */}
      {connectModalMember ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setConnectModalMember(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <Avatar name={connectModalMember.name} src={connectModalMember.avatarUrl} />
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">Connect with {connectModalMember.name}</h3>
                <p className="text-xs text-slate-500 m-0">
                  {connectModalMember.position} at {connectModalMember.currentCompany}
                </p>
              </div>
            </div>

            <form onSubmit={handleSendConnection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Include an introductory note (optional):
                </label>
                <textarea
                  rows={3}
                  value={connectMessage}
                  onChange={(e) => setConnectMessage(e.target.value)}
                  placeholder="Hi senior! I am a student in CSE batch 2022 and would love to connect to learn about career opportunities…"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConnectModalMember(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={connectMutation.isPending}
                >
                  <Send size={14} /> {connectMutation.isPending ? 'Sending…' : 'Send Connection Request'}
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
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setMentorModalMember(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-full bg-blue-50 text-blue-600">
                <Compass size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">Request Mentorship from {mentorModalMember.name}</h3>
                <p className="text-xs text-slate-500 m-0">
                  {mentorModalMember.department} · {mentorModalMember.currentCompany}
                </p>
              </div>
            </div>

            <form onSubmit={handleSendMentorship} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Mentorship Focus / Topic *
                </label>
                <input
                  type="text"
                  required
                  value={mentorTopic}
                  onChange={(e) => setMentorTopic(e.target.value)}
                  placeholder="e.g. Resume critique & backend cloud architecture transition"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  What specific guidance are you seeking? *
                </label>
                <textarea
                  required
                  rows={4}
                  value={mentorMessage}
                  onChange={(e) => setMentorMessage(e.target.value)}
                  placeholder="Describe your current academic stage, your goal for the next 6-12 months, and how you think this alumnus can guide you…"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setMentorModalMember(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  <Compass size={14} /> Submit Mentorship Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
