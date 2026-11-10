import { MentorshipHubView } from '@/features/mentorship/mentorship-hub-view';

export default function StudentMentorshipPage() {
  return <MentorshipHubView currentRole="STUDENT" basePath="/student" />;
}
