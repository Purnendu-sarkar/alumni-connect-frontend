'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PenSquare, Send } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/dashboard/page-header';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface StoryCreateFormProps {
  currentRole: UserRole;
  basePath: string;
}

export function StoryCreateForm({ currentRole, basePath }: StoryCreateFormProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('CAREER MILESTONE');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`${basePath}/stories/my-stories?submitted=true`);
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        backHref={`${basePath}/stories`}
        backLabel="Back to Stories"
        eyebrow="COMMUNITY SPOTLIGHT"
        title="Write an Alumni Success Story"
        description="Share key milestones, hard-won technical wisdom, or career insights with current students."
      />

      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Story Title *"
            placeholder="e.g. Scaling Cloud Microservices: What They Didn't Teach in Lab"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Category Focus
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="CAREER MILESTONE">Career Milestone</option>
              <option value="ENTREPRENEURSHIP">Entrepreneurship & Startups</option>
              <option value="DESIGN & PRODUCT">Design & Product Thinking</option>
              <option value="RESEARCH & ACADEMIA">Research & Higher Studies</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Brief Summary / Subtitle *
            </label>
            <textarea
              rows={2}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="A short, catchy overview that summarizes your journey and main takeaway for readers…"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Full Article Content *
            </label>
            <textarea
              rows={8}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Narrate your experience: the challenge you faced, decisions you made, and actionable advice you would give your younger self…"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" size="sm" asChild>
              <Link href={`${basePath}/stories`}>Cancel</Link>
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              <Send size={14} /> {isSubmitting ? 'Submitting to Editorial Queue…' : 'Submit for Review'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
