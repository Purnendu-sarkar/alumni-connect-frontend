'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Trash2,
  UploadCloud,
  Video,
} from 'lucide-react';

import {
  confirmDirectMediaUpload,
  deleteMediaAsset,
  getMediaSignature,
  uploadMediaFile,
  type UploadPurpose,
} from '@/lib/api/media.api';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils/cn';

export interface MediaUploaderProps {
  purpose?: UploadPurpose;
  accept?: 'image' | 'video' | 'all';
  maxSizeMB?: number;
  aspectRatio?: '1:1' | '16:9' | 'free';
  currentUrl?: string | null;
  currentPublicId?: string | null;
  onUploadComplete: (asset: {
    url: string;
    publicId: string;
    mediaType: 'IMAGE' | 'VIDEO';
  }) => void;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
}

export function MediaUploader({
  purpose = 'PROFILE_PHOTO',
  accept = 'image',
  maxSizeMB,
  aspectRatio = '1:1',
  currentUrl,
  currentPublicId,
  onUploadComplete,
  onRemove,
  disabled = false,
  className,
}: MediaUploaderProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const effectiveMaxImageMB = maxSizeMB || 5;
  const effectiveMaxVideoMB = maxSizeMB || 50;

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (accept === 'image' && !isImage) {
      return { valid: false, error: 'Only image files (JPEG, PNG, WebP) are allowed.' };
    }
    if (accept === 'video' && !isVideo) {
      return { valid: false, error: 'Only video files (MP4, WebM) are allowed.' };
    }
    if (accept === 'all' && !isImage && !isVideo) {
      return { valid: false, error: 'Only images (JPEG, PNG, WebP) and videos (MP4, WebM) are allowed.' };
    }

    if (isImage && file.size > effectiveMaxImageMB * 1024 * 1024) {
      return {
        valid: false,
        error: `Image size exceeds the ${effectiveMaxImageMB}MB limit.`,
      };
    }
    if (isVideo && file.size > effectiveMaxVideoMB * 1024 * 1024) {
      return {
        valid: false,
        error: `Video size exceeds the ${effectiveMaxVideoMB}MB limit.`,
      };
    }

    return { valid: true };
  };

  const handleFileUpload = async (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const validation = validateFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file format.');
      return;
    }

    const localBlobUrl = URL.createObjectURL(file);
    setPreviewUrl(localBlobUrl);
    setIsUploading(true);
    setUploadProgress(10);

    const isVideo = file.type.startsWith('video/');

    try {
      if (isVideo) {
        // Direct Client-to-Cloudinary signed upload for videos
        const signatureRes = await getMediaSignature(accessToken, {
          purpose,
          resourceType: 'video',
        });

        if (!signatureRes.data) {
          throw new Error('Failed to obtain signed upload credentials.');
        }

        const creds = signatureRes.data;
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('api_key', creds.apiKey);
        uploadFormData.append('timestamp', String(creds.timestamp));
        uploadFormData.append('signature', creds.signature);
        uploadFormData.append('folder', creds.folder);

        const cloudinaryEndpoint = `https://api.cloudinary.com/v1_1/${creds.cloudName}/video/upload`;

        const cloudinaryResponse = await new Promise<{
          public_id: string;
          url: string;
          secure_url: string;
          format: string;
          bytes: number;
          width?: number;
          height?: number;
          duration?: number;
        }>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', cloudinaryEndpoint, true);

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 90);
              setUploadProgress(percent);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const parsed = JSON.parse(xhr.responseText);
                resolve(parsed);
              } catch {
                reject(new Error('Invalid Cloudinary response JSON.'));
              }
            } else {
              reject(new Error(`Cloudinary direct upload failed with status ${xhr.status}.`));
            }
          };

          xhr.onerror = () => reject(new Error('Network error during video upload.'));
          xhr.send(uploadFormData);
        });

        setUploadProgress(95);

        // Confirm direct upload with backend to persist UploadedFile record
        const confirmRes = await confirmDirectMediaUpload(accessToken, {
          publicId: cloudinaryResponse.public_id,
          url: cloudinaryResponse.url,
          secureUrl: cloudinaryResponse.secure_url,
          format: cloudinaryResponse.format,
          sizeBytes: cloudinaryResponse.bytes,
          width: cloudinaryResponse.width,
          height: cloudinaryResponse.height,
          durationSec: cloudinaryResponse.duration,
          purpose,
          mediaType: 'VIDEO',
        });

        setUploadProgress(100);
        setSuccessMessage('Video uploaded successfully!');
        if (confirmRes.data) {
          onUploadComplete({
            url: confirmRes.data.secureUrl,
            publicId: confirmRes.data.publicId,
            mediaType: 'VIDEO',
          });
        }
      } else {
        // Direct memory stream upload through Node.js backend (zero local disk)
        setUploadProgress(40);
        const uploadRes = await uploadMediaFile(accessToken, file, purpose);
        setUploadProgress(100);

        if (!uploadRes.data) {
          throw new Error('Upload failed. Please try again.');
        }

        setPreviewUrl(uploadRes.data.secureUrl);
        setSuccessMessage('Image uploaded successfully!');
        onUploadComplete({
          url: uploadRes.data.secureUrl,
          publicId: uploadRes.data.publicId,
          mediaType: 'IMAGE',
        });
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred during upload.',
      );
      setPreviewUrl(currentUrl || null);
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
        setSuccessMessage(null);
      }, 3500);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) setIsDragging(true);
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled || isUploading) return;

      const file = e.dataTransfer.files?.[0];
      if (file) handleFileUpload(file);
    },
    [disabled, isUploading],
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAsset = async () => {
    if (disabled || isUploading) return;
    setErrorMessage(null);

    if (currentPublicId) {
      try {
        await deleteMediaAsset(accessToken, currentPublicId);
      } catch {
        // Continue clearing client state even if network fails
      }
    }

    setPreviewUrl(null);
    if (onRemove) onRemove();
    setSuccessMessage('Media removed.');
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={
          accept === 'image'
            ? 'image/jpeg,image/png,image/webp'
            : accept === 'video'
            ? 'video/mp4,video/webm'
            : 'image/jpeg,image/png,image/webp,video/mp4,video/webm'
        }
        onChange={handleFileInputChange}
        disabled={disabled || isUploading}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && !isUploading && fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}
        className={cn(
          'relative border-2 border-dashed rounded-xl transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center p-6 text-center select-none',
          aspectRatio === '1:1' ? 'aspect-square max-w-[200px] mx-auto' : 'w-full min-h-[160px]',
          isDragging ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' : 'border-slate-300 hover:border-slate-400 bg-slate-50/60',
          disabled && 'opacity-60 cursor-not-allowed pointer-events-none',
        )}
      >
        {previewUrl ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {previewUrl.includes('/video/') || previewUrl.endsWith('.mp4') ? (
              <video
                src={previewUrl}
                className="w-full h-full object-cover rounded-lg pointer-events-none"
                muted
                playsInline
              />
            ) : (
              <img
                src={previewUrl}
                alt="Uploaded media preview"
                className="w-full h-full object-cover rounded-lg"
              />
            )}

            <div className="absolute inset-0 bg-slate-900/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg gap-2">
              <span className="text-white text-xs font-semibold px-2 py-1 bg-slate-900/70 rounded">
                Click to change
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 text-slate-500">
            <div className="p-3 bg-white rounded-full shadow-xs border border-slate-200 text-slate-700">
              {accept === 'video' ? <Video size={24} /> : <UploadCloud size={24} />}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 m-0">
                {isDragging ? 'Drop file here' : 'Click or drag & drop'}
              </p>
              <p className="text-[11px] text-slate-400 m-0 mt-0.5">
                {accept === 'image'
                  ? `PNG, JPG, WebP up to ${effectiveMaxImageMB}MB`
                  : accept === 'video'
                  ? `MP4, WebM up to ${effectiveMaxVideoMB}MB`
                  : `Images up to ${effectiveMaxImageMB}MB, Videos up to ${effectiveMaxVideoMB}MB`}
              </p>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-10">
            <Loader2 size={26} className="animate-spin text-blue-600 mb-2" />
            <p className="text-xs font-bold text-slate-800 m-0">Uploading...</p>
            <div className="w-full max-w-[140px] bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1">{uploadProgress}%</span>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      {previewUrl && !isUploading && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ImageIcon size={13} /> Replace
          </button>
          <button
            type="button"
            onClick={handleRemoveAsset}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 size={13} /> Remove
          </button>
        </div>
      )}

      {/* Feedback Alerts */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="flex items-start gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs">
          <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}
