import { ProfileEditView } from '@/features/settings/profile-edit-view';

export default function ModeratorProfileEditPage() {
  return <ProfileEditView currentRole="MODERATOR" basePath="/moderator" />;
}
