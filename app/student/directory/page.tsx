import type { Metadata } from 'next';
import { AlumniDirectory } from '@/features/alumni/alumni-directory';

export const metadata: Metadata = {
  title: 'Alumni Directory — Student Desk',
  description: 'Search and connect with verified graduates from your university.',
};

export default function StudentDirectoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Verified Alumni Directory
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Find and reach out to alumni mentors across departments, industries, and graduation batches.
        </p>
      </div>

      <AlumniDirectory />
    </div>
  );
}

