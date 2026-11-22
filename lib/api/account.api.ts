import { apiClient } from './client';

export interface DataExportReceipt {
  id: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export interface AccountSummary {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  verified: boolean;
  verificationStatus: string;
  university: {
    id: string;
    name: string;
    domain: string;
  };
  deactivatedAt: string | null;
  deletionRequestedAt: string | null;
  createdAt: string;
  recentExports: DataExportReceipt[];
}

export interface DataExportResult {
  exportId: string;
  expiresAt: string;
  data: Record<string, unknown>;
}

export function getAccountSummary(accessToken: string | null) {
  return apiClient<AccountSummary>('/account', {
    method: 'GET',
    accessToken,
  });
}

export function requestDataExport(accessToken: string | null) {
  return apiClient<DataExportResult>('/account/data-export', {
    method: 'POST',
    accessToken,
  });
}

export function deactivateAccount(accessToken: string | null, currentPassword: string) {
  return apiClient<{ success: boolean }>('/account/deactivate', {
    method: 'POST',
    accessToken,
    body: JSON.stringify({ currentPassword }),
  });
}

export function deleteAccount(
  accessToken: string | null,
  currentPassword: string,
  confirmText: string,
) {
  return apiClient<{ success: boolean; gracePeriodDays: number }>('/account/delete', {
    method: 'POST',
    accessToken,
    body: JSON.stringify({ currentPassword, confirmText }),
  });
}
