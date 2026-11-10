'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  BookOpen,
  Building2,
  CheckCircle2,
  Compass,
  GraduationCap,
  HeartHandshake,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { useAuthStore } from '@/store/auth-store';

interface Mentor {
  id: string;
  name: string;
  batch: string;
  role: string;
  company: string;
  department: string;
  focusAreas: string[];
  menteesCount: number;
  available: boolean;
}

const MENTORS: Mentor[] = [
  {
    id: 'mentor-1',
    name: 'Tahmina Rahman',
    batch: 'Class of 2019',
    role: 'Lead Software Architect',
    company: 'Apex Cloud Solutions',
    department: 'Computer Science & Engineering',
    focusAreas: ['System Design', 'Cloud Architecture', 'Career Pivots'],
    menteesCount: 12,
    available: true,
  },
  {
    id: 'mentor-2',
    name: 'Tanvir Hossain',
    batch: 'Class of 2021',
    role: 'Staff Platform Engineer',
    company: 'bKash Limited',
    department: 'Computer Science & Engineering',
    focusAreas: ['Backend Microservices', 'High-Throughput Systems', 'Interview Prep'],
    menteesCount: 8,
    available: true,
  },
  {
    id: 'mentor-3',
    name: 'Monirul Islam',
    batch: 'Class of 2020',
    role: 'Co-founder & CTO',
    company: 'RapidRoute Logistics',
    department: 'Electrical & Electronic Engineering',
    focusAreas: ['Startup Bootstrapping', 'Product Development', 'Technical Leadership'],
    menteesCount: 15,
    available: true,
  },
  {
    id: 'mentor-4',
    name: 'Farhana Yeasmin',
    batch: 'Class of 2022',
    role: 'Senior Product Designer',
    company: 'Pathao',
    department: 'Electrical & Electronic Engineering',
    focusAreas: ['Design Systems', 'UX Research', 'Portfolio Reviews'],
    menteesCount: 6,
    available: false,
  },
];

export default function MentorshipHubPage() {
  const user = useAuthStore((state) => state.user);
  const [selectedTrack, setSelectedTrack] = useState('All');
  const [requestMentor, setRequestMentor] = useState<Mentor | null>(null);
  const [requestNote, setRequestNote] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const tracks = ['All', 'System Design', 'Backend Microservices', 'Cloud Architecture', 'UX Research', 'Interview Prep'];

  const filteredMentors = MENTORS.filter((m) => {
    if (selectedTrack === 'All') return true;
    return m.focusAreas.includes(selectedTrack);
  });

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestMentor) return;
    setSubmittedMessage(`Your mentorship request was delivered to ${requestMentor.name}! Check your dashboard connections for their reply.`);
    setRequestMentor(null);
    setRequestNote('');
    setTimeout(() => setSubmittedMessage(null), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
      {/* Page Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold font-mono uppercase tracking-wider">
          <HeartHandshake size={14} /> Institutional Mentorship Program
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight m-0">
          Mentorship that moves careers forward.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed m-0">
          Direct 1-on-1 guidance from established graduates. Receive portfolio feedback, mock interview insights, and real-world engineering roadmaps from industry practitioners.
        </p>
      </div>

      {submittedMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center gap-3 text-sm font-semibold animate-in fade-in duration-200">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <span>{submittedMessage}</span>
        </div>
      )}

      {/* 3 Steps Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-blue-300 transition-all">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs font-mono mb-3">
            01
          </div>
          <h3 className="text-base font-bold text-slate-900 m-0">Find by Specialization</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed m-0">
            Browse verified mentors based on their real industry stack, company experience, and technical specialization.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-blue-300 transition-all">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs font-mono mb-3">
            02
          </div>
          <h3 className="text-base font-bold text-slate-900 m-0">Send a Focused Ask</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed m-0">
            Share your specific challenge—whether it is architecture guidance, mock interviews, or graduate school direction.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-blue-300 transition-all">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs font-mono mb-3">
            03
          </div>
          <h3 className="text-base font-bold text-slate-900 m-0">Grow & Pay It Forward</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed m-0">
            Connect 1-on-1, build a lifelong peer relationship, and eventually mentor the next graduating cohort.
          </p>
        </div>
      </div>

      {/* Track Filters */}
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono m-0">
          Filter by Technical Specialization
        </p>
        <div className="flex gap-2 flex-wrap">
          {tracks.map((track) => (
            <button
              key={track}
              onClick={() => setSelectedTrack(track)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                selectedTrack === track
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {track}
            </button>
          ))}
        </div>
      </div>

      {/* Mentors Grid */}
      <div>
        <SectionHeading
          eyebrow="ACCREDITED MENTORS"
          title={`${filteredMentors.length} Mentors Available for Guidance`}
          description="Alumni committed to answering questions and guiding campus students."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-6">
          {filteredMentors.map((mentor) => (
            <article
              key={mentor.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={mentor.name} size="md" />
                    <div>
                      <h3 className="text-base font-bold text-slate-900 m-0">{mentor.name}</h3>
                      <p className="text-xs text-slate-500 m-0">{mentor.batch} · {mentor.department}</p>
                    </div>
                  </div>
                  <Badge variant={mentor.available ? 'success' : 'neutral'}>
                    {mentor.available ? 'Available' : 'Cohort Full'}
                  </Badge>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
                  <p className="text-xs font-bold text-slate-800 m-0">{mentor.role}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 m-0">
                    <Building2 size={13} className="text-slate-400" />
                    {mentor.company}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono m-0">
                    Focus Areas
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {mentor.focusAreas.map((area) => (
                      <span
                        key={area}
                        className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-[11px] font-semibold"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <span className="text-xs text-slate-500">
                  <strong>{mentor.menteesCount}</strong> students guided
                </span>

                {user ? (
                  <Button
                    size="sm"
                    disabled={!mentor.available}
                    onClick={() => setRequestMentor(mentor)}
                  >
                    Request Guidance
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="outline">
                    <Link href="/login">Sign in to Ask</Link>
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Modal: Request Mentorship */}
      {requestMentor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 font-mono">
                  STRUCTURED MENTORSHIP
                </span>
                <h3 className="text-lg font-bold text-slate-900 m-0">
                  Request Guidance from {requestMentor.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRequestMentor(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 space-y-1">
              <p className="font-semibold m-0">Mentor Credentials:</p>
              <p className="m-0 text-slate-700">
                {requestMentor.role} at <strong>{requestMentor.company}</strong> ({requestMentor.batch})
              </p>
            </div>

            <form onSubmit={handleSendRequest} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  What specific area would you like guidance on?
                </label>
                <textarea
                  rows={4}
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  placeholder="Introduce yourself, your current academic semester, and what concrete question or challenge you are seeking feedback on."
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setRequestMentor(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Deliver Mentorship Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
