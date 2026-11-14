import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, leftIcon, rightIcon, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? props.name ?? generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label ? (
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-800 select-none">
            {label}
          </label>
        ) : null}
        <div className="relative flex items-center w-full">
          {leftIcon ? (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center shrink-0">
              {leftIcon}
            </div>
          ) : null}
          <input
            id={inputId}
            ref={ref}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={cn(
              'w-full h-12 text-sm font-medium rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 transition-all shadow-2xs',
              'focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent',
              'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
              leftIcon ? 'pl-11' : 'pl-4',
              rightIcon ? 'pr-11' : 'pr-4',
              error
                ? 'border-rose-300 focus:ring-rose-500'
                : 'border-slate-200 hover:border-slate-300',
              className
            )}
            {...props}
          />
          {rightIcon ? (
            <div className="absolute right-3.5 flex items-center justify-center shrink-0">
              {rightIcon}
            </div>
          ) : null}
        </div>
        {error ? (
          <span id={errorId} className="text-[11px] text-rose-600 font-medium">
            {error}
          </span>
        ) : hint ? (
          <span id={hintId} className="text-[11px] text-slate-500">
            {hint}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
