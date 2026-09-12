import type { Metadata } from 'next';

import { JobsBoard } from '@/features/jobs/jobs-board';

export const metadata: Metadata = { title: 'Job board', description: 'Verified opportunities shared by your alumni network.' };

export default function JobsPage() { return <JobsBoard />; }
