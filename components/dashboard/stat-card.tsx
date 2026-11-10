'use client';

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  subtext?: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
  href?: string;
  actionLabel?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = '#2563EB',
  subtext,
  trend,
  href,
  actionLabel,
  className,
}: StatCardProps) {
  const content = (
    <article
      className={cn(
        'group relative p-5 bg-white rounded-xl border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300',
        href && 'cursor-pointer hover:-translate-y-0.5',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">{value}</span>
            {trend ? (
              <span
                className={cn(
                  'text-xs font-bold px-1.5 py-0.5 rounded',
                  trend.positive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50',
                )}
              >
                {trend.value}
              </span>
            ) : null}
          </div>
          {subtext ? <p className="text-xs text-slate-500 mt-1.5">{subtext}</p> : null}
        </div>
        <div
          className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0"
          style={{ color: iconColor }}
        >
          <Icon size={22} strokeWidth={2} />
        </div>
      </div>

      {href && actionLabel ? (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700">
          <span>{actionLabel}</span>
          <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      ) : null}
    </article>
  );

  if (href) {
    return <Link href={href} className="block no-underline">{content}</Link>;
  }

  return content;
}
