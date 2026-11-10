import { cn } from '@/lib/utils/cn';

export function Avatar({
  name,
  src,
  size = 'md',
  className,
}: {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const initials = (name || 'User')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, '') ?? 'http://localhost:5000';
  const fullSrc = src?.startsWith('/') ? `${baseUrl}${src}` : src;

  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-800 font-bold shrink-0 select-none overflow-hidden border border-blue-200/60 shadow-2xs',
        sizeClasses,
        className
      )}
      aria-label={name}
      role="img"
    >
      {fullSrc ? (
        <img
          src={fullSrc}
          alt={name}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        initials
      )}
    </span>
  );
}
