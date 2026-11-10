import { JobCreateForm } from '@/features/jobs/job-create-form';

export default function AlumniJobEditPage() {
  return <JobCreateForm currentRole="ALUMNI" basePath="/alumni" />;
}
