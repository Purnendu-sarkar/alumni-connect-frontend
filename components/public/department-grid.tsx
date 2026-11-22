'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  BookOpen,
  Building2,
  Cpu,
  GraduationCap,
  PieChart,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { useAuthStore } from '@/store/auth-store';
import type { PublicDepartment } from '@/lib/api/public.api';

interface DepartmentGridProps {
  departments: PublicDepartment[];
}

function getDepartmentIcon(code: string) {
  switch (code.toUpperCase()) {
    case 'CSE':
      return Cpu;
    case 'BBA':
      return TrendingUp;
    case 'ENG':
      return BookOpen;
    case 'EEE':
      return Zap;
    case 'ECON':
      return PieChart;
    case 'CE':
      return Building2;
    default:
      return GraduationCap;
  }
}

function getDepartmentFocus(code: string): string {
  switch (code.toUpperCase()) {
    case 'CSE':
      return 'Cloud Systems, Full-Stack Architecture, AI & Cyber Defense';
    case 'BBA':
      return 'Corporate Finance, FMCG Brand Management & Supply Chain';
    case 'ENG':
      return 'Corporate Communications, Global Media & Academic Leadership';
    case 'EEE':
      return 'Power Systems, Telecom Modernization & SCADA Automation';
    case 'ECON':
      return 'Econometric Modeling, Monetary Policy & Market Intelligence';
    case 'CE':
      return 'Mega Infrastructure, Structural Engineering & Project Oversight';
    default:
      return 'Interdisciplinary Research & Academic Excellence';
  }
}

export function DepartmentGrid({ departments }: DepartmentGridProps) {
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthenticated = mounted && Boolean(user);
  const rolePrefix =
    user?.role === 'SUPER_ADMIN'
      ? '/admin'
      : user?.role === 'MODERATOR'
        ? '/moderator'
        : user?.role === 'ALUMNI'
          ? '/alumni'
          : '/student';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="ACADEMIC DEPARTMENTS & FOOTPRINT"
        title="Explore Cohorts by Academic Faculty"
        description="Discover how students and alumni across North Western University's six core faculties are leading in technology, business, and national infrastructure."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => {
          const Icon = getDepartmentIcon(dept.code);
          const focus = getDepartmentFocus(dept.code);

          const targetDir =
            user?.role === 'SUPER_ADMIN' || user?.role === 'MODERATOR'
              ? `${rolePrefix}/users?department=${encodeURIComponent(dept.name)}`
              : `${rolePrefix}/directory?department=${encodeURIComponent(dept.name)}`;

          const href = isAuthenticated
            ? targetDir
            : `/login?returnTo=${encodeURIComponent(`/student/directory?department=${encodeURIComponent(dept.name)}`)}`;

          return (
            <Card
              key={dept.id || dept.code}
              className="flex flex-col justify-between p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon size={22} />
                  </div>
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                    {dept.code}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors m-0">
                    {dept.name}
                  </h3>
                  {dept.faculty && (
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5 m-0">
                      {dept.faculty}
                    </p>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 m-0">
                  {focus}
                </p>

                {/* Member Metric Counter */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Users size={14} className="text-blue-500" />
                    <span>{dept.totalCount.toLocaleString()} Total Members</span>
                  </div>
                  <span className="text-[11px] text-slate-600">
                    {dept.studentCount} St · {dept.alumniCount} Al
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <Link
                  href={href}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 group/link transition-colors"
                >
                  <span>Browse Department Cohort</span>
                  <ArrowUpRight
                    size={14}
                    className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform"
                  />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
