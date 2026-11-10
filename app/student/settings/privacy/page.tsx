import { PrivacySettingsView } from '@/features/settings/privacy-settings-view';

export default function StudentPrivacySettingsPage() {
  return <PrivacySettingsView currentRole="STUDENT" basePath="/student" />;
}
