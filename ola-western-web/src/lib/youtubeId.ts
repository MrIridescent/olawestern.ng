/**
 * youtubeId.ts — the one validator both the browser and the server need.
 *
 * Split out of lib/cms.ts because that module imports next/server, which cannot
 * be bundled into a client component. The Live Desk command deck recognises a
 * pasted YouTube link before it asks the server anything, so it needs the same
 * rules the route will apply — imported from here, never copied.
 */
const YT_ID = /^[A-Za-z0-9_-]{11}$/;

/** Accept a bare id, youtu.be/<id>, watch?v=<id>, /shorts/<id>, /embed/<id>, /live/<id>. */
export function extractYoutubeId(raw: unknown): string | null {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  if (YT_ID.test(s)) return s;
  try {
    const u = new URL(s.startsWith('http') ? s : `https://${s}`);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0];
      return YT_ID.test(id) ? id : null;
    }
    const v = u.searchParams.get('v');
    if (v && YT_ID.test(v)) return v;
    const seg = u.pathname.split('/').filter(Boolean);
    const last = seg[seg.length - 1] ?? '';
    if ((seg.includes('shorts') || seg.includes('embed') || seg.includes('live')) && YT_ID.test(last)) return last;
    return null;
  } catch {
    return null;
  }
}
