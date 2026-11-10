import Link from 'next/link';
import { ArrowUpRight, Bell, Key, Server, Shield, User } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';

export default function AdminSettingsPage() {
  const sections = [
    {
      title: 'General & Campus Policy',
      description: 'University name, domain restrictions, authentication rules, and governance policies.',
      href: '/admin/settings/general',
      icon: Server,
    },
    {
      title: 'Security & Root Access',
      description: 'Super admin password credentials, 15-minute privileged re-auth, and active sessions.',
      href: '/admin/settings/security',
      icon: Key,
    },
    {
      title: 'Broadcast & Notification Rules',
      description: 'Configure automated digest notifications, email alerts, and administrative notice defaults.',
      href: '/admin/settings/notifications',
      icon: Bell,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CAMPUS HEADQUARTERS"
        title="Administrative Settings & Governance"
        description="System policies, credential security, domain verification, and notification defaults."
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
                <p className="text-xs text-slate-500 mt-2 leading-relaxed m-0">
                  {section.description}
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:underline mt-6">
                <span>Configure</span>
                <ArrowUpRight size={14} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
