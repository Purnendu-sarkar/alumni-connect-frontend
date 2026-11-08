'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';

import { getJobs, moderateJob } from '@/lib/api/jobs.api';
import { TableSkeleton } from '@/components/shared/skeletons';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import type { Job } from '@/types/domain';

export default function ModeratorJobsPage() {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [note, setNote] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['moderator', 'jobs'],
    queryFn: () => getJobs({ limit: 50 }),
  });

  const mutation = useMutation({
    mutationFn: ({
      jobId,
      status,
      note,
    }: {
      jobId: string;
      status: 'APPROVED' | 'REJECTED';
      note?: string;
    }) => moderateJob(jobId, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderator', 'jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setSelectedJob(null);
      setActionType(null);
      setNote('');
      setServerError(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to moderate job posting.';
      setServerError(msg);
    },
  });

  const handleConfirmAction = () => {
    if (!selectedJob || !actionType) return;
    mutation.mutate({
      jobId: selectedJob.id,
      status: actionType,
      note: note.trim() || undefined,
    });
  };

  const jobs: Job[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Opportunity Review Queue
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Moderate job postings submitted by alumni before they are visible to students.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
          {serverError}
        </div>
      )}

      {isLoading ? (
        <TableSkeleton rows={6} columns={4} />
      ) : isError ? (
        <ErrorState
          title="Failed to load job queue"
          message="Could not load submitted job listings for moderation."
          onRetry={() => refetch()}
        />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs to review"
          description="The moderation queue is currently clear."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Role Title & Company</th>
                <th className="py-3 px-4">Posted By</th>
                <th className="py-3 px-4">Location & Type</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{job.title}</div>
                    <div className="text-slate-500">{job.company}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900">{job.postedBy?.name ?? 'Alumnus'}</div>
                    <div className="text-slate-400">{job.postedBy?.currentCompany ?? ''}</div>
                  </td>
                  <td className="py-3 px-4 space-y-0.5">
                    <div>{job.location || 'Remote'}</div>
                    <div className="text-slate-400">{job.employmentType || 'Full-time'}</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedJob(job);
                          setActionType('APPROVED');
                        }}
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 font-semibold text-white hover:bg-emerald-700 shadow-xs"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Publish</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedJob(job);
                          setActionType('REJECTED');
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1 font-semibold text-red-600 hover:bg-red-50 shadow-xs"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedJob && actionType && (
        <ConfirmModal
          isOpen={true}
          title={actionType === 'APPROVED' ? 'Publish Opportunity' : 'Reject Opportunity'}
          message={
            actionType === 'APPROVED'
              ? `Are you sure you want to publish "${selectedJob.title}" by ${selectedJob.company}? It will be visible to all students immediately.`
              : `Are you sure you want to reject "${selectedJob.title}"?`
          }
          confirmLabel={actionType === 'APPROVED' ? 'Publish Listing' : 'Confirm Rejection'}
          variant={actionType === 'APPROVED' ? 'default' : 'danger'}
          isLoading={mutation.isPending}
          onConfirm={handleConfirmAction}
          onCancel={() => {
            setSelectedJob(null);
            setActionType(null);
          }}
        >
          {actionType === 'REJECTED' && (
            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Feedback for Submitter (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Please provide a verified application URL or more specific salary range."
                rows={2}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-red-500 focus:outline-none"
              />
            </div>
          )}
        </ConfirmModal>
      )}
    </div>
  );
}

