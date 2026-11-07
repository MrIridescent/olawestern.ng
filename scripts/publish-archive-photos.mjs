/**
 * publish-archive-photos.mjs — file the rebuilt photographic record through the CMS.
 *
 * scripts/sharpen-press-archive.mjs writes the display files and the data the
 * gallery renders. This script does what the media desk would do in /admin: it
 * authenticates against the real admin API and POSTs each frame, so the photos
 * also appear in the carousel and the library grid, and the desk can edit or
 * unpublish any of them.
 *
 * It matches on the image path, so re-running is a no-op. Pass --refresh to
 * re-assert the captions in scripts/press-archive-curated.json.
 *
 * Usage: node scripts/publish-archive-photos.mjs [--base http://127.0.0.1:3100] [--dry-run] [--refresh]
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const CURATED = path.join(ROOT, 'scripts', 'press-archive-curated.json');
const BASE = (() => {
  const i = process.argv.indexOf('--base');
  return i > -1 ? process.argv[i + 1].replace(/\/$/, '') : 'http://127.0.0.1:3100';
})();
const DRY = process.argv.includes('--dry-run');
const REFRESH = process.argv.includes('--refresh');

function env(key) {
  const file = path.join(ROOT, '.env.local');
  if (!fs.existsSync(file)) return '';
  const line = fs.readFileSync(file, 'utf8').split(/\r?\n/).find((l) => l.startsWith(`${key}=`));
  return line ? line.slice(key.length + 1).trim().replace(/^["']|["']$/g, '') : '';
}

function sessionToken() {
  const secret = env('ADMIN_SECRET') || env('ADMIN_PASSWORD') || 'ola-western-cms-dev-secret';
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 1000 * 60 * 60 })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

const COOKIE = `ow_admin_session=${sessionToken()}`;

async function api(pathname, init = {}) {
  const res = await fetch(`${BASE}${pathname}`, {
    ...init,
    headers: { cookie: COOKIE, 'content-type': 'application/json', ...(init.headers ?? {}) },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${pathname} → ${res.status} ${body?.error ?? ''}`.trim());
  return body;
}

const rows = JSON.parse(fs.readFileSync(CURATED, 'utf8'));
const existingRows = (await api('/api/admin/media')).data;
const existing = new Map(existingRows.map((r) => [r.src, r]));

let created = 0;
let updated = 0;

for (const row of rows) {
  const file = path.join(ROOT, 'public', row.out.replace(/^\//, ''));
  if (!fs.existsSync(file)) throw new Error(`${row.out} is missing — run scripts/sharpen-press-archive.mjs first.`);
  const meta = await sharp(file).metadata();
  const payload = {
    src: row.out,
    alt: row.alt,
    caption: row.caption,
    credit: row.credit,
    source_url: row.source_url,
    width: meta.width,
    height: meta.height,
    orientation:
      meta.width === meta.height ? 'square' : meta.width > meta.height ? 'landscape' : 'portrait',
    slot: '',
    published: true,
    featured: !!row.featured,
  };

  if (DRY) {
    console.log(`· would ${existing.has(row.out) ? 'patch' : 'file'} ${row.out}`);
    continue;
  }
  if (existing.has(row.out)) {
    if (!REFRESH) {
      console.log(`= already filed ← ${row.out}`);
      continue;
    }
    await api(`/api/admin/media/${existing.get(row.out).id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    updated++;
  } else {
    await api('/api/admin/media', { method: 'POST', body: JSON.stringify(payload) });
    created++;
  }
  console.log(`✓ ${row.out}`);
}

const after = (await api('/api/admin/media')).data;
console.log(
  `\n${created} filed, ${updated} refreshed · library ${after.length} rows, ${after.filter((r) => r.published).length} published`,
);
