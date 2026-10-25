import { cn } from '@/lib/utils/cn';

export function Avatar({ name, src, className }: { name: string; src?: string | null; className?: string }) {
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

  return (
    <span className={cn('avatar', className)} aria-label={name} role="img">
      {fullSrc ? (
        <img
          src={fullSrc}
          alt={name}
          className="avatar__img"
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
        />
      ) : (
        initials
      )}
    </span>
  );
}
