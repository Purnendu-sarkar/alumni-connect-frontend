'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  CalendarDays,
  Plus,
  Search,
  Users,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import { EmptyState } from '@/components/dashboard/empty-state';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getAdminEvents,
  publishEvent,
  cancelEvent,
  completeEvent,
  duplicateEvent,
  deleteEvent,
  getEventAttendees,
} from '@/lib/api/events.api';
import { formatDate } from '@/lib/utils/format';
import { useAuthStore } from '@/store/auth-store';
import type { EventDetail, EventStatus, EventAttendee } from '@/types/domain';

export function AdminEventsView() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [statusFilter, setStatusFilter] = useState<'ALL' | EventStatus>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Modal states
  const [cancelModalEvent, setCancelModalEvent] = useState<EventDetail | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [attendeesModalEvent, setAttendeesModalEvent] = useState<EventDetail | null>(null);
  const [attendeeStatusFilter, setAttendeeStatusFilter] = useState('ALL');
  const [attendeeSearch, setAttendeeSearch] = useState('');

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin-events', accessToken, statusFilter, search, page],
    queryFn: async () => {
      if (!accessToken) return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } };
      return getAdminEvents(accessToken, {
        status: statusFilter,
        q: search.trim() || undefined,
        page,
        limit: 20,
      });
    },
    enabled: Boolean(accessToken),
  });

  const events = responseData?.data || [];
  const meta = responseData?.meta;

  // Attendees Query
  const { data: attendeesData, isLoading: isLoadingAttendees } = useQuery({
    queryKey: ['event-attendees', attendeesModalEvent?.id, attendeeStatusFilter, attendeeSearch],
    queryFn: async () => {
      if (!accessToken || !attendeesModalEvent) return { data: [], meta: { page: 1, limit: 50, total: 0, totalPages: 1 } };
      return getEventAttendees(
        accessToken,
        attendeesModalEvent.id,
        attendeeStatusFilter,
        1,
        50,
        attendeeSearch.trim() || undefined
      );
    },
    enabled: Boolean(accessToken && attendeesModalEvent),
  });

  const attendees = attendeesData?.data || [];

  // Mutations
  const publishMutation = useMutation({
    mutationFn: (id: string) => publishEvent(accessToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => completeEvent(accessToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => duplicateEvent(accessToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEvent(accessToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!cancelModalEvent) return;
      return cancelEvent(accessToken, cancelModalEvent.id, cancelReason);
    },
    onSuccess: () => {
      setCancelModalEvent(null);
      setCancelReason('');
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const statusBadge = (status: EventStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">PUBLISHED</Badge>;
      case 'DRAFT':
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200">DRAFT</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200">CANCELLED</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">COMPLETED</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="INSTITUTIONAL ADMINISTRATION"
        title="Event Operations Console"
        description="Oversee university gatherings, manage RSVP capacity and waitlists, publish sessions, and audit attendees."
        actions={
          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
            <Link href="/admin/events/create">
              <Plus size={14} className="mr-1" /> Create Event
            </Link>
          </Button>
        }
      />

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs">
        {(['ALL', 'DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => {
              setStatusFilter(st);
              setPage(1);
            }}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-colors whitespace-nowrap ${
              statusFilter === st
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {st === 'ALL' ? 'All Events' : st}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <Search size={16} className="text-slate-400 shrink-0" />
        <Input
          type="text"
          placeholder="Filter events by title, organizer, or venue…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="text-xs"
        />
      </div>

      {/* Events Table */}
      {isLoading ? (
        <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={Calendar}
          title="Failed to load events"
          description="Could not communicate with the administration service."
          action={<Button size="sm" onClick={() => refetch()}>Retry</Button>}
        />
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events in this view"
          description="Schedule a new gathering or switch status tabs to review other platform events."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Event & Category</th>
                  <th className="py-3.5 px-4">Date & Timing</th>
                  <th className="py-3.5 px-4">Mode / Venue</th>
                  <th className="py-3.5 px-4">RSVP / Capacity</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 line-clamp-1">{ev.title}</div>
                      <div className="text-[11px] text-blue-600 font-semibold mt-0.5">
                        {ev.category}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">
                        {new Date(ev.startsAt).toLocaleDateString()}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(ev.startsAt).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className="text-[10px] font-semibold mb-0.5">
                        {ev.mode}
                      </Badge>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        {ev.venue || ev.onlineUrl || '—'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">
                        {ev.counts.going} confirmed
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {ev.capacity ? `${ev.counts.spotsRemaining} spots left` : 'Unlimited'}
                        {ev.counts.waitlisted > 0 && ` · ${ev.counts.waitlisted} waitlisted`}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {statusBadge(ev.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Attendees */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setAttendeesModalEvent(ev)}
                          title="View attendee registrations"
                          className="h-8 px-2 text-slate-600 hover:text-blue-600"
                        >
                          <Users size={14} className="mr-1" /> Attendees
                        </Button>

                        {/* Publish */}
                        {ev.status === 'DRAFT' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => publishMutation.mutate(ev.id)}
                            disabled={publishMutation.isPending}
                            className="h-8 px-2.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-bold"
                          >
                            Publish
                          </Button>
                        )}

                        {/* Complete */}
                        {ev.status === 'PUBLISHED' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => completeMutation.mutate(ev.id)}
                            disabled={completeMutation.isPending}
                            title="Mark as completed"
                            className="h-8 px-2 text-slate-600 hover:text-blue-600"
                          >
                            <CheckCircle2 size={14} />
                          </Button>
                        )}

                        {/* Cancel Event */}
                        {ev.status === 'PUBLISHED' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setCancelModalEvent(ev);
                              setCancelReason('');
                            }}
                            title="Cancel event and notify attendees"
                            className="h-8 px-2 text-rose-600 hover:bg-rose-50"
                          >
                            <XCircle size={14} />
                          </Button>
                        )}

                        {/* Duplicate */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => duplicateMutation.mutate(ev.id)}
                          disabled={duplicateMutation.isPending}
                          title="Duplicate as draft"
                          className="h-8 px-2 text-slate-500 hover:text-slate-800"
                        >
                          <Copy size={14} />
                        </Button>

                        {/* Edit */}
                        <Button
                          size="sm"
                          variant="ghost"
                          asChild
                          title="Edit event"
                          className="h-8 px-2 text-slate-600 hover:text-blue-600"
                        >
                          <Link href={`/admin/events/${ev.id}/edit`}>
                            <Edit size={14} />
                          </Link>
                        </Button>

                        {/* Delete */}
                        {(ev.status === 'DRAFT' || ev.status === 'CANCELLED' || ev.status === 'COMPLETED') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${ev.title}"?`)) {
                                deleteMutation.mutate(ev.id);
                              }
                            }}
                            title="Delete event"
                            className="h-8 px-2 text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancel Event Dialog */}
      <Dialog open={Boolean(cancelModalEvent)} onOpenChange={(open) => !open && setCancelModalEvent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Platform Event</DialogTitle>
            <DialogDescription>
              Provide an official cancellation reason. All registered attendees ({cancelModalEvent?.counts.going || 0})
              will receive an immediate notification advisory.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="block text-xs font-semibold text-slate-700">
              Reason for Cancellation *
            </label>
            <Input
              placeholder="e.g. Inclement weather conditions on campus / Rescheduled"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="text-xs"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelModalEvent(null)}
              disabled={cancelMutation.isPending}
            >
              Keep Event
            </Button>
            <Button
              variant="destructive"
              disabled={cancelReason.trim().length < 5 || cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attendees Drawer Dialog */}
      <Dialog open={Boolean(attendeesModalEvent)} onOpenChange={(open) => !open && setAttendeesModalEvent(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Event Attendees: {attendeesModalEvent?.title}
            </DialogTitle>
            <DialogDescription>
              {attendeesModalEvent?.counts.going} Confirmed · {attendeesModalEvent?.counts.waitlisted} Waitlisted
            </DialogDescription>
          </DialogHeader>

          {/* Attendee Filters */}
          <div className="flex items-center gap-3 py-2">
            <Input
              placeholder="Search by name, email, or department…"
              value={attendeeSearch}
              onChange={(e) => setAttendeeSearch(e.target.value)}
              className="text-xs flex-1"
            />
            <select
              value={attendeeStatusFilter}
              onChange={(e) => setAttendeeStatusFilter(e.target.value)}
              className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="GOING">Confirmed Going</option>
              <option value="WAITLISTED">Waitlisted</option>
              <option value="MAYBE">Maybe</option>
            </select>
          </div>

          {/* Attendee List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
            {isLoadingAttendees ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : attendees.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No attendee registrations found matching current filters.
              </div>
            ) : (
              attendees.map((att: EventAttendee) => (
                <div key={att.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{att.user.name}</div>
                    <div className="text-slate-500 text-[11px]">
                      {att.user.email} {att.user.department ? `· ${att.user.department}` : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      className={`text-[10px] font-bold ${
                        att.status === 'GOING'
                          ? 'bg-emerald-100 text-emerald-800'
                          : att.status === 'WAITLISTED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {att.status}
                    </Badge>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(att.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setAttendeesModalEvent(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
