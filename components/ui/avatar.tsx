import Image from 'next/image';

import { cn } from '@/lib/utils/cn';

export function Avatar({ name, src, className }: { name: string; src?: string | null; className?: string }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className={cn('avatar', className)} aria-label={name} role="img">
      {src ? <Image src={src} alt="" width={48} height={48} /> : initials}
    </span>
  );
}
