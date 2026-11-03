/**
 * publish-press-photos.mjs — file the curated press photographs through the CMS.
 *
 * The harvesters (scripts/harvest-press-media.mjs, harvest-press-extra.mjs) put
 * pictures on disk and write a manifest. Nothing reaches the site until it is in
 * the media library, so this script does what the media desk does in /admin:
 * it authenticates against the real admin API and POSTs / PATCHes the rows.
 * Running it against a fresh store rebuilds the photo library end to end, and
 * running it again is a no-op — it matches on the image path, not on ids.
 *
 * Every entry below was checked against the report it came from: the caption
 * states only what that report states, and no photograph is described as showing
 * the candidate unless the report puts him at the event. The frame each photo is
 * bound to is chosen for its shape as well as its subject — the script prints the
 * crop the 16:9 / 4:5 / 1:1 frame will take, and refuses a photo that loses more
 * than a third of itself.
 *
 * Usage:  node scripts/publish-press-photos.mjs [--base http://127.0.0.1:3100] [--dry-run] [--refresh]
 *
 * Rows already in the library are left alone — the desk edits captions in /admin
 * after filing, and a re-run must not overwrite that work. Pass --refresh to
 * re-assert the copy in this file instead.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname.replace(/^\/(\w:)/, '$1'), '..');
const MANIFEST = path.join(ROOT, 'data', 'press-media-extra.json');
const CONTENT = path.join(ROOT, 'src', 'lib', 'content.ts');
const BASE = (() => {
  const i = process.argv.indexOf('--base');
  return i > -1 ? process.argv[i + 1].replace(/\/$/, '') : 'http://127.0.0.1:3100';
})();
const DRY = process.argv.includes('--dry-run');
const REFRESH = process.argv.includes('--refresh');

/* ── the desk's editorial decisions ───────────────────────────── */

/**
 * file            manifest image path (matched by name)
 * slot            the frame it is bound to, or null for library/gallery only
 * alt             what a screen reader hears — the scene, not a claim about people
 * caption         what the visitor reads — dated, and only what the report says
 * credit          the outlet that took it (links to the report)
 * featured        lead the gallery with it
 */
