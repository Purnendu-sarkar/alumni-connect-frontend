import { JobsListView } from '@/features/jobs/jobs-list-view';

export default function AlumniJobsPage() {
  return <JobsListView currentRole="ALUMNI" basePath="/alumni" />;
}
