/**
 * imageMeta.ts — dependency-free pixel-dimension probe for uploaded photos.
 *
 * The CMS needs real width/height so a photo can be matched to a frame
 * (portrait vs landscape vs square) instead of guessing from the file name.
 * Supports PNG, JPEG, GIF, WEBP and AVIF/HEIF containers.
 */
export interface ImageMeta {
  width: number;
  height: number;
  type: 'png' | 'jpg' | 'gif' | 'webp' | 'avif' | 'unknown';
  orientation: 'portrait' | 'landscape' | 'square';
}

const from = (w: number, h: number, type: ImageMeta['type']): ImageMeta => ({
  width: w,
  height: h,
  type,
  orientation: w > h * 1.1 ? 'landscape' : h > w * 1.1 ? 'portrait' : 'square',
});

export function probeImage(buf: Buffer): ImageMeta | null {
  if (buf.length < 24) return null;

  // PNG
  if (buf.readUInt32BE(12) === 0x49484452) return from(buf.readUInt32BE(16), buf.readUInt32BE(20), 'png');

  // ISO-BMFF (AVIF / HEIC): look for the 'ispe' property box
  if (buf.toString('latin1', 4, 8) === 'ftyp') {
    const brand = buf.toString('latin1', 8, 12);
    const at = buf.indexOf('ispe');
    if (at > 0 && buf.length > at + 8) return from(buf.readUInt32BE(at + 4), buf.readUInt32BE(at + 8), brand === 'avif' ? 'avif' : 'unknown');
  }

  // GIF / WEBP
  if (buf.readUInt32LE(0) === 0x46494747) {
    const sub = buf.toString('latin1', 12, 16);
    if (sub === 'VP8X') return from(buf.readUIntLE(24, 3) + 1, buf.readUIntLE(27, 3) + 1, 'webp');
    if (sub === 'VP8L') { const b = buf.readUInt32LE(21); return from((b & 0x3fff) + 1, ((b >> 14) & 0x3fff) + 1, 'webp'); }
    if (sub === 'VP8 ') return from(buf.readUInt16LE(28) & 0x3fff, buf.readUInt16LE(30) & 0x3fff, 'webp');
    return from(buf.readUInt16LE(6), buf.readUInt16LE(8), 'gif');
  }

  // JPEG: walk the marker segments to a Start-Of-Frame
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let off = 2;
    while (off + 9 < buf.length) {
      if (buf[off] !== 0xff) { off++; continue; }
      const marker = buf[off + 1];
      const len = buf.readUInt16BE(off + 2);
      const sof = (marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf);
      if (sof) return from(buf.readUInt16BE(off + 7), buf.readUInt16BE(off + 5), 'jpg');
      off += 2 + len;
    }
  }

  return null;
}

/** File extension for a probed image type. */
export const extFor = (t: ImageMeta['type']) => (t === 'jpg' ? 'jpg' : t === 'unknown' ? 'img' : t);