const CURATED = [
  {
    file: 'festaconline-group-holds-interactive-session-with-political-candidates-in-3.jpg',
    slot: 'town-hall-festac',
    alt: 'Attendees standing inside the hall at the ARBR candidates’ forum in Amuwo-Odofin',
    caption: 'Amuwo Residents for Better Representation candidates’ forum at Canary World, 23 August 2026 — residents questioned the candidates on roads, healthcare, education and jobs.',
    credit: 'Photo: Festac Online',
    featured: true,
  },
  {
    file: 'festaconline-photos-egbedor-emerges-the-8th-penalty-king-wins-cash-prize-4.webp',
    slot: 'youth-tournament',
    alt: 'A boy takes his run-up at the 8th Penalty King competition on a concrete pitch in Festac Town',
    caption: '8th Penalty King competition, Stone Field, 41 Road, Festac Town — 17 December 2023, with over 200 registered across the children’s, adolescents’ and adult categories.',
    credit: 'Photo: Festac Online',
  },
  {
    file: 'festaconline-agboju-land-tussle-traders-protest-against-proposed-demoliti-1.webp',
    slot: 'agboju-market',
    alt: 'Traders and shoppers inside Agboju market on the 2nd Avenue axis of Festac Town',
    caption: 'Agboju market, the 2nd Avenue axis hub behind the Mile 2 trader-protection pledge — from Festac Online’s report on the land tussle and proposed demolition.',
    credit: 'Photo: Festac Online',
  },
  {
    file: 'festaconline-amuwo-odofin-boreholes-construction-and-rehabilitation-weste-1.webp',
    slot: 'boreholes-water',
    alt: 'The Ola Western campaign group with party leaders at a chosen borehole site in Amuwo-Odofin',
    caption: 'Ola Western’s campaign group inspecting a borehole site chosen by ward leaders, Amuwo-Odofin — March 2018, when six boreholes per ward were promised.',
    credit: 'Photo: Festac Online',
  },
  {
    file: 'festaconline-photonews-valentine-buraimoh-others-lead-party-solidarity-wa-1.webp',
    slot: null,
    alt: 'Supporters in Ola Western and APC caps walking in the Amuwo-Odofin party solidarity walk',
    caption: 'APC solidarity walk for the 2023 general election, Amuwo-Odofin, 23 February 2023 — the report names Ola Western as the party’s House of Assembly candidate for Constituency I.',
    credit: 'Photo: Festac Online',
  },
  {
    file: 'festaconline-photonews-valentine-buraimoh-others-lead-party-solidarity-wa-2.webp',
    slot: null,
    alt: 'APC supporters in “A Greater Lagos Rising” attire at the Amuwo-Odofin solidarity walk',
    caption: 'Party leaders and supporters on the same 2023 solidarity walk through Amuwo-Odofin.',
    credit: 'Photo: Festac Online',
  },
  {
    file: 'festaconline-photonews-valentine-buraimoh-others-lead-party-solidarity-wa-5.jpg',
    slot: null,
    alt: 'APC campaign convoy truck carrying supporters during the party solidarity walk',
    caption: 'The party convoy on the 2023 solidarity walk in Amuwo-Odofin.',
    credit: 'Photo: Festac Online',
  },
  {
    file: 'festaconline-photos-egbedor-emerges-the-8th-penalty-king-wins-cash-prize-1.webp',
    slot: null,
    alt: 'Young competitors posing with footballs on the painted pitch at the Penalty King event',
    caption: 'Competitors at the 8th Penalty King competition, Stone Field, 41 Road, Festac Town — December 2023.',
    credit: 'Photo: Festac Online',
  },
  {
    file: 'festaconline-photos-festac-street-soccer-king-holds-debut-edition-1.jpg',
    slot: null,
    alt: 'Two young footballers holding hand-painted anti-drug placards at the Festac Street Soccer King',
    caption: 'Festac Street Soccer King, debut edition — March 2024.',
    credit: 'Photo: Festac Online / Teslim Yusuf',
  },
  {
    file: 'festaconline-amuwo-s-councilman-distributes-food-items-1.webp',
    slot: null,
    alt: 'Beneficiaries of the Ya Koo Yo food distribution seated under a tent with live chickens and food parcels',
    caption: '“Ya Koo Yo” second edition food distribution at the Ola Western campaign office, 3rd Avenue, Festac Town — April 2024, when over 750 residents left with food items and cash gifts.',
    credit: 'Photo: Festac Online',
  },
  {
    file: 'festaconline-photo-story-evacuation-of-festac-drainage-1.webp',
    slot: null,
    alt: 'An Amuwo-Odofin Environmental Task Force pickup parked beside a worker clearing a flooded drain in Festac',
    caption: 'Amuwo-Odofin Environmental Task Force evacuating a blocked drainage channel in Festac Town — November 2023.',
    credit: 'Photo: Festac Online',
  },
  {
    file: 'festaconline-photo-story-evacuation-of-festac-drainage-3.webp',
    slot: null,
    alt: 'A worker inside a drained sewage channel clearing silt by hand in Festac Town',
    caption: 'Silt cleared by hand from a Festac Town sewage channel during the November 2023 drainage evacuation.',
    credit: 'Photo: Festac Online',
  },
];

/* ── frame shapes, read from the same source the site renders ─── */

const RATIOS = { '16:9': 16 / 9, '4:5': 4 / 5, '1:1': 1, '3:4': 3 / 4 };
function frameRatio(slot) {
  const m = fs.readFileSync(CONTENT, 'utf8').match(new RegExp(`\\{ slot: '${slot}',[^}]*ratio: '([^']+)'`));
  return m ? RATIOS[m[1]] ?? 16 / 9 : null;
}

/** What an object-cover frame throws away: the overflowing axis is cropped. */
function cropLoss(photo, frame) {
  const r = photo / frame;
  return r > 1 ? 1 - 1 / r : 1 - r;
}

/* ── admin session, minted the way the CMS mints its own ──────── */

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

