import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest, unauthorized } from '@/lib/admin';
import { probeImage, extFor } from '@/lib/imageMeta';
import { badRequest, serverError } from '@/lib/cms';
import fs from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_BYTES = 10 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'images', 'uploads');

/** `Ola Western 2026 (1).jpg` → `ola-western-2026-1` */
function slug(base: string): string {
  return base
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'photo';
}

/**
 * POST /api/admin/media/upload — multipart image upload.
 *
 * The file is written under public/images/uploads and its real pixel size is
 * read back from the header, so the CMS can match a photo to a frame
 * (portrait / landscape / square) instead of guessing. Nothing is stored in the
 * library until /api/admin/media is called with the returned `src`.
 */
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return badRequest('Send the image as multipart field "file".');
    if (file.size === 0) return badRequest('The uploaded file is empty.');
    if (file.size > MAX_BYTES) return badRequest(`Images must be 10 MB or smaller (this file is ${(file.size / 1048576).toFixed(1)} MB).`);

    const buf = Buffer.from(await file.arrayBuffer());
    const meta = probeImage(buf);
    if (!meta || meta.width < 40 || meta.height < 40) {
      return badRequest('Unsupported or corrupt image — upload a PNG, JPEG, GIF, WEBP or AVIF photo.');
    }

    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const name = `${slug(path.parse(file.name || 'photo').name)}-${Date.now().toString(36)}.${extFor(meta.type)}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);

    return NextResponse.json({
      success: true,
      data: {
        src: `/images/uploads/${name}`,
        width: meta.width,
        height: meta.height,
        orientation: meta.orientation,
        type: meta.type,
        bytes: file.size,
        // A portrait crop usually reads best as the candidate portrait; the
        // dashboard pre-fills alt text from the file name so nothing ships blank.
        suggested_alt: path.parse(file.name || 'photo').name.replace(/[-_]+/g, ' ').trim() || null,
      },
    });
  } catch (err) {
    return serverError(err);
  }
}
