'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Film, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface MediaViewerProps {
  src?: string | null;
  alt?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'AUTO';
  posterUrl?: string | null;
  aspectRatio?: '1:1' | '16:9' | '4:3' | 'auto';
  className?: string;
  imageClassName?: string;
  videoClassName?: string;
  fallbackInitials?: string;
  priority?: boolean;
}

export function MediaViewer({
  src,
  alt = 'Media content',
  mediaType = 'AUTO',
  posterUrl,
  aspectRatio = 'auto',
  className,
  imageClassName,
  videoClassName,
  fallbackInitials,
  priority = false,
}: MediaViewerProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!src || hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-slate-100 text-slate-400 rounded-lg select-none',
          aspectRatio === '1:1' && 'aspect-square',
          aspectRatio === '16:9' && 'aspect-video',
          className,
        )}
      >
        {fallbackInitials ? (
          <span className="font-bold text-slate-600 text-sm uppercase">
            {fallbackInitials.slice(0, 2)}
          </span>
        ) : (
          <ImageOff size={22} className="text-slate-300" />
        )}
      </div>
    );
  }

  const isVideo =
    mediaType === 'VIDEO' ||
    (mediaType === 'AUTO' &&
      (src.includes('/video/') ||
        src.endsWith('.mp4') ||
        src.endsWith('.webm') ||
        src.endsWith('.mov')));

  const resolvedPoster =
    posterUrl ||
    (src.includes('cloudinary.com') && isVideo
      ? src.replace(/\.[a-zA-Z0-9]+$/, '.jpg')
      : undefined);

  if (isVideo) {
    return (
      <div
        className={cn(
          'relative rounded-xl overflow-hidden bg-black/90 flex items-center justify-center',
          aspectRatio === '16:9' && 'aspect-video',
          className,
        )}
      >
        <video
          src={src}
          poster={resolvedPoster}
          controls
          playsInline
          preload="metadata"
          className={cn('w-full h-full object-contain', videoClassName)}
          onError={() => setHasError(true)}
        >
          <track kind="captions" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute top-2 right-2 pointer-events-none p-1 bg-black/60 backdrop-blur-xs rounded text-white text-[10px] font-medium flex items-center gap-1">
          <Film size={11} /> Video
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-slate-100 flex items-center justify-center',
        aspectRatio === '1:1' && 'aspect-square',
        aspectRatio === '16:9' && 'aspect-video',
        className,
      )}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={priority}
        className={cn(
          'object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          imageClassName,
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
}
