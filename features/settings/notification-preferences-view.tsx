'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  CheckCircle2,
  Lock,
  Mail,
  RefreshCw,
  Save,
  ShieldCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/page-header';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreference,
  type NotificationType,
} from '@/lib/api/notifications';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface CategoryConfig {
  type: NotificationType;
  title: string;
  description: string;
  isMandatory?: boolean;
}

const PREFERENCE_CATEGORIES: CategoryConfig[] = [
  {
    type: 'SECURITY_ALERT',
    title: 'Security & Access Alerts',
    description: 'Critical notifications about password resets, suspicious logins, and session terminations.',
    isMandatory: true,
  },
  {
    type: 'ACCOUNT_VERIFICATION',
    title: 'Account & Accreditation Updates',
    description: 'Status updates on email verification and alumni credential review decisions.',
    isMandatory: true,
  },
  {
    type: 'RESTRICTION_APPLIED',
    title: 'Policy & Restriction Notices',
    description: 'Mandatory administrative enforcement notices regarding account suspension or reinstatement.',
    isMandatory: true,
  },
  {
    type: 'CONNECTION_REQUEST',
    title: 'Campus Connections',
    description: 'Notifications when fellow students or alumni send you connection requests.',
    isMandatory: false,
  },
  {
    type: 'MENTORSHIP_REQUEST',
    title: 'Mentorship Inquiries',
    description: 'Alerts when career mentorship requests are initiated, accepted, or updated.',
    isMandatory: false,
  },
  {
    type: 'JOB_APPROVED',
    title: 'Job Opportunities & Applications',
    description: 'Notifications for new departmental job postings and applicant status updates.',
    isMandatory: false,
  },
  {
    type: 'ANNOUNCEMENT',
    title: 'Official Announcements & Events',
    description: 'Broadcasts from university administration and upcoming campus event reminders.',
    isMandatory: false,
  },
];

interface NotificationPreferencesViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function NotificationPreferencesView({ currentRole, basePath }: NotificationPreferencesViewProps) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [preferences, setPreferences] = useState<Record<string, { inApp: boolean; email: boolean }>>({});
  const [notice, setNotice] = useState<string | null>(null);

  const prefsQuery = useQuery({
    queryKey: ['notification-preferences', accessToken],
    queryFn: async () => {
      const res = await getNotificationPreferences();
      return res.data ?? [];
    },
    enabled: Boolean(accessToken),
  });

  useEffect(() => {
    if (prefsQuery.data) {
      const initial: Record<string, { inApp: boolean; email: boolean }> = {};
      for (const cat of PREFERENCE_CATEGORIES) {
        const found = prefsQuery.data.find((p) => p.type === cat.type);
        initial[cat.type] = {
          inApp: cat.isMandatory ? true : (found?.inApp ?? true),
          email: cat.isMandatory ? true : (found?.email ?? true),
        };
      }
      setPreferences(initial);
    }
  }, [prefsQuery.data]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload = Object.entries(preferences).map(([type, settings]) => ({
        type: type as NotificationType,
        inApp: settings.inApp,
        email: settings.email,
      }));
      return updateNotificationPreferences(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      setNotice('Notification channel preferences saved successfully.');
      setTimeout(() => setNotice(null), 3000);
    },
  });

  const handleToggle = (type: NotificationType, channel: 'inApp' | 'email') => {
    setPreferences((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [channel]: !prev[type]?.[channel],
      },
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        eyebrow="COMMUNICATION CHANNELS"
        title="Notification Preferences"
        description="Configure which notifications you receive through in-app dashboard alerts and email dispatches."
        actions={
          <Button
            size="sm"
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            <Save size={14} className="mr-1.5" /> Save Preferences
          </Button>
        }
      />

      {notice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      ) : null}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {PREFERENCE_CATEGORIES.map((cat) => {
          const current = preferences[cat.type] ?? { inApp: true, email: true };

          return (
            <div key={cat.type} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-lg">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 m-0">{cat.title}</h4>
                  {cat.isMandatory ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      <Lock size={10} /> Mandatory
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-slate-500 m-0 leading-relaxed">{cat.description}</p>
              </div>

              <div className="flex items-center gap-6 shrink-0 pt-2 sm:pt-0">
                {/* In-App Toggle */}
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={cat.isMandatory ? true : current.inApp}
                    disabled={cat.isMandatory}
                    onChange={() => handleToggle(cat.type, 'inApp')}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="flex items-center gap-1">
                    <Bell size={13} className="text-slate-400" /> In-App
                  </span>
                </label>

                {/* Email Toggle */}
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={cat.isMandatory ? true : current.email}
                    disabled={cat.isMandatory}
                    onChange={() => handleToggle(cat.type, 'email')}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="flex items-center gap-1">
                    <Mail size={13} className="text-slate-400" /> Email
                  </span>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
