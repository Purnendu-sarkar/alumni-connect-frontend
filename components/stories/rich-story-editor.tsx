'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Heading2,
  Heading3,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Quote,
  List,
  ListOrdered,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  Eye,
  Edit3,
  Clock,
  Sparkles,
  X,
  UploadCloud,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import type { StoryCategory, StoryDetail, StoryAuthor } from '@/types/domain';
import type { CreateStoryInput } from '@/lib/api/stories.api';
import { cn } from '@/lib/utils/cn';
import { MediaUploader } from '@/components/media/media-uploader';
import { StoryReader } from './story-reader';
import { STORY_CATEGORY_LABELS, STORY_CATEGORY_COLORS } from './story-card';

const CATEGORY_OPTIONS: StoryCategory[] = [
  'CAREER_MILESTONE',
  'STARTUP_JOURNEY',
  'RESEARCH_BREAKTHROUGH',
  'COMMUNITY_IMPACT',
  'GLOBAL_EXPERIENCE',
  'CREATIVE_PURSUIT',
  'GENERAL_INSIGHT',
];

interface RichStoryEditorProps {
  initialData?: Partial<CreateStoryInput> & {
    id?: string;
    status?: string;
    readingTimeMinutes?: number;
    ownerVisibleNote?: string | null;
  };
  currentUser?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    department?: string | null;
    batch?: string | null;
    graduationYear?: string | null;
    position?: string | null;
    currentCompany?: string | null;
  } | null;
  onSaveDraft: (data: CreateStoryInput) => Promise<void>;
  onSubmitReview: (data: CreateStoryInput) => Promise<void>;
  isSaving?: boolean;
}

