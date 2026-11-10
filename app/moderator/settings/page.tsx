import Link from 'next/link';
import { ArrowUpRight, Key, Shield, User } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';

export default function ModeratorSettingsPage() {
  const sections = [
    {
      title: 'Account Information',
      description: 'Your legal name, verified moderator identity, and staff affiliation.',
      href: '/moderator/settings/account',
      icon: User,
    },
    {
      title: 'Security & Password',
      description: 'Update secret password credentials, manage session tokens, and review active sessions.',
      href: '/moderator/settings/security',
      icon: Key,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PREFERENCES & SECURITY"
        title="Moderator Settings"
        description="Manage your moderator staff credentials, session security, and access controls."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="p-3 rounded-lg bg-blue-50 text-blue-600 inline-block mb-3">
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900 m-0 group-hover:text-blue-600 transition-colors">
                  {section.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed m-0">
                  {section.description}
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:underline mt-6">
                <span>Manage</span>
                <ArrowUpRight size={14} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
