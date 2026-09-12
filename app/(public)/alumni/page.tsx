import type { Metadata } from 'next';

import { AlumniDirectory } from '@/features/alumni/alumni-directory';

export const metadata: Metadata = {
  title: 'Alumni directory',
  description: 'Find verified alumni by experience, department, or batch.',
};

export default function AlumniPage() {
  return <AlumniDirectory />;
}
