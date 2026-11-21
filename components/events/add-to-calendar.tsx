'use client';

import { Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { stripHtmlToPlainText } from '@/lib/utils/text';
import type { EventDetail, EventCard } from '@/types/domain';

interface AddToCalendarProps {
  event: EventDetail | EventCard;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

function formatDateToICS(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function generateICSContent(event: EventDetail | EventCard): string {
  const start = formatDateToICS(event.startsAt);
  const end = formatDateToICS(event.endsAt);
  const now = formatDateToICS(new Date().toISOString());

  const location = event.venue || event.onlineUrl || 'University Campus';
  const plainDesc = stripHtmlToPlainText(event.description || '');
  const cleanDescription = plainDesc.replace(/\r?\n/g, '\\n').replace(/,/g, '\\,');
  const cleanTitle = (event.title || '').replace(/,/g, '\\,');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AlumniConnect//University Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@alumni-connect.university`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${cleanTitle}`,
    `DESCRIPTION:${cleanDescription}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function AddToCalendar({
  event,
  variant = 'outline',
  size = 'sm',
  className = '',
}: AddToCalendarProps) {
  const handleDownload = () => {
    const icsData = generateICSContent(event);
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedTitle = (event.title || 'event')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .slice(0, 30);
    link.setAttribute('download', `${sanitizedTitle}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      className={`inline-flex items-center gap-1.5 ${className}`}
      title="Download .ics calendar invitation"
    >
      <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
      <span>Add to Calendar</span>
      <Download className="w-3.5 h-3.5 text-slate-400 shrink-0" />
    </Button>
  );
}
