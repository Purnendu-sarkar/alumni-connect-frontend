'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  HelpCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Video,
  Calendar,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AddToCalendar } from './add-to-calendar';
import { rsvpToEvent, cancelRsvp } from '@/lib/api/events.api';
import type { EventDetail, RsvpStatus } from '@/types/domain';

interface RsvpControlPanelProps {
  event: EventDetail;
  accessToken: string | null;
  isAuthenticated: boolean;
  onAuthRequired?: () => void;
}

export function RsvpControlPanel({
  event,
  accessToken,
  isAuthenticated,
  onAuthRequired,
}: RsvpControlPanelProps) {
  const queryClient = useQueryClient();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const currentStatus = event.myRsvpStatus;
  const isFull = event.counts.isFull;

  const rsvpMutation = useMutation({
    mutationFn: async (status: 'GOING' | 'MAYBE' | 'NOT_GOING') => {
      if (!accessToken) throw new Error('Authentication required');
      return rsvpToEvent(accessToken, event.id, status);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', event.id] });
      queryClient.invalidateQueries({ queryKey: ['my-rsvps'] });

      const assigned = (data.data?.assignedStatus ?? 'NOT_GOING') as RsvpStatus;
      if (assigned === 'WAITLISTED') {
        setFeedbackMessage({
          type: 'info',
          text: 'Capacity reached. You have been placed on the priority waitlist.',
        });
      } else if (assigned === 'GOING') {
        setFeedbackMessage({
          type: 'success',
          text: 'Your RSVP has been confirmed! We look forward to seeing you.',
        });
      } else {
        setFeedbackMessage({
          type: 'info',
          text: `RSVP status updated to ${assigned}.`,
        });
      }
    },
    onError: (err: unknown) => {
      const error = err as Error;
      setFeedbackMessage({
        type: 'error',
        text: error?.message || 'Failed to update RSVP. Please try again.',
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error('Authentication required');
      return cancelRsvp(accessToken, event.id);
    },
    onSuccess: () => {
      setCancelModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', event.id] });
      queryClient.invalidateQueries({ queryKey: ['my-rsvps'] });
      setFeedbackMessage({
        type: 'info',
        text: 'Your RSVP has been cancelled.',
      });
    },
    onError: (err: unknown) => {
      const error = err as Error;
      setFeedbackMessage({
        type: 'error',
        text: error?.message || 'Failed to cancel RSVP.',
      });
    },
  });

  const handleAction = (status: 'GOING' | 'MAYBE' | 'NOT_GOING') => {
    if (!isAuthenticated) {
      if (onAuthRequired) onAuthRequired();
      return;
    }
    rsvpMutation.mutate(status);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
      {/* Header & Status Indicator */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 m-0">Event RSVP & Registration</h3>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            {event.rsvpDeadline
              ? `RSVP deadline: ${new Date(event.rsvpDeadline).toLocaleDateString()}`
              : 'RSVP is open until the event starts'}
          </p>
        </div>

        {currentStatus ? (
          <Badge
            className={`text-xs font-bold py-1 px-2.5 ${
              currentStatus === 'GOING'
                ? 'bg-emerald-600 text-white'
                : currentStatus === 'WAITLISTED'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-700 text-white'
            }`}
          >
            {currentStatus === 'GOING' && <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" />}
            {currentStatus === 'WAITLISTED' && <AlertCircle className="w-3.5 h-3.5 mr-1 inline" />}
            {currentStatus}
          </Badge>
        ) : (
          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            Not Registered
          </span>
        )}
      </div>

      {/* Online Access Card (Masked Privacy Enforcement) */}
      {event.onlineUrl && currentStatus === 'GOING' && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <Video className="w-4 h-4 text-emerald-600" />
            <span>Live Session Access Link</span>
          </div>
          <p className="text-xs text-emerald-700">
            You are confirmed! Access the meeting room using your verified attendee link below:
          </p>
          <Button
            asChild
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
          >
            <a href={event.onlineUrl} target="_blank" rel="noopener noreferrer">
              Join Virtual Session <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Button>
        </div>
      )}

      {event.onlineUrlMasked && (
        <div className="rounded-lg bg-blue-50/70 border border-blue-100 p-3 flex items-start gap-2.5">
          <Video className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-900 leading-relaxed m-0">
            <strong>Virtual Meeting Room:</strong> The online join URL will automatically unlock
            here once your RSVP status is confirmed to <strong>Going</strong>.
          </p>
        </div>
      )}

      {/* Waitlist Notice */}
      {isFull && !currentStatus && event.waitlistEnabled && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 m-0">
            Confirmed capacity is full ({event.counts.going} / {event.capacity}). Registering now will
            place you on the priority waitlist. If a spot opens up, you will be automatically promoted!
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <Button
          onClick={() => handleAction('GOING')}
          disabled={rsvpMutation.isPending || (isFull && !event.waitlistEnabled && currentStatus !== 'GOING')}
          className={`font-bold text-xs gap-1.5 ${
            currentStatus === 'GOING'
              ? 'bg-emerald-700 text-white hover:bg-emerald-800'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {currentStatus === 'GOING' ? 'Confirmed Going' : isFull ? 'Join Waitlist' : 'Going'}
        </Button>

        <Button
          variant="outline"
          onClick={() => handleAction('MAYBE')}
          disabled={rsvpMutation.isPending}
          className={`font-semibold text-xs gap-1.5 ${
            currentStatus === 'MAYBE' ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : ''
          }`}
        >
          <HelpCircle className="w-4 h-4 text-slate-500" />
          Maybe
        </Button>
      </div>

      {/* Secondary Controls: Add to Calendar & Cancel */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
        <AddToCalendar event={event} variant="outline" size="sm" />

        {currentStatus && currentStatus !== 'NOT_GOING' && currentStatus !== 'CANCELLED' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCancelModalOpen(true)}
            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          >
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Cancel RSVP
          </Button>
        )}
      </div>

      {/* Feedback Messages */}
      {feedbackMessage && (
        <div
          className={`p-3 rounded-lg text-xs font-medium border flex items-center justify-between ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : feedbackMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Event RSVP?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your RSVP for &ldquo;{event.title}&rdquo;? If you are
              currently confirmed, your spot will be immediately offered to the earliest person on the
              waitlist.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setCancelModalOpen(false)}
              disabled={cancelMutation.isPending}
            >
              Keep My RSVP
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Yes, Cancel RSVP'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
