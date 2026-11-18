'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Clock,
  Share2,
  Check,
  User as UserIcon,
  ExternalLink,
  ShieldCheck,
  Flag,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type { StoryDetail, StoryAuthor } from '@/types/domain';
import { useAuthStore } from '@/store/auth-store';
import { reportStory } from '@/lib/api/stories.api';
import { cn } from '@/lib/utils/cn';
import {
  STORY_CATEGORY_COLORS,
  STORY_CATEGORY_LABELS,
} from './story-card';

interface StoryReaderProps {
  story: StoryDetail;
  backHref?: string;
  backLabel?: string;
  onBackClick?: () => void;
  authorProfileHref?: string | null;
  canReport?: boolean;
  showEditorialInfo?: boolean;
}

const REPORT_REASONS = [
  'Inappropriate or offensive content',
  'Misleading or inaccurate information',
  'Spam or commercial self-promotion',
  'Privacy violation or unauthorized media',
  'Other community guideline concern',
];

export function StoryReader({
  story,
  backHref = '/stories',
  backLabel = 'Back to Stories',
  onBackClick,
  authorProfileHref = null,
  canReport = false,
  showEditorialInfo = false,
}: StoryReaderProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [copied, setCopied] = useState(false);

  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportDetails, setReportDetails] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  const categoryConfig =
    STORY_CATEGORY_COLORS[story.category] || STORY_CATEGORY_COLORS.GENERAL_INSIGHT;
  const categoryLabel = STORY_CATEGORY_LABELS[story.category] || story.category;

  const handleShare = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Clipboard fallback ignored
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsReporting(true);
    setReportError(null);
    try {
      await reportStory(
        story.id,
        {
          reason: reportReason,
          details: reportDetails.trim() || undefined,
        },
        accessToken
      );
      setReportSuccess('Thank you. Your report has been submitted to campus moderators for review.');
      setReportDetails('');
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(null);
      }, 2200);
    } catch (err: unknown) {
      setReportError(
        err instanceof Error
          ? err.message
          : 'Unable to submit report right now. Please try again later.'
      );
    } finally {
      setIsReporting(false);
    }
  };

  const formattedDate = story.publishedAt
    ? new Date(story.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date(story.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

  const author = story.author || ({} as StoryAuthor);

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Top Navigation */}
      <div className="mb-8 flex items-center justify-between gap-3">
        {onBackClick ? (
          <button
            type="button"
            onClick={onBackClick}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{backLabel}</span>
          </button>
        ) : (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{backLabel}</span>
          </Link>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-medium">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-slate-500" />
                <span>Share Story</span>
              </>
            )}
          </button>

          {canReport && (
            <button
              type="button"
              onClick={() => {
                setReportError(null);
                setReportSuccess(null);
                setShowReportModal(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-2xs transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              title="Report inappropriate content"
            >
              <Flag className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Category & Reading Time */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm',
            categoryConfig.badge
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', categoryConfig.dot)} />
          {categoryLabel}
        </span>

        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          {story.readingTimeMinutes || 3} min read
        </span>

        {showEditorialInfo && (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            Status: {story.status}
          </span>
        )}
      </div>

      {/* Headline & Subtitle */}
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl md:leading-[1.15]">
        {story.title}
      </h1>

      {story.summary && (
        <p className="mt-4 text-lg text-slate-600 sm:text-xl leading-relaxed font-normal">
          {story.summary}
        </p>
      )}

      {/* Author Card Bar */}
      <div className="mt-8 flex items-center justify-between border-y border-slate-200 py-4">
        <div className="flex items-center gap-3.5">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-200 border border-slate-200">
            {author.avatarUrl ? (
              <Image
                src={author.avatarUrl}
                alt={author.name || 'Author'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-blue-100 text-blue-700 text-base font-bold">
                {author.name ? author.name.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{author.name || 'Alumnus'}</span>
              <span title="Verified University Alumni">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {[
                author.currentRole
                  ? `${author.currentRole}${author.currentCompany ? ` at ${author.currentCompany}` : ''}`
                  : null,
                author.department,
                author.graduationYear
                  ? `Class of ${author.graduationYear}`
                  : author.batch
                    ? `Batch ${author.batch}`
                    : null,
              ]
                .filter(Boolean)
                .join(' • ')}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Published on {formattedDate}</p>
          </div>
        </div>

        {authorProfileHref && (
          <Link
            href={authorProfileHref}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>View Profile</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Hero Cover Image */}
      {story.coverImageUrl && (
        <div className="my-8 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative aspect-[16/9] w-full bg-slate-100">
            <Image
              src={story.coverImageUrl}
              alt={story.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Story Narrative Content */}
      <div
        className={cn(
          'story-content prose prose-slate max-w-none font-serif text-slate-800 leading-relaxed sm:text-lg',
          'prose-headings:font-sans prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900',
          'prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4',
          'prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3',
          'prose-p:my-5 prose-p:leading-[1.8]',
          'prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:pl-5 prose-blockquote:italic prose-blockquote:text-slate-700 prose-blockquote:my-6',
          'prose-ul:list-disc prose-ul:my-5 prose-ul:pl-6',
          'prose-ol:list-decimal prose-ol:my-5 prose-ol:pl-6',
          'prose-li:my-2',
          'prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800',
          'prose-hr:my-8 prose-hr:border-slate-200',
          '[&_figure]:my-8 [&_figure]:overflow-hidden [&_figure]:rounded-xl [&_figure]:border [&_figure]:border-slate-200',
          '[&_figure_img]:w-full [&_figure_img]:h-auto [&_figure_img]:object-cover',
          '[&_figure_video]:w-full [&_figure_video]:rounded-xl',
          '[&_figcaption]:bg-slate-50 [&_figcaption]:py-2 [&_figcaption]:px-4 [&_figcaption]:text-center [&_figcaption]:text-xs [&_figcaption]:italic [&_figcaption]:text-slate-500'
        )}
        dangerouslySetInnerHTML={{ __html: story.body }}
      />

      {/* Story Tags */}
      {story.tags && story.tags.length > 0 && (
        <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-6">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tags:
          </span>
          {story.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Author Footer Card */}
      <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-slate-200 border border-slate-300">
              {author.avatarUrl ? (
                <Image
                  src={author.avatarUrl}
                  alt={author.name || 'Author'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-blue-100 text-blue-700 text-lg font-bold">
                  {author.name ? (
                    author.name.charAt(0).toUpperCase()
                  ) : (
                    <UserIcon className="h-6 w-6" />
                  )}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900">{author.name || 'Alumnus'}</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {[
                  author.currentRole
                    ? `${author.currentRole}${author.currentCompany ? ` at ${author.currentCompany}` : ''}`
                    : null,
                  author.department,
                ]
                  .filter(Boolean)
                  .join(' • ')}
              </p>
              {author.headline && (
                <p className="text-xs text-slate-500 mt-1 italic">
                  &ldquo;{author.headline}&rdquo;
                </p>
              )}
            </div>
          </div>

          {authorProfileHref && (
            <Link
              href={authorProfileHref}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 transition-colors"
            >
              <span>View Full Profile</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Report Story Modal */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-story-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 id="report-story-title" className="text-sm font-bold text-slate-900">
                Report Story Content
              </h3>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{reportSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                {reportError && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{reportError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Reason for Report
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  >
                    {REPORT_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide context to help university moderators review this report..."
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isReporting}
                    className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                  >
                    {isReporting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
