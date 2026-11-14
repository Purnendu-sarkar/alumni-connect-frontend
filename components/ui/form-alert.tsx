import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

export function FormAlert({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-xs font-medium text-rose-800 flex items-start gap-2.5 shadow-2xs animate-in fade-in"
    >
      <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
      <div className="leading-relaxed flex-1">{children}</div>
    </div>
  );
}
