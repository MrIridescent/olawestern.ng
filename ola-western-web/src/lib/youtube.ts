/**
 * youtube.ts — verification for the video library.
 *
 * A campaign site that renders an empty black player looks broken to the one
 * audience that matters, so the CMS asks YouTube's own oEmbed endpoint whether a
 * video exists and allows embedding before it is saved.
 */

const YT_ID = /^[A-Za-z0-9_-]{11}$/;

export interface EmbedCheck {
  ok: boolean;
  /** Present when the video should not be embedded. */
  error?: string;
  title?: string;
  author?: string;
  thumbnail?: string;
}

export async function checkEmbeddable(raw: unknown): Promise<EmbedCheck> {
  const id = String(raw ?? '').trim();
  if (!YT_ID.test(id)) return { ok: false, error: 'A YouTube video is 11 characters long — check the id or link.' };
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    });
    if (res.status === 401 || res.status === 403) return { ok: false, error: 'This video cannot be embedded — the channel has turned embedding off, or it is private/unlisted.' };
    // YouTube answers 404 for a well-formed id with no video and 400 for an id it
    // cannot resolve at all; both mean the desk has pasted the wrong link.
    if (res.status === 404 || res.status === 400 || res.status === 410) {
      return { ok: false, error: 'YouTube has no video with that id — paste the link from the watch page of the video you want to embed.' };
    }
    if (!res.ok) return { ok: true }; // YouTube is slow or 5xx — do not block the media desk
    const json = (await res.json()) as { title?: string; author_name?: string; thumbnail_url?: string };
    if (!json.title) return { ok: false, error: 'YouTube returned no metadata for that id.' };
    return { ok: true, title: json.title, author: json.author_name, thumbnail: json.thumbnail_url };
  } catch {
    // Offline dev box / blocked egress: the row can still be saved, and the
    // thumbnail rule below is the fallback the player uses anyway.
    return { ok: true };
  }
}

/** Always-available thumbnail — works even when oEmbed is unreachable. */
export const ytThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
