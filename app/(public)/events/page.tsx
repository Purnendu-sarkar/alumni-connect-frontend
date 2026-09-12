import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Events', description: 'Gatherings, lectures, and conversations for the AlumniConnect community.' };

const events = [
  { id: 'homecoming-2026', day: '12', month: 'OCT', title: 'Alumni Homecoming 2026', place: 'University Auditorium · Khulna', type: 'In person', copy: 'A day for returning, reconnecting, and imagining what we will build next.' },
  { id: 'career-stories', day: '26', month: 'OCT', title: 'Career Stories: The First Five Years', place: 'Online · 7:30 PM', type: 'Live session', copy: 'Six alumni share the decisions that shaped their early careers.' },
  { id: 'builders-breakfast', day: '09', month: 'NOV', title: 'Builders’ Breakfast', place: 'Campus Café · Khulna', type: 'In person', copy: 'For founders, aspiring founders, and people with a sketchbook full of ideas.' },
];

export default function EventsPage() {
  return <section className="page-shell events-page"><p className="eyebrow">THE GATHERING PLACE</p><h1>Show up for the conversation.</h1><p className="lede">The community gets sharper when we are in the same room.</p><div className="event-list">{events.map((event, index) => <article className={index === 0 ? 'event-card event-card--featured' : 'event-card'} key={event.id}><p className="event-date">{event.day}<br /><span>{event.month}</span></p><div><Badge variant={event.type === 'In person' ? 'success' : 'neutral'}>{event.type}</Badge><h2>{event.title}</h2><p><MapPin size={16} /> {event.place}</p><p>{event.copy}</p></div><Button asChild variant="ghost"><Link href={`/events/${event.id}`}>Details <ArrowUpRight size={17} /></Link></Button></article>)}</div><div className="event-cta"><CalendarDays size={30} /><div><p className="eyebrow">HOST A CONVERSATION</p><h2>Got an idea for the community?</h2></div><Button asChild><Link href="/register">Propose an event</Link></Button></div></section>;
}
