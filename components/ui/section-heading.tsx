import type { ReactNode } from 'react';

export function SectionHeading({
  eyebrow,
  title,
  action,
  description,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
  description?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
      <div>
        {eyebrow && (
          <p className="text-xs font-bold tracking-widest uppercase text-blue-600 mb-1 font-mono">
            {eyebrow}
          </p>
        )}
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight m-0">
          {title}
        </h2>
        {description && (
          <p className="text-xs sm:text-sm text-slate-500 mt-1 m-0">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
