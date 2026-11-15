import { apiClient } from './client';

export type UploadPurpose =
  | 'PROFILE_PHOTO'
  | 'RESUME'
  | 'STORY_MEDIA'
  | 'EVENT_BANNER'
  | 'ANNOUNCEMENT_ATTACHMENT';

export interface UploadedFileResponse {
  id: string;
  userId: string;
  purpose: UploadPurpose;
  mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  durationSec?: number;
  createdAt: string;
}

export interface MediaSignatureResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  resourceType: 'image' | 'video' | 'raw' | 'auto';
}

export interface ConfirmMediaInput {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  durationSec?: number;
  purpose: UploadPurpose;
  mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
}

export function uploadMediaFile(
  accessToken: string | null,
  file: File,
  purpose: UploadPurpose = 'PROFILE_PHOTO',
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('purpose', purpose);

  return apiClient<UploadedFileResponse>('/media/upload', {
    method: 'POST',
    accessToken,
    body: formData,
  });
}

export function getMediaSignature(
  accessToken: string | null,
  input: {
    purpose: UploadPurpose;
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
    format?: string;
  },
) {
  return apiClient<MediaSignatureResponse>('/media/signature', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(input),
  });
}

export function confirmDirectMediaUpload(
  accessToken: string | null,
  payload: ConfirmMediaInput,
) {
  return apiClient<UploadedFileResponse>('/media/confirm', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(payload),
  });
}

export function deleteMediaAsset(accessToken: string | null, publicId: string) {
  return apiClient<{ success: boolean }>(`/media/${encodeURIComponent(publicId)}`, {
    method: 'DELETE',
    accessToken,
  });
}
