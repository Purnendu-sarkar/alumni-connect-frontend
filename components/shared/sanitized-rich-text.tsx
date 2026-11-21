'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils/cn';

interface SanitizedRichTextProps {
  content?: string | null;
  className?: string;
}

const ALLOWED_TAGS = new Set([
  'p',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'ul',
  'ol',
  'li',
  'a',
  'blockquote',
  'h2',
  'h3',
  'h4',
  'h5',
  'br',
  'hr',
  'span',
  'figure',
  'figcaption',
  'img',
  'video',
  'source',
]);

const ALLOWED_SCHEMES = ['http:', 'https:', 'mailto:'];

/**
 * Sanitizes rich HTML content with defense-in-depth rules.
 * Restricts media embeds strictly to Cloudinary or campus assets.
 */
function sanitizeClientHtml(rawHtml?: string | null): string {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  let sanitized = rawHtml;

  // 1. Strip active code blocks & executable tags
  sanitized = sanitized.replace(
    /<(script|style|iframe|object|embed|form|input|button|svg|math)[^>]*>[\s\S]*?<\/\1>/gi,
    '',
  );
  sanitized = sanitized.replace(
    /<(script|style|iframe|object|embed|form|input|button|svg|math)[^>]*\/?>/gi,
    '',
  );

  // 2. Strip comments & event handler attributes
  sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');
  sanitized = sanitized.replace(/\son\w+\s*=\s*(["'])[\s\S]*?\1/gi, '');
  sanitized = sanitized.replace(/\son\w+\s*=\s*[^\s>]+/gi, '');
  sanitized = sanitized.replace(/javascript\s*:\s*[^\s"'>]*/gi, '#');

  // 3. Normalize tags and enforce attribute restrictions
  sanitized = sanitized.replace(/<\/?([a-zA-Z0-9_-]+)([^>]*)>/gi, (fullMatch, tagName, rawAttrs) => {
    const tagLower = tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tagLower)) {
      return '';
    }

    if (fullMatch.startsWith('</')) {
      return `</${tagLower}>`;
    }

    if (tagLower === 'br') return '<br />';
    if (tagLower === 'hr') return '<hr />';

    if (tagLower === 'a') {
      const hrefMatch = rawAttrs.match(/href=(["'])(.*?)\1/i) || rawAttrs.match(/href=([^\s>]+)/i);
      let href = hrefMatch ? (hrefMatch[2] || hrefMatch[1]).trim() : '';

      try {
        const parsed = new URL(href, 'https://campus.edu');
        if (!ALLOWED_SCHEMES.includes(parsed.protocol)) {
          href = '#';
        }
      } catch {
        href = '#';
      }

      return `<a href="${encodeURI(href)}" target="_blank" rel="noopener noreferrer">`;
    }

    if (tagLower === 'img' || tagLower === 'video' || tagLower === 'source') {
      const srcMatch = rawAttrs.match(/src=(["'])(.*?)\1/i) || rawAttrs.match(/src=([^\s>]+)/i);
      const src = srcMatch ? (srcMatch[2] || srcMatch[1]).trim() : '';

      // Only allow Cloudinary HTTPS URLs or local safe assets
      if (!src.startsWith('https://res.cloudinary.com/') && !src.startsWith('/')) {
        return '';
      }

      const altMatch = rawAttrs.match(/alt=(["'])(.*?)\1/i);
      const alt = altMatch ? altMatch[2] || altMatch[1] : '';

      if (tagLower === 'img') {
        return `<img src="${encodeURI(src)}" alt="${alt.replace(/"/g, '&quot;')}" loading="lazy" />`;
      }
      if (tagLower === 'video') {
        return `<video controls playsinline preload="metadata" src="${encodeURI(src)}">`;
      }
      if (tagLower === 'source') {
        return `<source src="${encodeURI(src)}" type="video/mp4" />`;
      }
    }

    // Default: Return tag without untrusted arbitrary attributes
    return `<${tagLower}>`;
  });

  return sanitized.trim();
}

export function SanitizedRichText({ content, className }: SanitizedRichTextProps) {
  const safeHtml = useMemo(() => sanitizeClientHtml(content), [content]);

  if (!safeHtml) return null;

  return (
    <div
      className={cn('rich-text-content', className)}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
