import type { Metadata } from 'next';
import { JobsBoard } from '@/features/jobs/jobs-board';

export const metadata: Metadata = {
  title: 'Opportunity Board — Student Desk',
  description: 'Explore internships, graduate roles, and career opportunities posted by alumni.',
};

export default function StudentJobsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Opportunities & Internships
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Verified roles, graduate schemes, and internships shared by university alumni.
        </p>
      </div>

      <JobsBoard />
    </div>
  );
}

