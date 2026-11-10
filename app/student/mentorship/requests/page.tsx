import { MentorshipRequestsView } from '@/features/mentorship/mentorship-requests-view';

export default function StudentMentorshipRequestsPage() {
  return <MentorshipRequestsView currentRole="STUDENT" basePath="/student" />;
}
