import Link from 'next/link';
import { ArrowUpRight, Building2 } from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import type { Alumni } from '@/types/domain';

export function AlumniCard({ alumnus }: { alumnus: Alumni }) {
  return (
    <Card className="flex flex-col justify-between group hover:shadow-md hover:border-blue-300 transition-all duration-200">
      <div>
        <CardHeader className="p-0 mb-4">
          <div className="flex items-center justify-between gap-3">
            <Avatar name={alumnus.name} src={alumnus.avatarUrl} size="md" />
            <Badge variant="success">Verified Alumnus</Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0 space-y-2">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors m-0">
            {alumnus.name}
          </h3>

          <p className="text-xs font-semibold text-slate-700 m-0">
            {alumnus.position ?? 'Alumni Member'}
          </p>

          <p className="text-xs text-slate-500 flex items-center gap-1.5 m-0">
            <Building2 size={13} className="shrink-0 text-slate-400" />
            <span className="truncate">{alumnus.currentCompany ?? 'Institutional Network'}</span>
          </p>

          {alumnus.bio && (
            <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed m-0">
              {alumnus.bio}
            </p>
          )}

          {alumnus.skills && alumnus.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-3">
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
        </CardContent>
      </div>

      <CardFooter className="p-0 pt-4 mt-4 flex items-center justify-between border-t border-slate-100">
        <Button variant="ghost" size="sm" asChild className="p-0 h-auto font-bold text-blue-600 hover:text-blue-800 hover:bg-transparent">
          <Link href={`/alumni/${alumnus.id}`} className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            View Profile <ArrowUpRight size={14} />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
