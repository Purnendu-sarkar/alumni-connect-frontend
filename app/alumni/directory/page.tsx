import type { Metadata } from 'next';
import { AlumniDirectory } from '@/features/alumni/alumni-directory';

export const metadata: Metadata = {
  title: 'Alumni Directory — Alumni Desk',
  description: 'Search and connect with fellow alumni and university graduates.',
};

export default function AlumniDirectoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Alumni Directory & Network
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Browse fellow alumni, reach out to graduates across cohorts, and grow your university network.
        </p>
      </div>

      <AlumniDirectory />
    </div>
  );
}