/* ── run ──────────────────────────────────────────────────────── */

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const byName = new Map(manifest.map((r) => [path.posix.basename(r.file), r]));
const rows = (await api('/api/admin/media')).data;
const existing = new Map(rows.map((r) => [r.src, r]));
let created = 0;
let updated = 0;

for (const c of CURATED) {
  const rec = byName.get(c.file);
  if (!rec) throw new Error(`${c.file} is not in data/press-media-extra.json — run the harvester first.`);
  if (!fs.existsSync(path.join(ROOT, 'public', rec.file))) throw new Error(`${rec.file} is missing from public/`);
  const src = `/images/press/${c.file}`;

  // Shape check: a photo that loses more than a third of itself in the frame is
  // the wrong photo for that frame, however good it looks in the file browser.
  if (c.slot) {
    const frame = frameRatio(c.slot);
    const loss = cropLoss(rec.width / rec.height, frame);
    const pct = Math.round(loss * 100);
    if (loss > 0.34) throw new Error(`${c.file} (${rec.width}×${rec.height}) loses ${pct}% in the ${c.slot} frame.`);
    console.log(`  ${c.slot.padEnd(20)} ${rec.width}×${rec.height} → frame crops ${pct}% of the ${rec.width > rec.height ? 'height' : 'width'}`);
  }

  const payload = {
    src,
    alt: c.alt,
    caption: c.caption,
    credit: c.credit,
    source_url: rec.source_url,
    width: rec.width,
    height: rec.height,
    orientation: rec.orientation,
    slot: c.slot ?? '',
    published: true,
    featured: !!c.featured,
  };

  if (DRY) { console.log(`· would ${existing.has(src) ? 'patch' : 'file'} ${c.file}`); continue; }
  if (existing.has(src)) {
    if (!REFRESH) { console.log(`= already filed, left as the desk set it ← ${c.file}`); continue; }
    await api(`/api/admin/media/${existing.get(src).id}`, { method: 'PATCH', body: JSON.stringify(payload) });
    updated++;
  } else {
    await api('/api/admin/media', { method: 'POST', body: JSON.stringify(payload) });
    created++;
  }
  console.log(`✓ ${c.slot ?? 'gallery  '} ← ${c.file}`);
}

/** Every position the site renders, in order, straight out of content.ts. */
function allSlots() {
  const block = fs.readFileSync(CONTENT, 'utf8').match(/export const MEDIA_POSITIONS[\s\S]*?\n\] as const;/);
  if (!block) throw new Error('MEDIA_POSITIONS not found in content.ts.');
  return [...block[0].matchAll(/slot: '([^']+)'/g)].map((m) => m[1]);
}

/**
 * One photo per frame. If an earlier seed or a previous desk pass already bound
 * a different picture to one of these frames, the curated photo wins the frame
 * and the other is demoted to library-only — it stays published and keeps
 * appearing in the gallery, it just stops competing for the same position.
 */
const live = (await api('/api/admin/media')).data;
for (const c of CURATED.filter((x) => x.slot)) {
  const wanted = `/images/press/${c.file}`;
  const rivals = live.filter((r) => r.published && r.slot === c.slot && r.src !== wanted);
  for (const rival of rivals) {
    if (DRY) { console.log(`· would release ${c.slot} from ${path.posix.basename(rival.src)}`); continue; }
    await api(`/api/admin/media/${rival.id}`, { method: 'PATCH', body: JSON.stringify({ slot: '' }) });
    console.log(`↩ ${c.slot} released from ${path.posix.basename(rival.src)} (stays in the gallery)`);
  }
}

const after = (await api('/api/admin/media')).data;
const published = after.filter((r) => r.published);
const bound = new Set(published.map((r) => r.slot).filter(Boolean));
const open = allSlots().filter((s) => !bound.has(s));
console.log(`\n${created} filed, ${updated} refreshed · library ${after.length} rows, ${published.length} published`);
console.log(`${bound.size}/${allSlots().length} frames filled · awaiting campaign photography: ${open.join(', ') || 'none'}`);
