/**
 * cms.ts — shared input rules for the campaign CMS.
 *
 * Everything the media desk or campaign HQ can type into the dashboard is
 * validated here before it reaches the store, so a malformed YouTube link or a
 * `javascript:` URL can never be published to a public page.
 */
import { NextResponse } from 'next/server';
import { MEDIA_POSITIONS } from './content';
import type { MediaOrientation } from '@/types';

export const ORIENTATIONS: MediaOrientation[] = ['portrait', 'landscape', 'square'];

export function orientation(raw: unknown): MediaOrientation | null {
  const s = String(raw ?? '').trim();
  return (ORIENTATIONS as string[]).includes(s) ? (s as MediaOrientation) : null;
}

/**
 * YouTube link recognition lives in its own module because the Live Desk needs it
 * in the browser and this file imports next/server. Re-exported here so every
 * existing route keeps its import path.
 */
export { extractYoutubeId } from './youtubeId';

/** Only http(s) links are storable; everything else is dropped. */
export function cleanUrl(raw: unknown): string | null {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Social/press links that may also be mailto: or wa.me deep links. */
export function cleanHref(raw: unknown): string | null {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  if (/^mailto:[^\s@]+@[^\s@.]+\.[^\s@]+$/i.test(s)) return s;
  return cleanUrl(s);
}

export const SLOTS: readonly string[] = MEDIA_POSITIONS.map((p) => p.slot);

/** Slot must be a position the site actually renders. */
export function cleanSlot(raw: unknown): string | null {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  return SLOTS.includes(s) ? s : null;
}

export function badRequest(error: string) {
  return NextResponse.json({ success: false, error }, { status: 400 });
}

export function serverError(err: unknown) {
  return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
}

export const notFound = (what = 'Record') => NextResponse.json({ success: false, error: `${what} not found.` }, { status: 404 });

/** Trim non-empty string, or null. */
export function text(raw: unknown, max = 500): string | null {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  return s.slice(0, max);
}

/** Positive integer pixel dimension, or null when unknown. */
export function dim(raw: unknown): number | null {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
}

/** Any date-ish input normalised to YYYY-MM-DD, or null. */
export function isoDate(raw: unknown): string | null {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

/** Whole-year press-archive stamp, or null. */
export function year(raw: unknown): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1990 && n <= 2100 ? n : null;
}

/**
 * Photo for a track-record entry: either a media-library path under /images/
 * (what the upload endpoint returns) or a full http(s) link. A bare "photo.jpg"
 * would render as a dead relative URL, so it is refused.
 */
export function cleanImage(raw: unknown): string | null {
  const s = text(raw, 400);
  if (!s) return null;
  if (s.startsWith('/images/')) return s;
  return cleanUrl(s);
}

/* ── The publish gate ─────────────────────────────────────────────────────────
 * This site states what the candidate did and rules on what others say about
 * him. Both are public claims about a real person, so a row is not publishable
 * until it carries the published report or document that evidences it.
 *
 * Two moments enforce it, and they are the only two:
 *   · creating — the link arrives with the row. There is no "publish now, source
 *     later", because later never comes.
 *   · correcting — an existing link may be replaced, never cleared. Taking a claim
 *     down is a different decision and lives in DELETE, where it stays deliberate.
 *
 * Rows that went live before the gate existed are still editable — refusing a typo
 * fix would keep a wrong sentence on a public page — but the integrity rail grades
 * each of them `block` until it carries a link, and the desk walks the editor to
 * the exact sentence.
 *
 * Every route returns this same wording so the campaign learns one rule instead of
 * one rule per endpoint.
 */
export const EVIDENCE_RULE =
  'A public claim about a real person needs its evidence: paste the link to the published report or document that proves it.';

/** Cleaned evidence link, or the error a route should hand straight back. */
export function evidence(raw: unknown): { url: string; error: null } | { url: null; error: string } {
  const url = cleanUrl(raw);
  return url ? { url, error: null } : { url: null, error: EVIDENCE_RULE };
}

/** PATCH guard: an empty value here means "remove the evidence", which is refused. */
export function keepEvidence(raw: unknown): { url: string; error: null } | { url: null; error: string } {
  if (raw === '' || raw === null || raw === undefined) {
    return { url: null, error: 'The evidence link cannot be emptied. Replace it with another report, or take the entry down from the ledger.' };
  }
  return evidence(raw);
}
