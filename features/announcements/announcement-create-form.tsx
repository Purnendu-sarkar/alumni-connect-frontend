'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Save, Pin, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/dashboard/page-header';
import {
  createAnnouncement,
  updateAnnouncement,
  getAdminAnnouncementById,
  type CreateAnnouncementInput,
} from '@/lib/api/announcements.api';
import { useAuthStore } from '@/store/auth-store';
import type {
  UserRole,
  AnnouncementCategory,
  AnnouncementAudience,
  AnnouncementStatus,
} from '@/types/domain';

interface AnnouncementCreateFormProps {
  currentRole: UserRole;
  basePath: string;
  editId?: string;
}

export function AnnouncementCreateForm({
  currentRole,
  basePath,
  editId,
}: AnnouncementCreateFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('GENERAL');
  const [audience, setAudience] = useState<AnnouncementAudience>('ALL');
  const [pinned, setPinned] = useState(false);
  const [body, setBody] = useState('');
  const [publishImmediately, setPublishImmediately] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: existingData } = useQuery({
    queryKey: ['admin-announcement-edit', editId, accessToken],
    queryFn: async () => {
      if (!editId || !accessToken) return null;
      const res = await getAdminAnnouncementById(accessToken, editId);
      return res.data;
    },
    enabled: Boolean(editId && accessToken),
  });

  useEffect(() => {
    if (existingData) {
      setTitle(existingData.title);
      setCategory(existingData.category);
      setAudience(existingData.audience);
      setPinned(existingData.pinned);
      setBody(existingData.body);
    }
  }, [existingData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error('Authentication required');

      const payload: CreateAnnouncementInput = {
        title: title.trim(),
        body: body.trim(),
        category,
        audience,
        pinned,
        status: (publishImmediately ? 'PUBLISHED' : editId ? existingData?.status : 'DRAFT') as AnnouncementStatus,
      };

      if (editId) {
        return updateAnnouncement(accessToken, editId, payload);
      }
      return createAnnouncement(accessToken, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      if (editId) {
        queryClient.invalidateQueries({ queryKey: ['announcement', editId] });
      }
      router.push(`${basePath}/announcements`);
    },
    onError: (err: unknown) => {
      const error = err as Error;
      setFormError(error?.message || 'Failed to save announcement. Please check requirements.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    saveMutation.mutate();
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
        {formError && (
          <div className="mb-4">
            <FormAlert>{formError}</FormAlert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Announcement Headline / Title *"
            placeholder="e.g. Mandatory Student Credential Verification for Fall 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={5}
            maxLength={120}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option value="GENERAL">General Notice</option>
                <option value="ACADEMIC">Academic & Examination</option>
                <option value="CAREER">Career & Job Placement</option>
                <option value="EVENT">Campus Gathering / Event</option>
                <option value="SECURITY_SYSTEM">Security & Platform Advisory</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Audience *
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as AnnouncementAudience)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Entire Campus Community (All)</option>
                <option value="STUDENTS">Current Enrolled Students Only</option>
                <option value="ALUMNI">Accredited Alumni Only</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Pin to Top of Feed (Max 3 active pinned notices permitted)
            </label>

            {!editId && (
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={publishImmediately}
                  onChange={(e) => setPublishImmediately(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Publish Immediately & Broadcast Notification
              </label>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Notice Content & Detailed Instructions (HTML allowed) *
            </label>
            <Textarea
              rows={8}
              placeholder="Draft your announcement notice, directives, and relevant contact details here…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              minLength={20}
              className="text-xs"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`${basePath}/announcements`)}
              disabled={saveMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5"
            >
              <Save className="w-4 h-4" />
              {saveMutation.isPending
                ? 'Saving Announcement...'
                : editId
                ? 'Update Notice'
                : publishImmediately
                ? 'Publish & Broadcast'
                : 'Save as Draft'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
