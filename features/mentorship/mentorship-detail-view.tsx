'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  GraduationCap,
  MessageSquare,
  Save,
  Send,
  UserCheck,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { demoMentorships, type MentorshipRecord } from '@/features/shared/demo-data';
import type { UserRole } from '@/types/domain';

interface MentorshipDetailViewProps {
  id: string;
  currentRole: UserRole;
  basePath: string;
}

export function MentorshipDetailView({ id, currentRole, basePath }: MentorshipDetailViewProps) {
  const session: MentorshipRecord =
    demoMentorships.find((m) => m.id === id) || {
      id,
      mentorId: 'mentor-1',
      mentorName: 'Tanvir Hossain',
      mentorCompany: 'Brain Station 23',
      mentorPosition: 'Engineering Manager',
      mentorDepartment: 'Computer Science & Engineering',
      menteeId: 'stu-1',
      menteeName: 'Purnendu Sarkar',
      menteeDepartment: 'Computer Science & Engineering',
      menteeBatch: '2022',
      status: 'ACTIVE',
      topic: 'Cloud Microservices & Production Go Architecture',
      message: 'Guidance on distributed systems architecture and system design interview readiness.',
      meetingSchedule: 'Alternate Thursdays at 8:00 PM via Google Meet',
      notes: 'Reviewed Docker containerization and Kubernetes pod orchestration. Next session: PostgreSQL indexing and query optimization.',
      createdAt: '2026-10-01',
    };

  const [notes, setNotes] = useState(session.notes || '');
  const [meetingSchedule, setMeetingSchedule] = useState(session.meetingSchedule || '');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveNotice('Workspace notes and meeting schedule updated successfully!');
    setTimeout(() => setSaveNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`${basePath}/mentorship`}
        backLabel="Back to Mentorship Desk"
        eyebrow="MENTORSHIP WORKSPACE"
        title={session.topic}
        description={`Collaboration between ${session.mentorName} (Mentor) and ${session.menteeName} (Mentee)`}
        badge={<StatusBadge status={session.status} />}
        actions={
          <Button size="sm" asChild>
            <Link href={`${basePath}/messages?user=${currentRole === 'STUDENT' ? session.mentorId : session.menteeId}`}>
              <MessageSquare size={14} /> Open Chat
            </Link>
          </Button>
        }
      />

      {saveNotice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{saveNotice}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Workspace Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notes and Milestones Form */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 m-0">
              Shared Notes & Discussion Objectives
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Meeting Frequency & Next Sync Link:
                </label>
                <input
                  type="text"
                  value={meetingSchedule}
                  onChange={(e) => setMeetingSchedule(e.target.value)}
                  placeholder="e.g. Every alternate Friday 7 PM · meet.google.com/xyz"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Session Log & Action Items:
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
                <Button type="submit" size="sm">
                  <Save size={14} /> Save Workspace Log
                </Button>
              </div>
            </form>
          </div>

          {/* Original Agreement Details */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 m-0">
              Original Mentorship Proposal
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed m-0 italic bg-slate-50 p-3.5 rounded-lg border-l-2 border-blue-500">
              &quot;{session.message}&quot;
            </p>
          </div>
        </div>

        {/* Participant Cards */}
        <div className="space-y-6">
          {/* Mentor Profile */}
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600">
              ACADEMIC MENTOR
            </span>
            <div className="flex items-center gap-3">
              <Avatar name={session.mentorName} />
              <div>
                <h4 className="text-sm font-bold text-slate-900 m-0">{session.mentorName}</h4>
                <p className="text-xs text-slate-500 m-0">{session.mentorPosition} at {session.mentorCompany}</p>
                <p className="text-[11px] text-slate-400 m-0 mt-0.5">{session.mentorDepartment}</p>
              </div>
            </div>
          </div>

          {/* Mentee Profile */}
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-600">
              STUDENT MENTEE
            </span>
            <div className="flex items-center gap-3">
              <Avatar name={session.menteeName} />
              <div>
                <h4 className="text-sm font-bold text-slate-900 m-0">{session.menteeName}</h4>
                <p className="text-xs text-slate-500 m-0">{session.menteeDepartment}</p>
                <p className="text-[11px] text-slate-400 m-0 mt-0.5">Batch {session.menteeBatch}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
