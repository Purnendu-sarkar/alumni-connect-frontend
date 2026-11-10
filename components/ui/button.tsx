import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer shadow-xs select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 shadow-sm',
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
        link:
          'text-blue-600 underline-offset-4 hover:underline shadow-none border-transparent',
      },
      size: {
        default: 'h-9 px-4 text-xs',
        md: 'h-9 px-4 text-xs',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-5 text-sm',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
