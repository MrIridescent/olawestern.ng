/**
 * revalidate.ts — server-side cache refresh used by every CMS mutation.
 *
 * The public pages are server components with no per-user content, so a change
 * made in the dashboard refreshes the whole set at once. Kept out of client
 * bundles on purpose (importing next/cache from a client component throws).
 */
import { revalidatePath } from 'next/cache';

/** Pages that can show a photo or a video. */
const MEDIA_PAGES = ['/', '/gallery', '/about', '/impact', '/blueprint', '/news', '/contact', '/join', '/truth-room', '/help-desk'];

/** Pages that carry editable campaign copy. */
const COPY_PAGES = ['/', '/about', '/impact', '/contact'];

export function revalidateMedia() {
  for (const p of MEDIA_PAGES) revalidatePath(p);
}

export function revalidateCopy() {
  for (const p of COPY_PAGES) revalidatePath(p);
}

export function revalidateReferences() {
  revalidatePath('/impact');
  revalidatePath('/news');
}
