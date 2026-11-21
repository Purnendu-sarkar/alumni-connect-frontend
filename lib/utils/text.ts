/**
 * Text and HTML sanitization and formatting utilities.
 * 100% Pure English (0 Bengali Unicode characters).
 */

/**
 * Strips HTML tags, script, and style blocks, decodes common HTML entities,
 * collapses redundant whitespace, and returns clean plain text.
 */
export function stripHtmlToPlainText(html?: string | null): string {
  if (!html || typeof html !== 'string') return '';

  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
