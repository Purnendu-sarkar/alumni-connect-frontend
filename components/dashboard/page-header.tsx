'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  backHref,
  backLabel = 'Back',
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6 pb-5 border-b border-slate-200', className)}>
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider mb-2.5"
        >
          <ArrowLeft size={14} /> {backLabel}
        </Link>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="text-xs font-bold tracking-widest uppercase text-blue-600 mb-1 font-mono">
              {eyebrow}
            </p>
          ) : null}

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 m-0">
              {title}
            </h1>
            {badge}
          </div>

          {description ? (
            <p className="text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed m-0">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
