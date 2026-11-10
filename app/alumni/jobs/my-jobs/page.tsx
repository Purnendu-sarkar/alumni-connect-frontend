import { MyJobsView } from '@/features/jobs/my-jobs-view';

export default function AlumniMyJobsPage() {
  return <MyJobsView currentRole="ALUMNI" basePath="/alumni" />;
}
