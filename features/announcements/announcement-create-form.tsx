'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Megaphone, Send } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/dashboard/page-header';
import type { UserRole } from '@/types/domain';

import { demoAnnouncements } from '@/features/shared/demo-data';

interface AnnouncementCreateFormProps {
  currentRole: UserRole;
  basePath: string;
  editId?: string;
}

export function AnnouncementCreateForm({ currentRole, basePath, editId }: AnnouncementCreateFormProps) {
  const router = useRouter();

  const existing = editId ? demoAnnouncements.find((a) => a.id === editId) : null;

  const [title, setTitle] = useState(existing?.title || '');
  const [priority, setPriority] = useState<'HIGH' | 'NORMAL' | 'URGENT'>(
    (existing?.priority as any) || 'NORMAL'
  );
  const [category, setCategory] = useState<'IMPORTANT' | 'CAMPUS_UPDATE' | 'CAREER'>(
    (existing?.category as any) || 'CAMPUS_UPDATE'
  );
  const [content, setContent] = useState(existing?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`${basePath}/announcements`);
    }, 500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        backHref={`${basePath}/announcements`}
        backLabel="Back to Announcements"
        eyebrow="COMMUNICATION DISPATCH"
        title={editId ? 'Edit Official Announcement' : 'Publish Official Announcement'}
        description={
          editId
            ? 'Update verified announcement details, priorities, or instructions.'
            : 'Broadcast verified university updates, deadline reminders, or institutional notices.'
        }
      />

      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Announcement Title *"
            placeholder="e.g. Schedule for Fall 2026 Convocation & Alumni Accreditation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option value="NORMAL">NORMAL — Regular Bulletin</option>
                <option value="HIGH">HIGH — Highlighted Priority</option>
                <option value="URGENT">URGENT — Critical Action Needed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Notice Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option value="CAMPUS_UPDATE">Campus Update</option>
                <option value="IMPORTANT">Important Administrative</option>
                <option value="CAREER">Career & Placement</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Notice Content & Detailed Instructions *
            </label>
            <textarea
              rows={6}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide complete instructions, eligible student batches, required documents, or office contacts…"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" size="sm" asChild>
              <Link href={`${basePath}/announcements`}>Cancel</Link>
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              <Send size={14} /> {isSubmitting ? 'Saving…' : editId ? 'Save Changes' : 'Publish Notice'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
