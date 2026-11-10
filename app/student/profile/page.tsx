import { ProfileView } from '@/features/settings/profile-view';

export default function StudentProfilePage() {
  return <ProfileView currentRole="STUDENT" basePath="/student" />;
}
