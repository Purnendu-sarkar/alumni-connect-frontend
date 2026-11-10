import Link from 'next/link';
import { ArrowUpRight, Building2, GraduationCap } from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Alumni } from '@/types/domain';

export function AlumniCard({ alumnus }: { alumnus: Alumni }) {
  return (
    <article className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <Avatar name={alumnus.name} src={alumnus.avatarUrl} size="md" />
          <Badge variant="success">Verified Alumnus</Badge>
        </div>

        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors m-0">
          {alumnus.name}
        </h3>

        <p className="text-xs font-semibold text-slate-700 mt-1 m-0">
          {alumnus.position ?? 'Alumni Member'}
        </p>

        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 m-0">
          <Building2 size={13} className="shrink-0 text-slate-400" />
          <span className="truncate">{alumnus.currentCompany ?? 'Institutional Network'}</span>
        </p>

        {alumnus.bio && (
          <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed m-0">
            {alumnus.bio}
          </p>
        )}

        {alumnus.skills && alumnus.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
            {alumnus.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <Link
          href={`/alumni/${alumnus.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors group-hover:translate-x-0.5 transition-transform"
        >
          View Profile <ArrowUpRight size={14} />
        </Link>
      </div>
    </article>
  );
}
