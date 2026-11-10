import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-blue-600 text-white shadow-xs hover:bg-blue-700',
        secondary:
          'border-transparent bg-slate-100 text-slate-800 hover:bg-slate-200',
        destructive:
          'border-transparent bg-rose-100 text-rose-700 border border-rose-200/60',
        outline:
          'text-slate-700 border border-slate-300',
        success:
          'border-emerald-200/80 bg-emerald-50 text-emerald-700 border',
        warning:
          'border-amber-200/80 bg-amber-50 text-amber-700 border',
        neutral:
          'border-slate-200 bg-slate-100 text-slate-700 border',
        error:
          'border-rose-200/80 bg-rose-50 text-rose-700 border',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
