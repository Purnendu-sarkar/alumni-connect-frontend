import { PrivacySettingsView } from '@/features/settings/privacy-settings-view';

export default function AlumniPrivacySettingsPage() {
  return <PrivacySettingsView currentRole="ALUMNI" basePath="/alumni" />;
}
