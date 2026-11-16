import { JobCreateForm } from '@/features/jobs/job-create-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AlumniJobEditPage({ params }: PageProps) {
  const { id } = await params;
  return <JobCreateForm currentRole="ALUMNI" basePath="/alumni" editJobId={id} />;
}
