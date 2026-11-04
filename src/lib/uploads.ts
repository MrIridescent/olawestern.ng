/**
 * uploads.ts — housekeeping for files the CMS desk uploaded to
 * public/images/uploads. Bundled press harvests and generated artwork live under
 * /images/press and /images/generated and belong to the repository, so they are
 * never touched here.
 */
import fs from 'node:fs';
import path from 'node:path';

export const UPLOAD_DIR = path.join(process.cwd(), 'public', 'images', 'uploads');

/** True when a src points at a desk upload rather than bundled artwork. */
export function isUpload(src: string | null | undefined): src is string {
  return !!src && src.startsWith('/images/uploads/');
}

/**
 * Remove an uploaded file once no library row still uses it.
 * The resolved path must stay inside the upload directory, so a crafted src
 * (`/images/uploads/../../.env`) cannot reach anything else.
 */
export function purgeUpload(src: string | null | undefined): boolean {
  if (!isUpload(src)) return false;
  const target = path.resolve(UPLOAD_DIR, path.posix.basename(src));
  if (!target.startsWith(UPLOAD_DIR + path.sep)) return false;
  try {
    fs.rmSync(target, { force: true });
    return true;
  } catch {
    return false;
  }
}
