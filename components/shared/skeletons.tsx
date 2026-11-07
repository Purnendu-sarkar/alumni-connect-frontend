import React from 'react';

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/3 rounded-sm bg-slate-200" />
          <div className="h-3 w-1/2 rounded-sm bg-slate-100" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded-sm bg-slate-100" />
        <div className="h-3 w-4/5 rounded-sm bg-slate-100" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-6 w-16 rounded-full bg-slate-100" />
        <div className="h-6 w-16 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

export function DirectoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function JobListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs animate-pulse">
          <div className="flex justify-between items-start">
            <div className="space-y-2 w-2/3">
              <div className="h-5 w-1/2 rounded-sm bg-slate-200" />
              <div className="h-4 w-1/3 rounded-sm bg-slate-100" />
            </div>
            <div className="h-6 w-20 rounded-full bg-slate-100" />
          </div>
          <div className="mt-4 flex gap-4">
            <div className="h-4 w-24 rounded-sm bg-slate-100" />
            <div className="h-4 w-24 rounded-sm bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white animate-pulse">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 flex-1 rounded-sm bg-slate-200" />
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-6 py-4 flex gap-4">
            {Array.from({ length: columns }).map((_, c) => (
              <div key={c} className="h-4 flex-1 rounded-sm bg-slate-100" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
