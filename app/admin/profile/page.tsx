import { ProfileView } from '@/features/settings/profile-view';

export default function AdminProfilePage() {
  return <ProfileView currentRole="SUPER_ADMIN" basePath="/admin" />;
}
