import { apiClient } from './client';

export type PrivacyScope = 'PUBLIC' | 'ALL_MEMBERS' | 'CONNECTIONS_ONLY' | 'ONLY_ME';

export interface PrivacySettingPayload {
  profileVisibility?: PrivacyScope;
  emailVisibility?: PrivacyScope;
  phoneVisibility?: PrivacyScope;
  locationVisibility?: PrivacyScope;
  careerVisibility?: PrivacyScope;
  educationVisibility?: PrivacyScope;
  skillsVisibility?: PrivacyScope;
  connectionsVisibility?: PrivacyScope;
  mentorshipVisibility?: PrivacyScope;
  searchVisibility?: PrivacyScope;
  messagingPermission?: PrivacyScope;
}

export interface PrivacySettingRecord extends PrivacySettingPayload {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export function getMyPrivacy(accessToken: string | null) {
  return apiClient<PrivacySettingRecord>('/privacy/me', { accessToken });
}

export function updateMyPrivacy(accessToken: string | null, data: PrivacySettingPayload) {
  return apiClient<PrivacySettingRecord>('/privacy/me', {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify(data),
  });
}
