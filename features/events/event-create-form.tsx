'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, CheckCircle2, Send } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/dashboard/page-header';
import type { UserRole } from '@/types/domain';

interface EventCreateFormProps {
  currentRole: UserRole;
  basePath: string;
}

export function EventCreateForm({ currentRole, basePath }: EventCreateFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'In person' | 'Online Webinar' | 'Campus Workshop'>('In person');
  const [location, setLocation] = useState('University Auditorium · Khulna Campus');
  const [date, setDate] = useState('2026-12-20');
  const [time, setTime] = useState('3:00 PM – 5:30 PM');
  const [speaker, setSpeaker] = useState('');
  const [speakerRole, setSpeakerRole] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`${basePath}/events`);
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        backHref={`${basePath}/events`}
        backLabel="Back to Events"
        eyebrow="EVENT HOSTING & OVERSIGHT"
        title="Schedule Platform Event"
        description="Publish an official alumni conference, departmental webinar, or technical workshop to the university calendar."
      />

      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Event Title *"
            placeholder="e.g. Annual Alumni Career Symposium 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Gathering Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option value="In person">In person</option>
                <option value="Online Webinar">Online Webinar</option>
                <option value="Campus Workshop">Campus Workshop</option>
              </select>
            </div>

            <Input
              label="Venue or Virtual Stream URL *"
              placeholder="e.g. University Hall / Zoom Link"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date (YYYY-MM-DD) *"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <Input
              label="Time Range *"
              placeholder="e.g. 10:00 AM – 3:30 PM"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Keynote Speaker / Facilitator"
              placeholder="e.g. Dr. Kazi Alam"
              value={speaker}
              onChange={(e) => setSpeaker(e.target.value)}
            />

            <Input
              label="Speaker Role or Title"
              placeholder="e.g. VP of Engineering at Google"
              value={speakerRole}
              onChange={(e) => setSpeakerRole(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Event Abstract & Agenda Description *
            </label>
            <textarea
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail session key takeaways, attendee target audience, and prerequisite instructions…"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" size="sm" asChild>
              <Link href={`${basePath}/events`}>Cancel</Link>
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              <Send size={14} /> {isSubmitting ? 'Publishing Event…' : 'Publish to Calendar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
