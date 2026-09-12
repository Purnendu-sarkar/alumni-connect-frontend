import Link from 'next/link';
import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isHomecoming = id === 'homecoming-2026';
  const title = isHomecoming ? 'Alumni Homecoming 2026' : 'Community gathering';
  return <section className="page-shell event-detail"><Link href="/events" className="back-link"><ArrowLeft size={16} /> Back to events</Link><p className="eyebrow">COMMUNITY GATHERING</p><h1>{title}</h1><div className="event-detail__meta"><p><CalendarDays size={18} /> Sunday, 12 October 2026 · 10:00 AM</p><p><MapPin size={18} /> University Auditorium · Khulna</p></div><div className="event-detail__content"><p className="lede">Come back to the rooms where your best questions first took shape.</p><p>A day for conversations across classes, shared lessons, and the next generation of people building meaningful work. The programme includes alumni talks, mentoring circles, campus tours, and an evening reception.</p><Button asChild><Link href="/register">Reserve your place</Link></Button></div></section>;
}
