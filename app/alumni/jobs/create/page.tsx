import { JobCreateForm } from '@/features/jobs/job-create-form';

export default function AlumniJobCreatePage() {
  return <JobCreateForm currentRole="ALUMNI" basePath="/alumni" />;
}
