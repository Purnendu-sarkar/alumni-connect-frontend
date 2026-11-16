'use client';

import React from 'react';

interface SanitizedRichTextProps {
  content: string;
  className?: string;
}

// Client-side HTML sanitizer fallback to guard against unsafe markup
function cleanClientHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:[^"']*/gi, '');
}

export function SanitizedRichText({ content, className = '' }: SanitizedRichTextProps) {
  const safeHtml = cleanClientHtml(content);

  return (
    <div
      className={`prose prose-sm max-w-none text-slate-800 leading-relaxed space-y-3 ${className}`}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
