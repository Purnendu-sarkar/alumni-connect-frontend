'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Save, Send, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/dashboard/page-header';
import { MediaUploader } from '@/components/media/media-uploader';
import { RichTextEditor } from '@/components/shared/rich-text-editor';
import {
  createEvent,
  updateEvent,
  getAdminEventById,
  type CreateEventInput,
} from '@/lib/api/events.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole, EventMode, EventStatus } from '@/types/domain';

interface EventCreateFormProps {
  currentRole: UserRole;
  basePath: string;
  editId?: string;
}

export function EventCreateForm({ currentRole, basePath, editId }: EventCreateFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('CAREER');
  const [organizer, setOrganizer] = useState('');
  const [mode, setMode] = useState<EventMode>('IN_PERSON');
  const [venue, setVenue] = useState('');
  const [onlineUrl, setOnlineUrl] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [rsvpDeadline, setRsvpDeadline] = useState('');
  const [capacity, setCapacity] = useState<string>('');
  const [waitlistEnabled, setWaitlistEnabled] = useState(true);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bannerPublicId, setBannerPublicId] = useState<string | null>(null);
  const [publishImmediately, setPublishImmediately] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // If edit mode, load existing event details
  const { data: existingData, isLoading: isLoadingExisting } = useQuery({
    queryKey: ['admin-event-edit', editId, accessToken],
    queryFn: async () => {
      if (!editId || !accessToken) return null;
      const res = await getAdminEventById(accessToken, editId);
      return res.data;
    },
    enabled: Boolean(editId && accessToken),
  });

  useEffect(() => {
    if (existingData) {
      setTitle(existingData.title);
      setDescription(existingData.description);
      setCategory(existingData.category);
      setOrganizer(existingData.organizer || '');
      setMode(existingData.mode);
      setVenue(existingData.venue || '');
      setOnlineUrl(existingData.onlineUrl || '');
      setStartsAt(
        new Date(existingData.startsAt).toISOString().slice(0, 16)
      );
      setEndsAt(
        new Date(existingData.endsAt).toISOString().slice(0, 16)
      );
      if (existingData.rsvpDeadline) {
        setRsvpDeadline(
          new Date(existingData.rsvpDeadline).toISOString().slice(0, 16)
        );
      }
      setCapacity(existingData.capacity ? String(existingData.capacity) : '');
      setWaitlistEnabled(existingData.waitlistEnabled);
      setBannerUrl(existingData.bannerUrl || null);
      setBannerPublicId(existingData.bannerPublicId || null);
    }
  }, [existingData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error('Authentication required');

      const payload: CreateEventInput = {
        title: title.trim(),
        description: description.trim(),
        category,
        organizer: organizer.trim() || undefined,
        mode,
        venue: venue.trim() || undefined,
        onlineUrl: onlineUrl.trim() || undefined,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        rsvpDeadline: rsvpDeadline ? new Date(rsvpDeadline).toISOString() : undefined,
        capacity: capacity ? parseInt(capacity, 10) : null,
        waitlistEnabled,
        bannerUrl,
        bannerPublicId,
        status: (publishImmediately ? 'PUBLISHED' : editId ? existingData?.status : 'DRAFT') as EventStatus,
      };

      if (editId) {
        return updateEvent(accessToken, editId, payload);
      }
      return createEvent(accessToken, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      if (editId) {
        queryClient.invalidateQueries({ queryKey: ['event', editId] });
      }
      router.push(`${basePath}/events`);
    },
    onError: (err: unknown) => {
      const error = err as Error;
      setFormError(error?.message || 'Failed to save event. Please check required fields.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (new Date(endsAt) <= new Date(startsAt)) {
      setFormError('Event end time must be after start time.');
      return;
    }

    if (rsvpDeadline && new Date(rsvpDeadline) > new Date(startsAt)) {
      setFormError('RSVP deadline must be before the event starts.');
      return;
    }

    saveMutation.mutate();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        backHref={`${basePath}/events`}
        backLabel="Back to Events"
        eyebrow="EVENT HOSTING & OVERSIGHT"
        title={editId ? 'Edit Platform Event' : 'Schedule Platform Event'}
        description="Publish an official alumni conference, departmental webinar, or technical workshop to the university calendar."
      />

      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
        {formError && (
          <div className="mb-4">
            <FormAlert>{formError}</FormAlert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Banner Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Event Banner Image (16:9 Landscape)
            </label>
            <MediaUploader
              purpose="EVENT_BANNER"
              aspectRatio="16:9"
              currentUrl={bannerUrl}
              onUploadComplete={(asset) => {
                setBannerUrl(asset.url);
                setBannerPublicId(asset.publicId);
              }}
              onRemove={() => {
                setBannerUrl(null);
                setBannerPublicId(null);
              }}
            />
          </div>

          <Input
            label="Event Title *"
            placeholder="e.g. Annual Alumni Career Symposium 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={5}
            maxLength={120}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option value="CAREER">Career & Placement</option>
                <option value="ACADEMIC">Academic & Tech Symposium</option>
                <option value="ALUMNI_GALA">Alumni Gala & Reunion</option>
                <option value="WORKSHOP">Hands-on Workshop</option>
                <option value="GENERAL">General Campus Gathering</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Format / Mode *
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as EventMode)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option value="IN_PERSON">In Person</option>
                <option value="ONLINE">Online Virtual Session</option>
                <option value="HYBRID">Hybrid (In Person & Online)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Campus Venue"
              placeholder="e.g. University Grand Auditorium, Room 402"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
            />

            <Input
              label="Virtual Meeting / Stream URL"
              placeholder="e.g. https://meet.google.com/xyz"
              value={onlineUrl}
              onChange={(e) => setOnlineUrl(e.target.value)}
            />
          </div>

          <Input
            label="Organizer / Host"
            placeholder="e.g. Department of CSE Alumni Advisory Board"
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Date & Time *"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
            />

            <Input
              label="End Date & Time *"
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="RSVP Deadline (Optional)"
              type="datetime-local"
              value={rsvpDeadline}
              onChange={(e) => setRsvpDeadline(e.target.value)}
            />

            <Input
              label="Confirmed Attendee Capacity (Optional)"
              type="number"
              placeholder="Leave blank for unlimited"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={waitlistEnabled}
                onChange={(e) => setWaitlistEnabled(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Enable Automatic FIFO Waitlist
            </label>

            {!editId && (
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={publishImmediately}
                  onChange={(e) => setPublishImmediately(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Publish Immediately
              </label>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Event Description & Schedule *
            </label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Detailed description, keynote agenda, prerequisites, and registration instructions…"
              minHeight="180px"
              required
              helperText="Rich formatting supported. Switch between Write and Preview tabs to review."
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`${basePath}/events`)}
              disabled={saveMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5"
            >
              <Save className="w-4 h-4" />
              {saveMutation.isPending
                ? 'Saving Event...'
                : editId
                ? 'Update Event'
                : publishImmediately
                ? 'Publish Event'
                : 'Save as Draft'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
