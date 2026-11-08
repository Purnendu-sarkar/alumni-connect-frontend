'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  Compass,
  Download,
  GraduationCap,
  MapPin,
  Share2,
  Sparkles,
  Ticket,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';

export default function EventDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [isRsvpd, setIsRsvpd] = useState(false);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [showRsvpModal, setShowRsvpModal] = useState(false);

  const isHomecoming = id === 'homecoming-2026' || !id;
  const eventTitle = isHomecoming
    ? 'Grand Alumni Homecoming 2026: The Next Class'
    : 'Career Stories: Navigating Your First Five Years in Tech';

  const dateString = isHomecoming ? 'Sunday, 12 October 2026 · 10:00 AM - 05:00 PM' : 'Thursday, 26 October 2026 · 07:30 PM - 09:30 PM';
  const locationString = isHomecoming ? 'University Grand Auditorium · Khulna Main Campus' : 'Online Interactive Webcast (Zoom Pro)';

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRsvpd(true);
    setShowRsvpModal(false);
  };

  return (
    <section className="page-shell" style={{ padding: '3.5rem 0 6rem' }}>
      <Link href="/events" className="back-link" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
        <ArrowLeft size={16} /> Back to University Events
      </Link>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <Badge variant="error">{isHomecoming ? 'Flagship Campus Reunion' : 'Virtual Roundtable'}</Badge>
        <Badge variant="success">Confirmed Schedule</Badge>
      </div>

      <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', marginBottom: '1.25rem', lineHeight: 1.1 }}>
        {eventTitle}
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          margin: '2rem 0',
          border: '2px solid var(--ink)',
          background: 'var(--paper)',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <CalendarDays size={24} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--quiet)' }}>
              DATE & TIME
            </strong>
            <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{dateString}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <MapPin size={24} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--quiet)' }}>
              CAMPUS VENUE
            </strong>
            <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{locationString}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <Ticket size={24} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--quiet)' }}>
              ACCESSIBILITY
            </strong>
            <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Complimentary for Verified Members</span>
          </div>
        </div>
      </div>

      {isRsvpd && (
        <div
          style={{
            margin: '2rem 0',
            padding: '1.25rem 1.5rem',
            border: '2px solid #16a34a',
            background: '#f0fdf4',
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <strong style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={22} color="#16a34a" /> RSVP Confirmed! Your Gate Pass is Reserved.
            </strong>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
              We have dispatched your digital QR pass and attendance confirmation to your email.
            </p>
          </div>
          <Button size="sm" variant="secondary">
            <Download size={14} /> Download Digital Pass
          </Button>
        </div>
      )}

      {/* Main Split Content */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', marginTop: '2.5rem' }}>
        <div>
          <SectionHeading eyebrow="ABOUT THIS GATHERING" title="Bridging classes, sharing lessons." />
          <p className="lede" style={{ fontSize: '1.05rem', lineHeight: 1.65 }}>
            Come back to the lecture halls and campus lawns where your best questions first took shape. 
            A full-day flagship event featuring leadership roundtables, student-alumni mentorship circles, 
            networking luncheons, and an evening recognition ceremony for distinguished alumni.
          </p>

          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Attendees will have direct access to alumni founders, hiring managers from leading tech companies, 
            and faculty mentors. Student attendees can participate in on-the-spot resume reviews and career discussions.
          </p>

          <div style={{ marginTop: '2.5rem' }}>
            <SectionHeading eyebrow="PROGRAM AGENDA" title="Schedule of Activities" />
            <div style={{ border: '2px solid var(--ink)', background: 'var(--paper)' }}>
              {[
                { time: '10:00 AM', title: 'Registration & Welcome Coffee', desc: 'Badge collection and morning meet-and-greet at the main concourse.' },
                { time: '11:15 AM', title: 'Keynote: The Evolution of Tech Careers', desc: 'Delivered by distinguished alumni software architects and engineering leaders.' },
                { time: '01:00 PM', title: 'Grand Reunion Luncheon', desc: 'Departmental tables for networking across classes.' },
                { time: '02:30 PM', title: 'Mentorship Circles & Speed Networking', desc: '1-on-1 breakout conversations between final-year students and graduates.' },
                { time: '04:15 PM', title: 'Closing Ceremony & Photo Session', desc: 'Official batch photos and concluding remarks by the Vice Chancellor.' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1rem 1.25rem',
                    borderBottom: idx < 4 ? '1px solid var(--line)' : 'none',
                    display: 'flex',
                    gap: '1.5rem',
                  }}
                >
                  <span style={{ fontWeight: 700, fontFamily: 'monospace', minWidth: '75px', color: 'var(--red)' }}>
                    {item.time}
                  </span>
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>{item.title}</strong>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--muted)' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Sidebar Card */}
        <div>
          <div
            style={{
              border: '3px solid var(--ink)',
              padding: '2rem',
              background: 'var(--surface)',
              position: 'sticky',
              top: '90px',
            }}
          >
            <p className="eyebrow">PARTICIPATION PASS</p>
            <h3 style={{ fontSize: '1.6rem', margin: '0.25rem 0 1rem' }}>Reserve Your Seat</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Auditorium capacity is limited to 450 verified campus members. Advance reservation is mandatory for catering and security clearance.
            </p>

            {!isRsvpd ? (
              <Button size="lg" style={{ width: '100%' }} onClick={() => setShowRsvpModal(true)}>
                <Ticket size={16} /> RSVP For This Event
              </Button>
            ) : (
              <Button size="lg" variant="secondary" style={{ width: '100%' }} disabled>
                <CheckCircle2 size={16} /> Pass Already Reserved
              </Button>
            )}

            <div style={{ borderTop: '1px solid var(--line)', marginTop: '1.75rem', paddingTop: '1.25rem' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--quiet)' }}>
                ORGANIZER: Office of Alumni Relations & CSE Department
              </p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--quiet)' }}>
                ENQUIRIES: alumni.events@nwu.ac.bd
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RSVP Modal */}
      {showRsvpModal && (
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
              width: 'min(500px, 100%)',
            }}
          >
            <p className="eyebrow">RESERVE ATTENDANCE PASS</p>
            <h2 style={{ margin: '0.25rem 0 1rem' }}>Confirm Your Attendance</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
              Please enter your details to generate your official event entrance pass.
            </p>

            <form onSubmit={handleRsvpSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sadia Rahman"
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', border: '2px solid var(--ink)', background: 'var(--paper)' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  Institutional Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@nwu.ac.bd"
                  value={attendeeEmail}
                  onChange={(e) => setAttendeeEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', border: '2px solid var(--ink)', background: 'var(--paper)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button type="submit" style={{ flex: 1 }}>
                  Confirm My Seat
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowRsvpModal(false)}>
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
