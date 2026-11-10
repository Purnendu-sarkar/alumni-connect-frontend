'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Lock, Save, Shield } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/page-header';
import type { UserRole } from '@/types/domain';

interface PrivacySettingsViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function PrivacySettingsView({ currentRole, basePath }: PrivacySettingsViewProps) {
  const [profileVisibility, setProfileVisibility] = useState('VERIFIED_MEMBERS');
  const [allowDirectMessages, setAllowDirectMessages] = useState('CONNECTIONS_ONLY');
  const [showPhone, setShowPhone] = useState(false);
  const [mentorshipAvailability, setMentorshipAvailability] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice('Privacy preferences updated successfully.');
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        backHref={`${basePath}/settings`}
        backLabel="Back to Settings"
        eyebrow="PRIVACY & VISIBILITY CONTROLS"
        title="Privacy Preferences"
        description="Control who can discover your profile, access contact details, and initiate direct conversations."
      />

      {notice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      ) : null}

      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Profile Directory Visibility
            </label>
            <p className="text-slate-500 mb-2">Determine who is permitted to view your extended biography and resume records.</p>
            <select
              value={profileVisibility}
              onChange={(e) => setProfileVisibility(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="VERIFIED_MEMBERS">Verified Members Only (Recommended)</option>
              <option value="CONNECTIONS">Direct Connections Only</option>
              <option value="ONLY_ME">Hidden / Private</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <label className="block font-bold text-slate-800 mb-1">
              Direct Messaging Permissions
            </label>
            <p className="text-slate-500 mb-2">Configure who can initiate private message conversations with you.</p>
            <select
              value={allowDirectMessages}
              onChange={(e) => setAllowDirectMessages(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="CONNECTIONS_ONLY">Accepted Connections Only</option>
              <option value="VERIFIED_MEMBERS">Any Verified Campus Member</option>
            </select>
          </div>

          {currentRole === 'ALUMNI' ? (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 m-0">Student Mentorship Inquiries</p>
                <p className="text-slate-500 m-0 mt-0.5">Show your profile in the Mentorship directory as open for mentees.</p>
              </div>
              <input
                type="checkbox"
                checked={mentorshipAvailability}
                onChange={(e) => setMentorshipAvailability(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
            </div>
          ) : null}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800 m-0">Display Phone Number Publicly</p>
              <p className="text-slate-500 m-0 mt-0.5">Allow accredited connections to view your institutional phone contact.</p>
            </div>
            <input
              type="checkbox"
              checked={showPhone}
              onChange={(e) => setShowPhone(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" size="sm">
              <Save size={14} /> Save Privacy Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
