'use client';

import { useState } from 'react';

interface SafeRemoteImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK_BANNER =
  'https://res.cloudinary.com/a1dumxpe/image/upload/alumni-connect/events/banners/banner_4.jpg';

export function SafeRemoteImage({
  src,
  alt = 'Image',
  className = '',
  fallbackSrc = DEFAULT_FALLBACK_BANNER,
  ...props
}: SafeRemoteImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  return (
    <img
      src={hasError || !currentSrc ? fallbackSrc : currentSrc}
      alt={alt}
      loading="lazy"
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setCurrentSrc(fallbackSrc);
        }
      }}
      className={className}
      {...props}
    />
  );
}
