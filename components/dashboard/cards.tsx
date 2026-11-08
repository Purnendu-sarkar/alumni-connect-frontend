import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ChevronRight, CircleDot, Sparkles, type LucideIcon } from 'lucide-react';

export interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  href?: string;
  hrefLabel?: string;
  colorScheme?: 'blue' | 'emerald' | 'amber' | 'indigo' | 'purple';
}

const colorMap = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', link: 'text-blue-600 hover:text-blue-700' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', link: 'text-emerald-600 hover:text-emerald-700' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', link: 'text-amber-600 hover:text-amber-700' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', link: 'text-indigo-600 hover:text-indigo-700' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', link: 'text-purple-600 hover:text-purple-700' },
};

export function StatsCard({
  label,
  value,
  icon: Icon,
  subtext,
  href,
  hrefLabel = 'View details →',
  colorScheme = 'blue',
}: StatsCardProps) {
  const colors = colorMap[colorScheme] || colorMap.blue;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <div className={`rounded-xl ${colors.bg} p-2.5 ${colors.text}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">{value}</div>
      <div className="mt-2 flex items-center justify-between text-xs">
        {subtext && <span className="text-slate-500 truncate max-w-[170px]">{subtext}</span>}
        {href && (
          <Link href={href} className={`font-semibold ${colors.link} ml-auto`}>
            {hrefLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

export interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  colorScheme?: 'blue' | 'emerald' | 'amber' | 'indigo' | 'purple';
  badge?: string;
}

export function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  colorScheme = 'blue',
  badge,
}: QuickActionCardProps) {
  const colors = colorMap[colorScheme] || colorMap.blue;

  return (
    <Link
      href={href}
      className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 hover:shadow-md transition flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} ${colors.text} transition group-hover:scale-105`}
          >
            <Icon className="h-6 w-6" />
          </div>
          {badge && (
            <span className={`rounded-full ${colors.bg} ${colors.text} px-2 py-0.5 text-[10px] font-bold`}>
              {badge}
            </span>
          )}
        </div>
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition">
          {title}
        </h3>
        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>

      <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-slate-900 transition">
        <span>Explore action</span>
        <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export interface ProfileCompletionCardProps {
  name?: string;
  department?: string;
  hasBio?: boolean;
  hasSkills?: boolean;
  hasJobOrGradYear?: boolean;
  profileHref: string;
}

export function ProfileCompletionCard({
  name,
  department,
  hasBio = false,
  hasSkills = false,
  hasJobOrGradYear = false,
  profileHref,
}: ProfileCompletionCardProps) {
  const steps = [
    { label: 'Academic Department', completed: Boolean(department) },
    { label: 'Career Title / Goals', completed: hasJobOrGradYear },
    { label: 'Professional Skills', completed: hasSkills },
    { label: 'Personal Bio', completed: hasBio },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const percentage = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-900">
            {name ? `${name}'s Profile Strength` : 'Profile Strength'}
          </h3>
        </div>
        <span className="text-xs font-bold text-blue-600">{percentage}%</span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full bg-blue-600 transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
        {steps.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            {s.completed ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            ) : (
              <CircleDot className="h-3.5 w-3.5 text-slate-300 shrink-0" />
            )}
            <span className={s.completed ? 'text-slate-700' : 'text-slate-400'}>{s.label}</span>
          </div>
        ))}
      </div>

      {percentage < 100 && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Complete your profile to increase network discovery.</span>
          <Link
            href={profileHref}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 shrink-0"
          >
            Edit Profile →
          </Link>
        </div>
      )}
    </div>
  );
}
