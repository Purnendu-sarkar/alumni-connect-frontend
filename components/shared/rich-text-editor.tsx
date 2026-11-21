'use client';

import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Eye,
  Edit3,
} from 'lucide-react';
import { SanitizedRichText } from './sanitized-rich-text';

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  minHeight?: string;
  className?: string;
  label?: string;
  helperText?: string;
  required?: boolean;
  id?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write formatted content here…',
  rows = 6,
  minHeight = '180px',
  className = '',
  label,
  helperText,
  required,
  id,
  disabled = false,
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormatting = (before: string, after: string, defaultText = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = value || '';

    const selected = currentVal.substring(start, end) || defaultText;
    const replacement = `${before}${selected}${after}`;

    const newValue =
      currentVal.substring(0, start) + replacement + currentVal.substring(end);

    onChange(newValue);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      const newCursorStart = start + before.length;
      const newCursorEnd = newCursorStart + selected.length;
      textarea.setSelectionRange(newCursorStart, newCursorEnd);
    }, 0);
  };

  const insertBlockList = (ordered = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = value || '';

    const selected = currentVal.substring(start, end).trim();
    const listItemsHtml = selected
      ? selected
          .split('\n')
          .filter((l) => l.trim().length > 0)
          .map((l) => `  <li>${l.trim()}</li>`)
          .join('\n')
      : '  <li>Key requirement or item 1</li>\n  <li>Key requirement or item 2</li>';

    const tag = ordered ? 'ol' : 'ul';
    const replacement = `\n<${tag}>\n${listItemsHtml}\n</${tag}>\n`;

    const newValue =
      currentVal.substring(0, start) + replacement + currentVal.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  const insertLink = () => {
    const url = window.prompt('Enter link URL (e.g. https://example.com):', 'https://');
    if (!url || url.trim() === 'https://') return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = value || '';
    const selected = currentVal.substring(start, end) || 'link text';

    const safeUrl = url.trim();
    const replacement = `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${selected}</a>`;

    const newValue =
      currentVal.substring(0, start) + replacement + currentVal.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-slate-700"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
        {/* Editor Header / Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 px-3 py-2 bg-slate-50 border-b border-slate-200 text-xs">
          {/* Action buttons (only active in write mode) */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              disabled={disabled || activeTab === 'preview'}
              onClick={() => applyFormatting('<strong>', '</strong>', 'bold text')}
              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 disabled:opacity-40 transition-colors"
              title="Bold (<strong>)"
              aria-label="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              disabled={disabled || activeTab === 'preview'}
              onClick={() => applyFormatting('<em>', '</em>', 'italic text')}
              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 disabled:opacity-40 transition-colors"
              title="Italic (<em>)"
              aria-label="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              disabled={disabled || activeTab === 'preview'}
              onClick={() => applyFormatting('<h3>', '</h3>', 'Heading 3')}
              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 disabled:opacity-40 transition-colors"
              title="Heading (<h3>)"
              aria-label="Heading"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-slate-200 mx-0.5" />

            <button
              type="button"
              disabled={disabled || activeTab === 'preview'}
              onClick={() => insertBlockList(false)}
              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 disabled:opacity-40 transition-colors"
              title="Bullet List (<ul>)"
              aria-label="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              disabled={disabled || activeTab === 'preview'}
              onClick={() => insertBlockList(true)}
              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 disabled:opacity-40 transition-colors"
              title="Numbered List (<ol>)"
              aria-label="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              disabled={disabled || activeTab === 'preview'}
              onClick={() => applyFormatting('<blockquote>', '</blockquote>', 'Quote text')}
              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 disabled:opacity-40 transition-colors"
              title="Blockquote (<blockquote>)"
              aria-label="Blockquote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              disabled={disabled || activeTab === 'preview'}
              onClick={insertLink}
              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 disabled:opacity-40 transition-colors"
              title="Insert Link (<a>)"
              aria-label="Insert Link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg ml-auto">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                activeTab === 'write'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              Write
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                activeTab === 'preview'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3 h-3" />
              Preview
            </button>
          </div>
        </div>

        {/* Editor Body */}
        {activeTab === 'write' ? (
          <textarea
            id={id}
            ref={textareaRef}
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            style={{ minHeight }}
            className="w-full p-3.5 text-xs font-mono text-slate-800 bg-white border-0 focus:outline-none focus:ring-0 resize-y leading-relaxed"
          />
        ) : (
          <div
            style={{ minHeight }}
            className="w-full p-4 bg-slate-50/50 overflow-y-auto text-xs"
          >
            {value && value.trim().length > 0 ? (
              <SanitizedRichText content={value} className="text-xs" />
            ) : (
              <p className="text-xs text-slate-400 italic m-0">
                Nothing to preview yet. Switch to Write tab to add formatted content.
              </p>
            )}
          </div>
        )}
      </div>

      {helperText && (
        <p className="text-[11px] text-slate-500 m-0">{helperText}</p>
      )}
    </div>
  );
}
