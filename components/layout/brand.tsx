'use client';

import Link from 'next/link';
import Image from 'next/image';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface BrandProps {
  className?: string;
  variant?: 'light' | 'dark';
  stacked?: boolean;
}

export function Brand({ className, variant = 'light', stacked = false }: BrandProps) {
  const isDark = variant === 'dark';

  return (
    <Link
      href="/"
      className={cn(
        'inline-flex items-center gap-3 font-sans select-none group',
        className
      )}
      aria-label="AlumniConnect home"
    >
      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 shrink-0 group-hover:bg-blue-500 transition-colors relative overflow-hidden">
        <Image
          src="/images/logo.png"
          alt="Alumni Connect Icon"
          width={28}
          height={28}
          className="object-contain drop-shadow"
        />
        <GraduationCap size={22} strokeWidth={2.2} className="absolute text-white" />
      </div>
      {stacked ? (
        <span className="flex flex-col tracking-tight font-extrabold leading-tight">
          <span className={cn('text-base sm:text-lg font-black tracking-tight', isDark ? 'text-white' : 'text-slate-900')}>
            Alumni
          </span>
          <span className={cn('text-base sm:text-lg font-black tracking-tight', isDark ? 'text-sky-400' : 'text-blue-600')}>
            Connect
          </span>
        </span>
      ) : (
        <span className="flex items-center tracking-tight font-sans">
          <span className={cn('font-black text-sm sm:text-base tracking-tight', isDark ? 'text-white' : 'text-slate-900')}>
            Alumni
          </span>
          <span className={cn('font-black text-sm sm:text-base tracking-tight ml-1.5', isDark ? 'text-sky-400' : 'text-blue-600')}>
            Connect
          </span>
        </span>
      )}
    </Link>
  );
}
