/**
 * scripts/lib/press-media.mjs — shared helpers for the press media harvesters.
 *
 * Everything here is dependency-free on purpose: the campaign box has no image
 * libraries installed, and a header probe is enough to know whether a photo is
 * big enough for the frame it would fill.
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';
export const MAX_BYTES = 4 * 1024 * 1024;

export const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

/** Absolute URL for a possibly-relative image reference. */
export function absUrl(raw, base) {
  try { return new URL(raw, base).href; } catch { return null; }
}

export async function get(url, opts = {}) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': UA, accept: opts.accept ?? '*/*', referer: opts.referer },
    signal: AbortSignal.timeout(opts.timeout ?? 20000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

export const fetchHtml = (url, referer) => get(url, { accept: 'text/html', referer }).then((r) => r.text());
export const fetchImage = async (url, referer) => {
  const res = await get(url, { accept: 'image/avif,image/webp,image/*,*/*', referer });
  return Buffer.from(await res.arrayBuffer());
};

/** First og:image / twitter:image in an article's HTML. */
export function findOgImage(html) {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m && /^https?:/i.test(m[1])) return m[1];
  }
  return null;
}

const clean = (s) => String(s ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/**
 * Every content image inside the article body, in document order, with whatever
 * caption the outlet attached to it (alt text or figcaption).
 *
 * Icons, logos, avatars, emoji sprites and shared site chrome are skipped by
 * path/attribute heuristics, because a photo gallery is only useful if it holds
 * photographs from the story itself.
 */
export function findBodyImages(html, base) {
  const out = [];
  const seen = new Set();
  // <figure>…<figcaption> or <img …> inside article content blocks.
  const figureRe = /<figure[^>]*>([\s\S]*?)<\/figure>/gi;
  const imgRe = /<img\b[^>]*>/gi;

  const attrs = (tag) => {
    const a = {};
    for (const m of tag.matchAll(/\b(src|data-src|data-lazy-src|alt|class|width|height)=["']([^"']*)["']/gi)) {
      const k = m[1].toLowerCase();
      if (!a[k]) a[k] = m[2];
    }
    return a;
  };

  const skip = (url, a) => {
    if (!url || !/^https?:/i.test(url)) return true;
    if (/(gravatar|\/wp-includes\/|\/logo|avatar|placeholder|sprite|\.svg$|\.ico$|badge|icon|pixel|blank\.)/i.test(url)) return true;
    if (/\b(logo|avatar|icon|site-header|emoji)\b/i.test(a.class ?? '')) return true;
    return false;
  };

  const push = (a, caption) => {
    const url = absUrl(a['data-src'] ?? a['data-lazy-src'] ?? a.src, base);
    if (skip(url, a) || seen.has(url)) return;
    seen.add(url);
    out.push({ url, alt: clean(a.alt), caption: clean(caption) });
  };

  for (const m of html.matchAll(figureRe)) {
    const block = m[1];
    const cap = block.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
    const tag = block.match(imgRe);
    if (tag) push(attrs(tag[0]), cap ? cap[1] : '');
  }

  // Then the plain <img> tags that are not inside a figure (WordPress often
  // emits them bare inside <p> for photo stories).
  const content = html.replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, '');
  for (const m of content.matchAll(imgRe)) {
    const a = attrs(m[0]);
    const url = absUrl(a['data-src'] ?? a['data-lazy-src'] ?? a.src, base);
    if (skip(url, a) || seen.has(url)) continue;
    seen.add(url);
    out.push({ url, alt: clean(a.alt), caption: '' });
  }

  return out;
}

/**
 * WEBP dimensions. A WEBP is a RIFF list of fourcc chunks, and the image data
 * is whichever of VP8X / VP8L / VP8  appears first — the canvas size lives at
 * a different offset in each, and colour-profile or alpha chunks can sit in
 * front of it, so the chunk list has to be walked rather than guessed at fixed
 * byte positions. Animated files hide their frames inside an ANMF chunk, so
 * that payload is walked too.
 */
function webp(buf, from = 12, to = buf.length) {
  // An ANMF payload is a 16-byte frame header followed by that frame's chunks.
  let at = from;
  while (at + 8 <= to) {
    const kind = buf.toString('latin1', at, at + 4);
    const size = buf.readUInt32LE(at + 4);
    const payload = at + 8;
    if (payload + size > to) break;
    if (kind === 'VP8X' && size >= 10) {
      return { w: buf.readUIntLE(payload + 4, 3) + 1, h: buf.readUIntLE(payload + 7, 3) + 1 };
    }
    if (kind === 'VP8L' && size >= 5 && buf[payload] === 0x2f) {
      const bits = buf.readUInt32LE(payload + 1);
      return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
    }
    // Lossy: 3-byte frame tag, then the 0x9d 0x01 0x2a start code and the two
    // 14-bit dimensions.
    if (kind === 'VP8 ' && size >= 10 && buf[payload + 3] === 0x9d && buf[payload + 4] === 0x01 && buf[payload + 5] === 0x2a) {
      return { w: buf.readUInt16LE(payload + 6) & 0x3fff, h: buf.readUInt16LE(payload + 8) & 0x3fff };
    }
    if (kind === 'ANMF') {
      const frame = webp(buf, payload + 16, payload + size);
      if (frame) return frame;
    }
    at = payload + size + (size & 1);
  }
  return null;
}

/** Minimal PNG / JPEG / WEBP / GIF / AVIF-HEIF dimension probe — no image dependency. */
export function probe(buf) {
  const tag = (from, to) => (buf.length > to ? buf.toString('latin1', from, to) : '');
  if (tag(0, 4) === 'GIF8' && buf.length > 10) return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8), type: 'gif' };
  // RIFF container: only WEBP payloads are interesting here. WordPress serves
  // most Nigerian press galleries as WEBP no matter what the file name claims.
  if (tag(0, 4) === 'RIFF' && tag(8, 12) === 'WEBP') {
    const dims = webp(buf);
    return dims ? { ...dims, type: 'webp' } : null;
  }
  if (buf.length > 24 && buf.readUInt32BE(12) === 0x49484452) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20), type: 'png' };
  // ISO-BMFF container (AVIF / HEIC): walk top-level boxes for the 'ispe' property.
  if (tag(4, 8) === 'ftyp') {
    const brand = tag(8, 12);
    const ispe = buf.indexOf('ispe');
    if (ispe > 0 && buf.length > ispe + 8) {
      return { w: buf.readUInt32BE(ispe + 4), h: buf.readUInt32BE(ispe + 8), type: brand === 'avif' ? 'avif' : 'heic' };
    }
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let off = 2;
    while (off + 9 < buf.length) {
      if (buf[off] !== 0xff) { off++; continue; }
      const marker = buf[off + 1];
      const len = buf.readUInt16BE(off + 2);
      // SOF0..SOF3, SOF5..SOF7, SOF9..SOF11, SOF13..SOF15
      if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf)) {
        return { h: buf.readUInt16BE(off + 5), w: buf.readUInt16BE(off + 7), type: 'jpg' };
      }
      off += 2 + len;
    }
  }
  return null;
}

/** The three shapes the layout resolver understands. */
export const orientationOf = (w, h) => (w > h * 1.1 ? 'landscape' : h > w * 1.1 ? 'portrait' : 'square');

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
