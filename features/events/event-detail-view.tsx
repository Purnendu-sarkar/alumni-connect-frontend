'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Share2,
  Sparkles,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/page-header';
import { demoEvents, type EventRecord } from '@/features/shared/demo-data';
import type { UserRole } from '@/types/domain';

interface EventDetailViewProps {
  id: string;
  currentRole: UserRole;
  basePath: string;
}

export function EventDetailView({ id, currentRole, basePath }: EventDetailViewProps) {
  const event: EventRecord =
    demoEvents.find((e) => e.id === id) || {
      id,
      title: 'Campus Career & Networking Symposium',
      type: 'In person',
      location: 'University Auditorium · Khulna Campus',
      date: '2026-12-12',
      time: '10:00 AM – 4:00 PM',
      day: '12',
      month: 'DEC',
      description:
        'A full day of engaging career keynotes, technical panels, and networking clinics connecting students with industry leaders.',
      attendeesCount: 150,
      category: 'CAREER',
      speaker: 'Faculty & Alumni Council',
      speakerRole: 'University Community',
      isRegistered: false,
    };

  const [isRegistered, setIsRegistered] = useState(event.isRegistered || false);
  const [attendees, setAttendees] = useState(event.attendeesCount);
  const [notice, setNotice] = useState<string | null>(null);

  const toggleRSVP = () => {
    setIsRegistered(!isRegistered);
    setAttendees((prev) => (isRegistered ? prev - 1 : prev + 1));
    setNotice(
      !isRegistered
        ? 'RSVP Confirmed! Calendar invitation has been synced to your student email.'
        : 'RSVP withdrawn.'
    );
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`${basePath}/events`}
        backLabel="Back to Events"
        eyebrow="EVENT DETAILS"
        title={event.title}
        description={`${event.location} · ${event.date} (${event.time})`}
        badge={
          <Badge variant={event.type === 'In person' ? 'success' : 'neutral'}>
            {event.type}
          </Badge>
        }
        actions={
          <Button
            size="sm"
            variant={isRegistered ? 'secondary' : 'primary'}
            onClick={toggleRSVP}
          >
            {isRegistered ? 'Registered (Cancel)' : 'Confirm RSVP'}
          </Button>
        }
      />

      {notice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 m-0">
              About This Gathering
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed m-0 whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          {event.speaker ? (
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 m-0">
                Featured Keynote Speaker
              </h3>
              <p className="text-base font-bold text-slate-900 m-0">{event.speaker}</p>
              <p className="text-xs text-slate-500 m-0">{event.speakerRole}</p>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 m-0 pb-3 border-b border-slate-100">
              Event Logistics
            </h3>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Date & Timing</p>
              <p className="font-semibold text-slate-800 m-0 mt-0.5">{event.date} · {event.time}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Venue / Platform</p>
              <p className="font-semibold text-slate-800 m-0 mt-0.5">{event.location}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Attendance Count</p>
              <p className="font-semibold text-slate-800 m-0 mt-0.5">{attendees} Community Members</p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Admission & Eligibility</p>
              <p className="font-semibold text-emerald-700 m-0 mt-0.5">Free for Verified Campus Community</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
