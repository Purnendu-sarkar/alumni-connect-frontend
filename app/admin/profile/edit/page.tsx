import { ProfileEditView } from '@/features/settings/profile-edit-view';

export default function AdminProfileEditPage() {
  return <ProfileEditView currentRole="SUPER_ADMIN" basePath="/admin" />;
}
