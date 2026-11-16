import Link from 'next/link';
import Image from 'next/image';
import {
  CalendarDays,
  Clock,
  MapPin,
  Video,
  Users,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { formatDate } from '@/lib/utils/format';
import type { EventCard as EventCardType } from '@/types/domain';

interface EventCardProps {
  event: EventCardType;
  basePath?: string;
}

export function EventCard({ event, basePath = '' }: EventCardProps) {
  const startDate = new Date(event.startsAt);
  const day = startDate.getDate().toString().padStart(2, '0');
  const month = startDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const time = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const detailUrl = `${basePath}/events/${event.id}`;

  const modeBadgeColors = {
    IN_PERSON: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ONLINE: 'bg-blue-50 text-blue-700 border-blue-200',
    HYBRID: 'bg-purple-50 text-purple-700 border-purple-200',
  }[event.mode] || 'bg-slate-100 text-slate-700 border-slate-200';

  const modeLabel = {
    IN_PERSON: 'In Person',
    ONLINE: 'Online Session',
    HYBRID: 'Hybrid',
  }[event.mode] || event.mode;

  return (
    <Card className="flex flex-col justify-between overflow-hidden border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 group bg-white">
      <div>
        {/* Banner header */}
        <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
          {event.bannerUrl ? (
            <Image
              src={event.bannerUrl}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
              <CalendarDays className="w-16 h-16 text-blue-400/30" />
            </div>
          )}

          {/* Date Badge Overlay */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg p-2 text-center shadow-md border border-slate-200/50 min-w-[50px]">
            <span className="block text-xs font-bold text-blue-600 uppercase tracking-wider">
              {month}
            </span>
            <span className="block text-lg font-black text-slate-900 leading-none">
              {day}
            </span>
          </div>

          {/* Category & Status Overlay */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
            <Badge className={`text-[10px] font-semibold border ${modeBadgeColors}`}>
              {modeLabel}
            </Badge>
            {event.myRsvpStatus && (
              <Badge
                className={`text-[10px] font-bold ${
                  event.myRsvpStatus === 'GOING'
                    ? 'bg-emerald-600 text-white'
                    : event.myRsvpStatus === 'WAITLISTED'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-600 text-white'
                }`}
              >
                {event.myRsvpStatus === 'GOING' && <CheckCircle2 className="w-3 h-3 mr-1 inline" />}
                {event.myRsvpStatus === 'WAITLISTED' && <AlertCircle className="w-3 h-3 mr-1 inline" />}
                {event.myRsvpStatus}
              </Badge>
            )}
          </div>
        </div>

        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
              {event.category}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {time}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {event.title}
          </h3>
        </CardHeader>

        <CardContent className="px-4 py-2 space-y-2.5">
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          <div className="pt-1 flex flex-col gap-1 text-xs text-slate-600">
            {event.venue && (
              <div className="flex items-center gap-1.5 text-slate-600 truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{event.venue}</span>
              </div>
            )}
            {event.mode !== 'IN_PERSON' && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <Video className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Online link provided to attendees</span>
              </div>
            )}
          </div>
        </CardContent>
      </div>

      <CardFooter className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>
            <strong className="text-slate-900 font-semibold">{event.goingCount}</strong>{' '}
            {event.capacity ? `/ ${event.capacity}` : 'attending'}
          </span>
          {event.isFull && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded ml-1">
              {event.waitlistEnabled ? 'Waitlist Open' : 'Full'}
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 h-auto"
        >
          <Link href={detailUrl} className="inline-flex items-center gap-1">
            Details <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
