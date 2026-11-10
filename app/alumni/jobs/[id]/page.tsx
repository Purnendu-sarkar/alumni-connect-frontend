import { JobDetailView } from '@/features/jobs/job-detail-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AlumniJobDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <JobDetailView id={id} currentRole="ALUMNI" basePath="/alumni" />;
}