export function RichStoryEditor({
  initialData,
  currentUser,
  onSaveDraft,
  onSubmitReview,
  isSaving = false,
}: RichStoryEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // Form Fields
  const [title, setTitle] = useState(initialData?.title || '');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [category, setCategory] = useState<StoryCategory>(
    initialData?.category || 'CAREER_MILESTONE'
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(
    initialData?.coverImageUrl || null
  );
  const [coverImageKey, setCoverImageKey] = useState<string | null>(
    initialData?.coverImageKey || null
  );

  // Narrative Body & Word Count
  const [bodyHtml, setBodyHtml] = useState<string>(
    initialData?.body || '<p>Start typing your inspiring journey here...</p>'
  );
  const [wordCount, setWordCount] = useState<number>(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Modals for Media insertion
  const [showImageModal, setShowImageModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  // Inline Media Modal states
  const [inlineImageUrl, setInlineImageUrl] = useState<string | null>(null);
  const [inlineImageCaption, setInlineImageCaption] = useState('');
  const [inlineVideoUrl, setInlineVideoUrl] = useState<string | null>(null);
  const [inlineVideoCaption, setInlineVideoCaption] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelectionRange = useRef<Range | null>(null);

  // Calculate word count from HTML
  const updateMetrics = useCallback((html: string) => {
    if (typeof window === 'undefined') return;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, []);

  useEffect(() => {
    updateMetrics(bodyHtml);
  }, [bodyHtml, updateMetrics]);

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Initialize editor content once
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = bodyHtml;
    }
  }, [bodyHtml]);

  // Handle Tag Addition
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/^#/, '').toLowerCase();
      if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
        setTags([...tags, trimmed]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Save selection before opening modals
  const saveSelection = () => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRange.current = sel.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    if (typeof window === 'undefined') return;
    if (savedSelectionRange.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRange.current);
      }
    }
  };

  // Editor formatting commands
  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (typeof document === 'undefined') return;
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setBodyHtml(html);
      updateMetrics(html);
    }
  };

  // Insert Inline Image Figure
  const handleInsertImage = () => {
    if (!inlineImageUrl) return;
    restoreSelection();
    const captionHtml = inlineImageCaption
      ? `<figcaption>${inlineImageCaption}</figcaption>`
      : '';
    const figureHtml = `<figure class="my-6 rounded-xl overflow-hidden border border-slate-200"><img src="${inlineImageUrl}" alt="${inlineImageCaption || 'Story Image'}" class="w-full object-cover" />${captionHtml}</figure><p><br/></p>`;

    executeCommand('insertHTML', figureHtml);
    setInlineImageUrl(null);
    setInlineImageCaption('');
    setShowImageModal(false);
  };

  // Insert Inline Video Figure
  const handleInsertVideo = () => {
    if (!inlineVideoUrl) return;
    restoreSelection();
    const captionHtml = inlineVideoCaption
      ? `<figcaption>${inlineVideoCaption}</figcaption>`
      : '';
    const figureHtml = `<figure class="my-6 rounded-xl overflow-hidden border border-slate-200"><video controls preload="metadata" playsinline class="w-full rounded-xl"><source src="${inlineVideoUrl}" type="video/mp4" /></video>${captionHtml}</figure><p><br/></p>`;

    executeCommand('insertHTML', figureHtml);
    setInlineVideoUrl(null);
    setInlineVideoCaption('');
    setShowVideoModal(false);
  };

  // Insert Link
  const handleInsertLink = () => {
    if (!linkUrl) return;
    restoreSelection();
    let safeUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(safeUrl)) {
      safeUrl = `https://${safeUrl}`;
    }
    const displayText = linkText.trim() || safeUrl;
    const linkHtml = `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${displayText}</a>`;
    executeCommand('insertHTML', linkHtml);
    setLinkUrl('');
    setLinkText('');
    setShowLinkModal(false);
  };

  // Handle Input Changes in contentEditable
  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setBodyHtml(html);
      updateMetrics(html);
    }
  };

  // Validation
  const validateStory = (): boolean => {
    if (!title.trim() || title.trim().length < 5) {
      setValidationError('Title must be at least 5 characters long.');
      return false;
    }
    if (!summary.trim() || summary.trim().length < 10) {
      setValidationError('Summary must be at least 10 characters long.');
      return false;
    }
    if (wordCount < 10) {
      setValidationError('Story narrative is too brief. Please write at least a few paragraphs.');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const getPayload = (): CreateStoryInput => ({
    title: title.trim(),
    summary: summary.trim(),
    body: bodyHtml,
    category,
    tags,
    coverImageUrl,
    coverImageKey,
  });

  const handleDraftSubmit = async () => {
    if (!title.trim()) {
      setValidationError('Please provide at least a title for your draft.');
      return;
    }
    setValidationError(null);
    await onSaveDraft(getPayload());
  };

  const handlePublishSubmit = async () => {
    if (!validateStory()) return;
    await onSubmitReview(getPayload());
  };

  // Mock object for live preview
  const previewStory: StoryDetail = {
    id: initialData?.id || 'preview-id',
    universityId: 'uni-1',
    title: title || 'Untitled Story',
    slug: 'preview-slug',
    summary: summary || 'No summary provided yet.',
    body: bodyHtml,
    category,
    tags,
    coverImageUrl,
    readingTimeMinutes: readingTime,
    status: (initialData?.status as StoryDetail['status']) || 'DRAFT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: {
      id: currentUser?.id || 'current-user',
      name: currentUser?.name || 'You',
      avatarUrl: currentUser?.avatarUrl,
      department: currentUser?.department,
      batch: currentUser?.batch,
      graduationYear: currentUser?.graduationYear,
      currentRole: currentUser?.position,
      currentCompany: currentUser?.currentCompany,
    },
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Editorial Note Alert if changes were requested */}
      {initialData?.ownerVisibleNote && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 shadow-2xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950">Editorial Feedback from University Moderators</p>
              <p className="mt-1 text-amber-800 leading-relaxed">{initialData.ownerVisibleNote}</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Header & Mode Toggle */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {initialData?.id ? 'Edit Story' : 'Compose Success Story'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Share your professional breakthrough, startup journey, or insights with students and alumni.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-all',
              activeTab === 'edit'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-all',
              activeTab === 'preview'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Reader Preview</span>
          </button>
        </div>
      </div>

      {validationError && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {activeTab === 'preview' ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Live Medium-Style Reader Preview</span>
          </div>
          <StoryReader story={previewStory} backLabel="Return to Editor" backHref="#" />
        </div>
      ) : (
        <div className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          {/* Cover Hero Image Uploader */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Hero Cover Image (16:9 Recommended)
            </label>
            <div className="relative">
              <MediaUploader
                purpose="STORY_MEDIA"
                accept="image"
                aspectRatio="16:9"
                maxSizeMB={5}
                currentUrl={coverImageUrl}
                currentPublicId={coverImageKey}
                onUploadComplete={(asset) => {
                  setCoverImageUrl(asset.url);
                  setCoverImageKey(asset.publicId);
                }}
                onRemove={() => {
                  setCoverImageUrl(null);
                  setCoverImageKey(null);
                }}
              />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Story Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORY_OPTIONS.map((cat) => {
                const isSelected = category === cat;
                const colors = STORY_CATEGORY_COLORS[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-semibold transition-all text-center',
                      isSelected
                        ? `${colors.badge} ring-2 ring-blue-500 shadow-2xs`
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <span className={cn('h-2 w-2 rounded-full', colors.dot)} />
                    <span className="truncate">{STORY_CATEGORY_LABELS[cat]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Large Title Input */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title of your story..."
              className="w-full border-none p-0 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 placeholder:text-slate-300 focus:outline-hidden focus:ring-0"
            />
          </div>

          {/* Summary / Subtitle Input */}
          <div>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Write a clear, compelling summary or key takeaway for the story card..."
              className="w-full resize-none border-b border-slate-200 p-0 pb-3 text-base text-slate-600 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-0"
            />
          </div>

          {/* Sticky Formatting Toolbar */}
          <div className="sticky top-4 z-20 flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-white/95 p-1.5 shadow-md backdrop-blur-md">
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<h2>')}
              title="Heading 2"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Heading2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<h3>')}
              title="Heading 3"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Heading3 className="h-4 w-4" />
            </button>

            <div className="h-5 w-[1px] bg-slate-200 mx-1" />

            <button
              type="button"
              onClick={() => executeCommand('bold')}
              title="Bold (Ctrl+B)"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('italic')}
              title="Italic (Ctrl+I)"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('underline')}
              title="Underline (Ctrl+U)"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Underline className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('strikeThrough')}
              title="Strikethrough"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Strikethrough className="h-4 w-4" />
            </button>

            <div className="h-5 w-[1px] bg-slate-200 mx-1" />

            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<blockquote>')}
              title="Quote block"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Quote className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('insertUnorderedList')}
              title="Bullet List"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('insertOrderedList')}
              title="Numbered List"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ListOrdered className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('insertHorizontalRule')}
              title="Horizontal Divider"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>

            <div className="h-5 w-[1px] bg-slate-200 mx-1" />

            {/* Link & Media Inserts */}
            <button
              type="button"
              onClick={() => {
                saveSelection();
                setShowLinkModal(true);
              }}
              title="Insert Link"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <LinkIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                saveSelection();
                setShowImageModal(true);
              }}
              title="Insert Inline Image (Cloudinary)"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ImageIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                saveSelection();
                setShowVideoModal(true);
              }}
              title="Insert Inline Video (Cloudinary MP4)"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <VideoIcon className="h-4 w-4" />
            </button>

            {/* Metrics */}
            <div className="ml-auto flex items-center gap-3 pr-2 text-xs text-slate-500">
              <span>{wordCount} words</span>
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Clock className="h-3 w-3 text-slate-400" />
                ~{readingTime} min read
              </span>
            </div>
          </div>

          {/* Narrative contentEditable Surface */}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            onBlur={handleEditorInput}
            className={cn(
              'min-h-[400px] w-full rounded-xl border border-slate-200 p-6 font-serif text-lg leading-relaxed text-slate-800 focus:border-blue-400 focus:outline-hidden focus:ring-2 focus:ring-blue-100',
              'prose prose-slate max-w-none',
              'prose-headings:font-sans prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900',
              'prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-3',
              'prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-2',
              'prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-700',
              'prose-a:text-blue-600 prose-a:underline',
              '[&_figure]:my-6 [&_figure]:rounded-xl [&_figure]:overflow-hidden [&_figure]:border [&_figure]:border-slate-200',
              '[&_figcaption]:bg-slate-50 [&_figcaption]:py-2 [&_figcaption]:text-center [&_figcaption]:text-xs [&_figcaption]:italic [&_figcaption]:text-slate-500'
            )}
            style={{ minHeight: '380px' }}
          />

          {/* Tags Section */}
          <div className="border-t border-slate-200 pt-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Tags (Up to 5)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-slate-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}

              {tags.length < 5 && (
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Add tag and press Enter..."
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden"
                />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-6">
            <div className="text-xs text-slate-500">
              {initialData?.status === 'PUBLISHED' && (
                <span className="text-amber-600 font-medium">
                  Note: Editing will automatically return this story to Under Review.
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleDraftSubmit}
                disabled={isSaving}
                className="w-full sm:w-auto rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save as Draft'}
              </button>

              <button
                type="button"
                onClick={handlePublishSubmit}
                disabled={isSaving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Submit for Editorial Review</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Insert Inline Image</h3>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <MediaUploader
                purpose="STORY_MEDIA"
                accept="image"
                aspectRatio="free"
                maxSizeMB={5}
                onUploadComplete={(asset) => setInlineImageUrl(asset.url)}
              />

              {inlineImageUrl && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Caption (Optional)
                  </label>
                  <input
                    type="text"
                    value={inlineImageCaption}
                    onChange={(e) => setInlineImageCaption(e.target.value)}
                    placeholder="e.g. Discussing system architecture during our 2026 hackathon"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!inlineImageUrl}
                onClick={handleInsertImage}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Insert Inline Video</h3>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <MediaUploader
                purpose="STORY_MEDIA"
                accept="video"
                aspectRatio="16:9"
                maxSizeMB={50}
                onUploadComplete={(asset) => setInlineVideoUrl(asset.url)}
              />

              {inlineVideoUrl && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Caption (Optional)
                  </label>
                  <input
                    type="text"
                    value={inlineVideoCaption}
                    onChange={(e) => setInlineVideoCaption(e.target.value)}
                    placeholder="e.g. Demonstration of our sensor telemetry"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!inlineVideoUrl}
                onClick={handleInsertVideo}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Insert Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Insert Link</h3>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Text to Display
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. Read our research paper"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!linkUrl}
                onClick={handleInsertLink}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
