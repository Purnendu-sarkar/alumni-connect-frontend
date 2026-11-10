import { cva, type VariantProps } from 'class-variance-authority';
import { cloneElement, isValidElement } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer shadow-xs select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 shadow-sm',
        secondary:
          'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 hover:border-slate-300',
        outline:
          'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-300',
        ghost:
          'text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-none border-transparent',
        destructive:
          'bg-rose-600 text-white hover:bg-rose-700 border border-rose-600 shadow-sm',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 text-xs',
        default: 'h-9 px-4 text-xs',
        lg: 'h-10 px-5 text-sm',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    children: ReactNode;
  };

export function Button({ className, variant, size, asChild, children, ...props }: ButtonProps) {
  if (asChild && isValidElement<{ className?: string }>(children)) {
    return cloneElement(children, {
      className: cn(buttonVariants({ variant, size }), children.props.className, className),
    });
  }

  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </button>
  );
}
