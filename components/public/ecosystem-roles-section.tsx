'use client';

import { Award, Briefcase, GraduationCap, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';

export function EcosystemRolesSection() {
  const roles = [
    {
      title: 'Student Workspace',
      role: 'STUDENT',
      icon: GraduationCap,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      description:
        'Access senior alumni mentors, request mock interviews, apply for alumni-referred internships, and gain candid industry perspective.',
      features: ['1-on-1 Career Mentorship', 'Curated Internship Board', 'Verified Campus Directory'],
    },
    {
      title: 'Alumni Workspace',
      role: 'ALUMNI',
      icon: Briefcase,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      description:
        'Share job openings directly with junior cohorts, guide students through career roadmaps, submit milestone success stories, and reconnect.',
      features: ['Post Career Openings', 'Mentorship Availability Desk', 'Success Story Publishing'],
    },
    {
      title: 'Moderator Oversight',
      role: 'MODERATOR',
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      description:
        'Ensure institutional safety and spam-free communication by reviewing submitted career listings, student verifications, and event schedules.',
      features: ['Job & Event Auditing', 'Content Moderation Queue', 'Institutional Integrity'],
    },
    {
      title: 'Super Admin Governance',
      role: 'SUPER_ADMIN',
      icon: Award,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      description:
        'Oversee university telemetry, manage department catalogs, broadcast urgent alerts, enforce security policies, and maintain audit logs.',
      features: ['Live Institutional Analytics', 'University Broadcast System', 'Complete Audit Logs'],
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="VERIFIED INSTITUTIONAL ECOSYSTEM"
        title="Purpose-Built Roles for Seamless Collaboration"
        description="Every account is authenticated against North Western University records with strictly partitioned, role-aware workspaces."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roles.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.role}
              className="flex flex-col justify-between p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold ${item.color}`}
                  >
                    <Icon size={24} />
                  </div>
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {item.role}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 m-0">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed m-0">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 space-y-1.5">
                {item.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-[11px] font-medium text-slate-700"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
