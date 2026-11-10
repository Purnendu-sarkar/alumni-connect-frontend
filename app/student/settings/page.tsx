import Link from 'next/link';
import { ArrowUpRight, Key, Lock, Shield, User } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';

export default function StudentSettingsPage() {
  const sections = [
    {
      title: 'Account Information',
      description: 'Your legal name, verified institutional email, and affiliated university campus.',
      href: '/student/settings/account',
      icon: User,
    },
    {
      title: 'Privacy & Visibility',
      description: 'Control directory profile visibility, phone contact display, and messaging preferences.',
      href: '/student/settings/privacy',
      icon: Shield,
    },
    {
      title: 'Security & Password',
      description: 'Update secret password credentials and monitor active browser sessions.',
      href: '/student/settings/security',
      icon: Key,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PREFERENCES & SECURITY"
        title="Settings & Privacy Desk"
        description="Manage your institutional identity, authentication credentials, and data privacy preferences."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <p className="text-xs text-slate-500 mt-1 m-0 leading-relaxed">
                  {section.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                <span>Manage</span>
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
