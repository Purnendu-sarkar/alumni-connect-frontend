'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 border-2 border-dashed border-slate-200 bg-slate-50/50 shadow-none hover:border-slate-300',
        className
      )}
    >
      <div className="p-3.5 rounded-full bg-slate-100 text-slate-500 mb-3.5">
        <Icon size={28} strokeWidth={1.8} />
      </div>
      <h3 className="text-base font-bold text-slate-800 m-0 mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md m-0 mb-5 leading-relaxed">
        {description}
      </p>
      {action}
    </Card>
  );
}
