/**
 * harvest-press-extra.mjs — the second pass of the press photo harvest.
 *
 * The first pass (scripts/harvest-press-media.mjs) took one photo per article:
 * the og:image, which became the seeded gallery. Every article usually carries
 * more photographs inside the body — the town hall, the market walk, the
 * tournament, the drainage works — and those are what still missing from the
 * site's open frames.
 *
 * This script walks the campaign's own source list (REFERENCE_LINKS, read
 * straight out of src/lib/content.ts so the two can never drift apart) plus the
 * EXTRA_SOURCES below, pulls every content image it can find in each article,
 * downloads it, probes its real pixel size, and writes a manifest the desk can
 * review:
 *
 *   public/images/press/<outlet>-<headline>-<n>.<ext>
 *   data/press-media-extra.json
 *
 * It does not touch data/press-media.json, the seeded gallery, or the store —
 * nothing reaches the site until the CMS publishes it. Images are kept with the
 * outlet's own alt/caption text so a photo is only ever described the way the
 * report described it.
 *
 * Usage:  node scripts/harvest-press-extra.mjs [--min-long 900] [--min-short 320] [--max-per-article 8]
 *         node scripts/harvest-press-extra.mjs --offline   # re-probe the files already on disk
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  MAX_BYTES, absUrl, fetchHtml, fetchImage, findBodyImages, findOgImage,
  orientationOf, probe, slug, sleep,
} from './lib/press-media.mjs';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname.replace(/^\/(\w:)/, '$1'), '..');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'press');
const MANIFEST = path.join(ROOT, 'data', 'press-media-extra.json');
const CONTENT = path.join(ROOT, 'src', 'lib', 'content.ts');

const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? Number(process.argv[i + 1]) : dflt;
};
// Size is judged against how the frames are actually displayed: a 16:9 band is
// ~700 CSS px wide on a phone and ~1100 on desktop, so a long side under 900 or a
// short side under 320 would blur. Anything smaller is reported, not kept.
const MIN_LONG = arg('min-long', 900);
const MIN_SHORT = arg('min-short', 320);
const MAX_PER_ARTICLE = arg('max-per-article', 8);

/** Additional reporting that the dossier list does not carry. */
const EXTRA_SOURCES = [
  { year: 2024, date: 'April 2024', outlet: 'FestacOnline', headline: "Amuwo's councilman distributes food items", url: 'https://festaconline.com.ng/amuwos-councilman-distributes-food-items/' },
  { year: 2026, date: 'September 2026', outlet: 'FestacOnline', headline: 'Group holds interactive session with political candidates in Amuwo-Odofin', url: 'https://festaconline.com.ng/group-holds-interactive-session-with-political-candidates-in-amuwo-odofin/' },
  { year: 2024, date: 'January 2024', outlet: 'FestacOnline', headline: 'Photos: Egbedor emerges the 8th Penalty King, wins cash prize', url: 'https://festaconline.com.ng/egbedor-emerges-the-8th-penalty-king-wins-cash-prize-see-details/' },
  { year: 2024, date: 'March 2024', outlet: 'FestacOnline', headline: 'Photos: Festac Street Soccer King holds debut edition', url: 'https://festaconline.com.ng/street-soccer-king-photo-story/' },
  { year: 2023, date: 'November 2023', outlet: 'FestacOnline', headline: 'Photo story: evacuation of Festac drainage', url: 'https://festaconline.com.ng/photostory-evacuation-of-festac-drainage/' },
  // Found by following the campaign's own reporting: the walk's report names
  // "Hon. Folorunso Ola Western for Lagos State House of Assembly, Amuwo-Odofin
  // Constituency I" among the candidates it was walking for (published 23 Feb 2023).
  { year: 2023, date: 'February 2023', outlet: 'FestacOnline', headline: 'Photonews: Valentine Buraimoh, others lead party solidarity walk', url: 'https://festaconline.com.ng/photonews-valentine-buraimoh-others-lead-party-solidarity-walk/' },
  { year: 2018, date: 'March 2018', outlet: 'FestacOnline', headline: 'Amuwo-Odofin boreholes: construction and rehabilitation, Western Concrete', url: 'https://festaconline.com.ng/amuwo-odofin-boreholes-construction-rehabilitation-western-concrete/' },
  // The market the Mile 2 pledge is about, photographed by the local paper.
  { year: 2018, date: 'December 2018', outlet: 'FestacOnline', headline: 'Agboju: land tussle, traders protest against proposed demolition', url: 'https://festaconline.com.ng/agboju-land-tussle-traders-protest-demolition/' },
];

