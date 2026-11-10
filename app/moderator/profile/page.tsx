import { ProfileView } from '@/features/settings/profile-view';

export default function ModeratorProfilePage() {
  return <ProfileView currentRole="MODERATOR" basePath="/moderator" />;
}
