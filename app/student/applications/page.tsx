import { JobApplicationsView } from '@/features/jobs/job-applications-view';

export default function StudentApplicationsPage() {
  return <JobApplicationsView currentRole="STUDENT" basePath="/student" />;
}