/** REFERENCE_LINKS, parsed from the source of truth rather than copied. */
function dossierSources() {
  const ts = fs.readFileSync(CONTENT, 'utf8');
  const block = ts.match(/export const REFERENCE_LINKS[^=]*=\s*\[([\s\S]*?)\n\];/);
  if (!block) throw new Error('REFERENCE_LINKS not found in content.ts — the harvester would go out of sync.');
  const rows = [];
  for (const m of block[1].matchAll(/\{\s*year:\s*(\d+),\s*date:\s*'([^']*)',\s*outlet:\s*'([^']*)',\s*headline:\s*'([^']*)',\s*url:\s*'([^']*)'/g)) {
    rows.push({ year: Number(m[1]), date: m[2], outlet: m[3], headline: m[4], url: m[5] });
  }
  return rows;
}

const seenFiles = new Set();
const manifest = [];
const notes = [];

async function harvest(src) {
  const tag = `${src.outlet} · ${src.year} · ${src.headline.slice(0, 44)}`;
  let html;
  try {
    html = await fetchHtml(src.url, undefined);
  } catch (err) {
    notes.push(`${tag}: fetch failed (${err.message})`);
    return;
  }
  const og = findOgImage(html) ? absUrl(findOgImage(html), src.url) : null;
  const body = findBodyImages(html, src.url);
  // The og:image is usually the first body image; keep it only if it is distinct.
  const candidates = [...body, ...(og && !body.some((b) => b.url === og) ? [{ url: og, alt: '', caption: '' }] : [])];
  if (!candidates.length) { notes.push(`${tag}: no content images`); return; }

  let kept = 0;
  for (const c of candidates.slice(0, MAX_PER_ARTICLE * 3)) {
    if (kept >= MAX_PER_ARTICLE) break;
    const base = path.basename(c.url.split('?')[0]);
    if (seenFiles.has(c.url)) continue;
    let buf;
    try {
      buf = await fetchImage(c.url, src.url);
    } catch (err) {
      notes.push(`${tag}: ${base} download failed (${err.message})`);
      continue;
    }
    seenFiles.add(c.url);
    if (!buf?.length) { notes.push(`${tag}: ${base} empty`); continue; }
    if (buf.length > MAX_BYTES) { notes.push(`${tag}: ${base} too large (${(buf.length / 1e6).toFixed(1)}MB)`); continue; }
    const dim = probe(buf);
    if (!dim || !dim.w || !dim.h) { notes.push(`${tag}: ${base} not a probeable image`); continue; }
    if (dim.type === 'heic') { notes.push(`${tag}: ${base} is HEIC`); continue; }
    // A banner or a tracker pixel is not a photograph, however big it is.
    if (Math.max(dim.w, dim.h) / Math.min(dim.w, dim.h) > 6) {
      notes.push(`${tag}: ${base} ${dim.w}×${dim.h} is a strip, not a photo`);
      continue;
    }
    if (Math.max(dim.w, dim.h) < MIN_LONG || Math.min(dim.w, dim.h) < MIN_SHORT) {
      notes.push(`${tag}: ${base} ${dim.w}×${dim.h} below ${MIN_LONG}×${MIN_SHORT}`);
      continue;
    }
    const ext = dim.type === 'jpg' ? 'jpg' : dim.type;
    const name = `${slug(src.outlet)}-${slug(src.headline)}-${kept + 1}.${ext}`;
    fs.writeFileSync(path.join(OUT_DIR, name), buf);
    kept++;
    manifest.push({
      id: `pressx-${slug(src.outlet).slice(0, 16)}-${slug(src.headline).slice(0, 28)}-${kept}`,
      file: `/images/press/${name}`,
      bytes: buf.length,
      width: dim.w,
      height: dim.h,
      orientation: orientationOf(dim.w, dim.h),
      alt: c.alt,
      caption: c.caption || c.alt,
      credit: `Photo: ${src.outlet}`,
      outlet: src.outlet,
      year: src.year,
      date: src.date,
      headline: src.headline,
      source_url: src.url,
      image_url: c.url,
    });
    console.log(`✓ ${tag} · #${kept} ${name} ${dim.w}×${dim.h} ${orientationOf(dim.w, dim.h)}${c.alt ? ` — "${c.alt.slice(0, 40)}"` : ''}`);
  }
  if (!kept) notes.push(`${tag}: nothing large enough kept`);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });

