/**
 * publish-broadcast-videos.mjs — file campaign television appearances in the
 * video library through the CMS, the same way the media desk does in /admin.
 *
 * Every id here was found by searching YouTube for the campaign and then
 * confirmed against YouTube's own oEmbed endpoint, which is also what the admin
 * API re-checks on save — so a video that has embedding switched off, or an id
 * that has since been deleted, cannot get into the library from either side.
 * Titles are the broadcaster's own, and the outlet is the channel that published
 * the clip, because the shelf plays the video from that channel.
 *
 * Usage:  node scripts/publish-broadcast-videos.mjs [--base http://127.0.0.1:3100] [--dry-run]
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname.replace(/^\/(\w:)/, '$1'), '..');
const BASE = (() => {
  const i = process.argv.indexOf('--base');
  return i > -1 ? process.argv[i + 1].replace(/\/$/, '') : 'http://127.0.0.1:3100';
})();
const DRY = process.argv.includes('--dry-run');

/** youtube / title / outlet are the fields the admin API takes. */
const CLIPS = [
  {
    youtube: 'https://www.youtube.com/watch?v=r3ouz4Jzgwo',
    title: 'Ola Western Wins APC Primary In Amuwo-Odofin Constituency',
    outlet: 'TVC News Nigeria',
  },
  {
    youtube: 'https://www.youtube.com/watch?v=jbp-N9O_Tg4',
    title: 'APC Stakeholders Rally Support For Ola Western In Amuwo-Odofin',
    outlet: 'TVC News Nigeria',
  },
  {
    youtube: 'https://www.youtube.com/watch?v=hr_0-7fnb5w',
    title: 'Folorunso Ola Emerges Winner Of Amuwo-Odofin',
    outlet: 'TVC News Nigeria',
  },
  {
    youtube: 'https://www.youtube.com/watch?v=8zOZknjsqoU',
    title: 'Amuwo Decides 4.0 — Meet Your Candidates (2023 constituency profile)',
    outlet: 'FestacOnline',
  },
  {
    youtube: 'https://www.youtube.com/watch?v=rh7Q54VwY_8',
    title: 'APC Members In Amuwo-Odofin Lagos March In Support Of Pres. Tinubu',
    outlet: 'TVC News Nigeria',
  },
  {
    youtube: 'https://www.youtube.com/watch?v=jZU6fgVsldA',
    title: 'Amuwo-Odofin Residents In Lagos Promise To Deliver More Votes For APC',
    outlet: 'TVC News Nigeria',
  },
  {
    youtube: 'https://www.youtube.com/watch?v=MmmythWFxmg',
    title: 'Hon. Ola Western Food Festival — Feeding 500 Homes For Christmas',
    outlet: 'Naomi Sophy Blog',
  },
];

function env(key) {
  const file = path.join(ROOT, '.env.local');
  if (!fs.existsSync(file)) return '';
  const line = fs.readFileSync(file, 'utf8').split(/\r?\n/).find((l) => l.startsWith(`${key}=`));
  return line ? line.slice(key.length + 1).trim().replace(/^["']|["']$/g, '') : '';
}

function sessionToken() {
  const secret = env('ADMIN_SECRET') || env('ADMIN_PASSWORD') || 'ola-western-cms-dev-secret';
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 1000 * 60 * 60 })).toString('base64url');
  return `${payload}.${crypto.createHmac('sha256', secret).update(payload).digest('base64url')}`;
}

async function api(pathname, init = {}) {
  const res = await fetch(`${BASE}${pathname}`, {
    ...init,
    headers: { cookie: `ow_admin_session=${sessionToken()}`, 'content-type': 'application/json' },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${pathname} → ${res.status} ${body?.error ?? ''}`.trim());
  return body;
}

const idOf = (url) => new URL(url).searchParams.get('v');
const have = new Set(((await api('/api/admin/videos')).data ?? []).map((v) => v.youtube_id));
let filed = 0;

for (const clip of CLIPS) {
  const id = idOf(clip.youtube);
  if (have.has(id)) { console.log(`= already in the library  ${id}  ${clip.outlet}`); continue; }
  if (DRY) { console.log(`· would verify and file      ${id}  ${clip.outlet}`); continue; }
  const res = await api('/api/admin/videos', { method: 'POST', body: JSON.stringify({ ...clip, published: true }) });
  console.log(`✓ ${id}  ${clip.outlet} — ${res.note ?? 'verified'}`);
  filed++;
}

const after = (await api('/api/admin/videos')).data;
console.log(`\n${filed} filed · library ${after.length} clips, ${after.filter((v) => v.published).length} published`);
