import type { PressSource } from '@/types';

/** Shared newsroom presentation helpers — one source of truth for list and detail pages. */

export const PRESS_BADGE: Record<PressSource, { label: string; className: string }> = {
  campaign_hq: { label: 'Campaign HQ · 32 Road', className: 'bg-brand-green-light text-brand-green' },
  festaconline: { label: 'Community Press', className: 'bg-brand-blue/10 text-brand-blue-dark' },
  partner_press: { label: 'Partner Statement', className: 'bg-brand-gold/15 text-amber-700' },
};

export function formatPressDate(iso: string | null): string {
  return new Date(iso ?? Date.now()).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * A standfirst-safe excerpt: finish the sentence you started rather than slicing
 * a word in half. Releases short enough to read in full are returned untouched,
 * so the newsroom never shows a half-written thought when the whole note fits.
 */
export function pressExcerpt(body: string, max = 280): { text: string; truncated: boolean } {
  const clean = body.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return { text: clean, truncated: false };

  const window = clean.slice(0, max);
  const sentenceEnd = Math.max(window.lastIndexOf('. '), window.lastIndexOf('! '), window.lastIndexOf('? '));
  if (sentenceEnd > max * 0.45) {
    return { text: window.slice(0, sentenceEnd + 1), truncated: true };
  }
  const wordEnd = window.lastIndexOf(' ');
  return { text: `${window.slice(0, wordEnd > 0 ? wordEnd : max).replace(/[.,;:]$/, '')}…`, truncated: true };
}

export function readingTime(body: string): string {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}