/**
 * --offline: the photos are already on disk, so only the header probe changed.
 * Re-read every file the manifest points at and rewrite its dimensions, which
 * repairs a stale manifest without touching the network or re-downloading.
 */
if (process.argv.includes('--offline')) {
  if (!fs.existsSync(MANIFEST)) { console.error('no manifest to repair'); process.exit(1); }
  const rows = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const kept = [];
  for (const row of rows) {
    const file = path.join(ROOT, 'public', row.file);
    if (!fs.existsSync(file)) { console.log(`✗ ${row.file} — missing`); continue; }
    const buf = fs.readFileSync(file);
    const dim = probe(buf);
    if (!dim?.w || !dim?.h) { console.log(`✗ ${row.file} — unprobeable`); continue; }
    const ratio = Math.max(dim.w, dim.h) / Math.min(dim.w, dim.h);
    if (ratio > 6) { console.log(`✗ ${row.file} — ${dim.w}×${dim.h} is a strip, not a photo`); continue; }
    kept.push({ ...row, bytes: buf.length, width: dim.w, height: dim.h, orientation: orientationOf(dim.w, dim.h) });
    console.log(`✓ ${path.basename(row.file)} ${dim.w}×${dim.h} ${orientationOf(dim.w, dim.h)}`);
  }
  fs.writeFileSync(MANIFEST, JSON.stringify(kept, null, 2));
  console.log(`\n${kept.length}/${rows.length} rows re-probed from disk → ${path.relative(ROOT, MANIFEST)}`);
  process.exit(0);
}

// --only <a,b>: work through just the articles whose URL contains one of the
// comma-separated tokens, and merge into the manifest instead of replacing it,
// so one late find does not mean re-downloading the whole press archive.
const sources0 = [...dossierSources(), ...EXTRA_SOURCES];
const only = (() => { const i = process.argv.indexOf('--only'); return i > -1 ? process.argv[i + 1] : null; })();
const tokens = only ? only.split(',').map((s) => s.trim()).filter(Boolean) : [];
const existing = only && fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : [];
const byFile = new Map(existing.map((r) => [r.file, r]));
const sources = tokens.length ? sources0.filter((s) => tokens.some((t) => s.url.includes(t))) : sources0;
console.log(`harvesting ${sources.length} article${only ? ' (merge)' : 's'} (min ${MIN_LONG}×${MIN_SHORT}, max ${MAX_PER_ARTICLE}/article)\n`);
for (const src of sources) {
  await harvest(src);
  await sleep(500);
}
for (const row of manifest) byFile.set(row.file, row);
const merged = [...byFile.values()];

fs.writeFileSync(MANIFEST, JSON.stringify(merged, null, 2));
console.log(`\n${merged.length} images → public/images/press/  ·  manifest: data/press-media-extra.json`);
if (notes.length) console.log(`\nskipped / notes:\n  ${notes.join('\n  ')}`);
