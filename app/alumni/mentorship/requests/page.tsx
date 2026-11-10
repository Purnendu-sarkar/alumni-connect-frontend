import { MentorshipRequestsView } from '@/features/mentorship/mentorship-requests-view';

export default function AlumniMentorshipRequestsPage() {
  return <MentorshipRequestsView currentRole="ALUMNI" basePath="/alumni" />;
}
