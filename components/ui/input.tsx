import type { InputHTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ className, label, error, hint, id, ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label ? (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-700">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(
          'w-full px-3 py-2 text-xs font-medium rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-2xs',
          error ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 hover:border-slate-300',
          className
        )}
        {...props}
      />
      {error ? (
        <span className="text-[11px] text-rose-600 font-medium">{error}</span>
      ) : hint ? (
        <span className="text-[11px] text-slate-500">{hint}</span>
      ) : null}
    </div>
  );
}
