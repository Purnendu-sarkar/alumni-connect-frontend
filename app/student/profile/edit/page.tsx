import { ProfileEditView } from '@/features/settings/profile-edit-view';

export default function StudentProfileEditPage() {
  return <ProfileEditView currentRole="STUDENT" basePath="/student" />;
}
