'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Compass,
  GraduationCap,
  HeartHandshake,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

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
    <section className="page-shell" style={{ padding: '4rem 0' }}>
      <p className="eyebrow eyebrow--red">INSTITUTIONAL MENTORSHIP PROGRAM</p>
      <h1>Mentorship that moves careers forward.</h1>
      <p className="lede">
        Direct 1-on-1 guidance from established graduates. Receive portfolio feedback, mock interview insights, and real-world engineering roadmaps.
      </p>

      {submittedMessage && (
        <div
          style={{
            margin: '2rem 0',
            padding: '1rem 1.25rem',
            border: '2px solid var(--ink)',
            background: '#f0fdf4',
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={20} /> {submittedMessage}
        </div>
      )}

      {/* 3 Steps Overview */}
      <div
        style={{
          margin: '3rem 0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <div style={{ border: '2px solid var(--ink)', padding: '1.5rem', background: 'var(--paper)' }}>
          <p className="eyebrow">STEP 01</p>
          <h3 style={{ fontSize: '1.25rem', margin: '0.25rem 0 0.5rem' }}>Find by Focus Area</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: 0 }}>
            Browse verified mentors based on their real industry stack and technical specialization.
          </p>
        </div>

        <div style={{ border: '2px solid var(--ink)', padding: '1.5rem', background: 'var(--paper)' }}>
          <p className="eyebrow">STEP 02</p>
          <h3 style={{ fontSize: '1.25rem', margin: '0.25rem 0 0.5rem' }}>Send a Purposeful Ask</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: 0 }}>
            Share your specific challenge—whether it is code review, architecture guidance, or career direction.
          </p>
        </div>

        <div style={{ border: '2px solid var(--ink)', padding: '1.5rem', background: 'var(--paper)' }}>
          <p className="eyebrow">STEP 03</p>
          <h3 style={{ fontSize: '1.25rem', margin: '0.25rem 0 0.5rem' }}>Grow & Give Back</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: 0 }}>
            Connect 1-on-1, build a lifelong peer relationship, and pay it forward to the next graduating class.
          </p>
        </div>
      </div>

      {/* Track Filters */}
      <div style={{ marginBottom: '2rem' }}>
        <p className="eyebrow">FILTER BY SPECIALIZATION</p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {tracks.map((track) => (
            <button
              key={track}
              onClick={() => setSelectedTrack(track)}
              style={{
                border: '2px solid var(--ink)',
                background: selectedTrack === track ? 'var(--ink)' : 'var(--paper)',
                color: selectedTrack === track ? 'var(--paper)' : 'var(--ink)',
                padding: '0.45rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {track}
            </button>
          ))}
        </div>
      </div>

      {/* Mentors Grid */}
      <SectionHeading eyebrow="ACCREDITED MENTORS" title={`${filteredMentors.length} Mentors Available for Guidance`} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
        {filteredMentors.map((mentor) => (
          <article
            key={mentor.id}
            style={{
              border: '2px solid var(--ink)',
              padding: '1.5rem',
              background: 'var(--paper)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.3rem' }}>{mentor.name}</h3>
                  <p style={{ margin: '0.2rem 0', fontWeight: 600, color: 'var(--ink)' }}>{mentor.role}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>
                    {mentor.company} · {mentor.batch}
                  </p>
                </div>
                <div className="avatar">{mentor.name.slice(0, 2).toUpperCase()}</div>
              </div>

              <div style={{ margin: '1rem 0' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--quiet)', marginBottom: '0.35rem' }}>
                  FOCUS TOPICS
                </p>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {mentor.focusAreas.map((area) => (
                    <span
                      key={area}
                      style={{
                        border: '1px solid var(--line)',
                        padding: '0.2rem 0.45rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: 'var(--surface)',
                      }}
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Badge variant={mentor.available ? 'success' : 'neutral'}>
                  {mentor.available ? 'Open for Mentorship' : 'Cohort Full'}
                </Badge>
                <p style={{ fontSize: '0.75rem', color: 'var(--quiet)', margin: '0.25rem 0 0' }}>
                  {mentor.menteesCount} students guided
                </p>
              </div>

              {user ? (
                <Button
                  size="sm"
                  disabled={!mentor.available}
                  onClick={() => setRequestMentor(mentor)}
                >
                  Request Mentorship
                </Button>
              ) : (
                <Button asChild size="sm" variant="secondary">
                  <Link href="/login">Sign in to Ask</Link>
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Modal: Request Mentorship */}
      {requestMentor && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 100,
            display: 'grid',
            placeItems: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'var(--paper)',
              border: '3px solid var(--ink)',
              padding: '2rem',
              width: 'min(580px, 100%)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <p className="eyebrow">STRUCTURED MENTORSHIP</p>
                <h2 style={{ margin: 0 }}>Request Guidance from {requestMentor.name}</h2>
              </div>
              <button
                onClick={() => setRequestMentor(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={24} />
              </button>
            </div>

            <div
              style={{
                padding: '0.75rem 1rem',
                border: '2px solid var(--ink)',
                background: 'var(--surface)',
                fontSize: '0.825rem',
                marginBottom: '1.25rem',
              }}
            >
              <strong>Mentor Profile:</strong> {requestMentor.role} at {requestMentor.company} ({requestMentor.batch})
            </div>

            <form onSubmit={handleSendRequest}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  What specific area would you like guidance on?
                </label>
                <textarea
                  rows={4}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid var(--ink)',
                    background: 'var(--paper)',
                    fontFamily: 'inherit',
                    fontSize: '0.875rem',
                  }}
                  placeholder="Introduce yourself, your current semester or project, and what concrete question or feedback you are seeking."
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button type="submit" style={{ flex: 1 }}>
                  Deliver Mentorship Request
                </Button>
                <Button type="button" variant="secondary" onClick={() => setRequestMentor(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
