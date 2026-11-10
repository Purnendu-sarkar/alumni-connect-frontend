import { MentorshipHubView } from '@/features/mentorship/mentorship-hub-view';

export default function AdminMentorshipPage() {
  return <MentorshipHubView currentRole="SUPER_ADMIN" basePath="/admin" />;
}
