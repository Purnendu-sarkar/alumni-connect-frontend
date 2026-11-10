import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Clock, MapPin, Sparkles, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';

export const metadata: Metadata = {
  title: 'Campus Events',
  description: 'Gatherings, lectures, and symposiums for the AlumniConnect community.',
};

const events = [
  {
    id: 'homecoming-2026',
    day: '12',
    month: 'DEC',
    year: '2026',
    title: 'Annual Alumni Homecoming & Tech Symposium',
    place: 'University Grand Auditorium · Khulna',
    time: '09:30 AM – 06:00 PM',
    type: 'In person',
    featured: true,
    copy: 'A landmark gathering returning alumni to campus for keynote addresses, engineering research showcases, department visits, and the annual alumni gala dinner.',
  },
  {
    id: 'career-stories',
    day: '26',
    month: 'NOV',
    year: '2026',
    title: 'Career Stories: Navigating Your First 3 Years in Tech',
    place: 'Online · Zoom Virtual Hall',
    time: '07:30 PM – 09:00 PM',
    type: 'Live Session',
    copy: 'Four distinguished alumni share the critical technical, managerial, and career roadmap decisions that shaped their early trajectories.',
  },
  {
    id: 'builders-breakfast',
    day: '09',
    month: 'DEC',
    year: '2026',
    title: 'Founders & Builders Breakfast Roundtable',
    place: 'University Innovation Lab · Khulna',
    time: '10:00 AM – 12:30 PM',
    type: 'In person',
    copy: 'An intimate networking session for alumni founders, CTOs, and student innovators discussing product architectures, early funding, and local hiring.',
  },
];

export default function EventsPage() {
  const featured = events[0];
  const upcoming = events.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold font-mono uppercase tracking-wider">
          <CalendarDays size={14} /> The Gathering Place
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight m-0">
          Show up for the conversation.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed m-0">
          The community grows stronger when we share the same room. Explore official convocations, tech symposiums, and informal regional meetups.
        </p>
      </div>

      {/* Featured Event Card */}
      {featured && (
        <div className="bg-linear-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 flex items-center gap-1">
                  <Sparkles size={12} /> Key Event of the Year
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                  {featured.type}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight m-0">
                {featured.title}
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed m-0">
                {featured.copy}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} className="text-blue-400" /> {featured.place}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock size={15} className="text-blue-400" /> {featured.time}
                </span>
              </div>
            </div>

            {/* Date Box & Action */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 text-center flex flex-col items-center justify-center min-w-[200px] w-full lg:w-auto shrink-0 space-y-4">
              <div>
                <span className="block text-4xl sm:text-5xl font-extrabold text-white font-mono">
                  {featured.day}
                </span>
                <span className="block text-xs font-bold uppercase tracking-widest text-blue-300 font-mono mt-1">
                  {featured.month} {featured.year}
                </span>
              </div>

              <Button asChild size="default" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold">
                <Link href={`/events/${featured.id}`}>
                  RSVP & Passes <ArrowUpRight size={14} />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Events Grid */}
      <div>
        <SectionHeading
          eyebrow="SCHEDULED CONVERSATIONS"
          title="Upcoming Campus & Virtual Sessions"
          description="Mark your calendar and engage with speakers and participants."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {upcoming.map((event) => (
            <article
              key={event.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center text-center shrink-0">
                  <span className="text-xl font-extrabold text-blue-700 font-mono leading-none">
                    {event.day}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 font-mono mt-0.5">
                    {event.month}
                  </span>
                </div>

                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={event.type === 'In person' ? 'success' : 'neutral'}>
                      {event.type}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 m-0">
                    {event.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed m-0">
                    {event.copy}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-2">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" /> {event.place}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/events/${event.id}`} className="inline-flex items-center gap-1">
                    Event Details <ArrowUpRight size={13} />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Propose an Event CTA */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-xl border border-slate-200 text-blue-600 shrink-0">
            <Users size={24} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-mono">
              HOST A SESSION
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5 m-0">
              Have an idea for a campus or regional meetup?
            </h3>
            <p className="text-xs text-slate-500 mt-1 m-0">
              Submit an event proposal to the alumni relations committee for campus room booking and co-promotion.
            </p>
          </div>
        </div>

        <Button asChild size="sm" className="shrink-0">
          <Link href="/register">Propose an Event</Link>
        </Button>
      </div>
    </div>
  );
}
