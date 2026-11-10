import { JobsListView } from '@/features/jobs/jobs-list-view';

export default function StudentJobsPage() {
  return <JobsListView currentRole="STUDENT" basePath="/student" />;
}
