/**
 * harvest-press-media.mjs — one-off media collector for the campaign.
 *
 * Walks the 21 published press sources listed in src/lib/content.ts
 * (REFERENCE_LINKS), reads each article's og:image, downloads the photo and
 * writes a manifest the CMS media library seeds from:
 *
 *   public/images/press/<slug>.<ext>
 *   data/press-media.json   → [{ id, url, path, width, height, credit, source_url, … }]
 *
 * Every image keeps its outlet credit and source-article URL, because these
 * are press photographs owned by the outlets that published them — the site
 * re-publishes them with attribution, and HQ can replace any of them with its
 * own photography from the Media tab in /admin.
 *
 * Usage:  node scripts/harvest-press-media.mjs
 *
 * The one-off first pass. A re-run rebuilds data/press-media.json from scratch,
 * so the second pass (scripts/harvest-press-extra.mjs) is the one the desk uses
 * day to day — it merges by file name and never overwrites this manifest.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  MAX_BYTES, absUrl, fetchHtml, fetchImage, findOgImage, orientationOf, probe, slug, sleep,
} from './lib/press-media.mjs';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname.replace(/^\/(\w:)/, '$1'), '..');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'press');
const MANIFEST = path.join(ROOT, 'data', 'press-media.json');

/** Mirrors REFERENCE_LINKS in src/lib/content.ts (dossier press sources). */
const SOURCES = [
  { year: 2018, date: 'March 2018', outlet: 'Festac Online', headline: 'Good news: 6 wards to get boreholes in Amuwo-Odofin', url: 'https://festaconline.com.ng/good-news-6-wardsto-get-boreholes-amuwoodofin/' },
  { year: 2018, date: 'March 2018', outlet: 'The Nation', headline: 'Council partners investor on CSR projects in Amuwo-Odofin', url: 'https://thenationonlineng.net/council-partners-investor-csr/' },
  { year: 2018, date: 'March 2018', outlet: 'Festac Online', headline: '7th Avenue, Festac to get support on drainage clearing', url: 'https://festaconline.com.ng/7th-avenue-festac-to-get-support-on-drainage-clearing/' },
  { year: 2022, date: 'April 2022', outlet: 'Festac Online', headline: 'Ola Western clinches form for House of Assembly, Amuwo', url: 'https://festaconline.com.ng/ola-western-form-for-house-of-assembly/' },
  { year: 2022, date: 'May 2022', outlet: 'Festac Online', headline: 'Ola Western wins APC Amuwo House of Assembly primaries', url: 'https://festaconline.com.ng/ola-western-wins-amuwo-house-of-assembly-primaries/' },
  { year: 2023, date: 'January 2023', outlet: 'Festac Online', headline: '#AmuwoDecides23 — Meet the Candidates: Hon. Folorunsho', url: 'https://festaconline.com.ng/amuwodecides23-watch-3-mins-with-hon-folorunso/' },
  { year: 2023, date: 'February 2023', outlet: 'Vanguard', headline: '2023 LAHAA Connect canvasses votes in Lagos', url: 'https://www.vanguardngr.com/2023/02/2023-lahaa-connect-canvasses-votes-for-tinubu-sanwo-olu-others-in-lagos/' },
  { year: 2023, date: 'February 2023', outlet: 'The Nation', headline: 'Aspirants in markets to sell Tinubu, Sanwo-Olu', url: 'https://thenationonlineng.net/aspirants-in-markets-to-sell-tinubu-sanwo-olu/' },
  { year: 2024, date: 'March 2024', outlet: 'P.M. Express', headline: 'Ola Western doles out palliatives worth millions to Amuwo-Odofin', url: 'https://pmexpressng.com/hon-ola-western-doles-out-palliatives-worth-millions-of-naira-to-amuwo-odofin-lga-residents/' },
  { year: 2024, date: 'March 2024', outlet: 'The Sun', headline: 'Over 1,000 persons benefit from Ola Western Food Festival', url: 'https://thesun.ng/over-1000-persons-benefit-from-ola-western-food-festival-in-festac/' },
  { year: 2024, date: 'March 2024', outlet: 'Vanguard', headline: 'Easter: APC stalwart distributes food items in Amuwo-Odofin', url: 'https://www.vanguardngr.com/2024/03/easter-apc-stalwart-distributes-food-items-in-amuwo-odofin/' },
  { year: 2024, date: 'March 2024', outlet: 'Nairaland', headline: 'Over 700 households benefit from Hon. Ola Western palliatives', url: 'https://www.nairaland.com/8049217/over-700-households-benefit-hon' },
  { year: 2025, date: 'Mid 2025', outlet: 'Lagos Panorama', headline: 'Amuwo-Odofin residents in monthly environmental sanitation', url: 'https://lagospanorama.com/hamzat-sanusi-lead-amuwo-odofin-residents-in-monthly-environmental-sanitation-exercise/' },
  { year: 2025, date: '2025', outlet: 'P.M. Express', headline: 'Ola Western — Sterling Youth of All Times', url: 'https://pmexpressng.com/ola-western-sterling-youth-of-all-times/' },
  { year: 2025, date: 'December 2025', outlet: 'Vanguard', headline: 'Take Back FESTAC celebrates community builders', url: 'https://www.vanguardngr.com/2025/12/take-back-festac-celebrates-community-builders/' },
  { year: 2025, date: 'December 2025', outlet: 'The Guardian', headline: 'Lawmaker group honour Festac residents', url: 'https://guardian.ng/news/nigeria/metro/lawmaker-group-honour-festac-residents-pledge-community-revival/' },
  { year: 2026, date: 'May 2026', outlet: 'Festac Online', headline: 'Ola Folorunsho emerges APC flagbearer with 3,000+ votes', url: 'https://festaconline.com.ng/ola-folorunsho-emerges-apc-flagbearer-for-amuwo-constituency-i-with-3k-votes/' },
  { year: 2026, date: 'May 2026', outlet: 'P.M. Express', headline: 'Ola Western sweeps APC Amuwo-Odofin Constituency I primaries', url: 'https://pmexpressng.com/ola-western-sweeps-apc-amuwo-odofin-constituency-i-house-of-assembly-primaries/' },
  { year: 2026, date: 'May 2026', outlet: 'P.M. Express', headline: 'APC Amuwo-Odofin rallies behind Ola Western for 2027', url: 'https://pmexpressng.com/apc-amuwo-odofin-rallies-behind-ola-western-unites-for-2027-assembly-poll/' },
  { year: 2026, date: 'May 2026', outlet: 'Festac Online', headline: 'APC unveils consensus candidates for Amuwo-Odofin', url: 'https://festaconline.com.ng/apc-unveils-consensus-candidates-for-assembly-house-of-representatives-in-amuwo-odofin/' },
  { year: 2026, date: 'August 2026', outlet: 'ARBR News', headline: 'Interactive candidate session — Ola Western Folorunsho Olaitan', url: 'https://arbr.com.ng/news/people/ola-western-folorunsho-olaitan/' },
];

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });

const manifest = [];
const failures = [];

for (const src of SOURCES) {
  const tag = `${src.outlet} · ${src.year}`;
  try {
    const html = await fetchHtml(src.url);
    const img = findOgImage(html);
    if (!img) { failures.push([tag, 'no og:image']); continue; }
    const abs = absUrl(img, src.url);
    const buf = await fetchImage(abs, src.url);
    if (buf.length > MAX_BYTES) { failures.push([tag, `too large (${(buf.length / 1e6).toFixed(1)}MB)`]); continue; }
    const dim = probe(buf);
    if (!dim || !dim.w || !dim.h) { failures.push([tag, 'unprobeable image']); continue; }
    if (dim.type === 'heic') { failures.push([tag, 'HEIC (not web-safe)']); continue; }
    const name = `${slug(src.outlet)}-${slug(src.headline)}.${dim.type === 'jpg' ? 'jpg' : dim.type}`;
    const filePath = path.join(OUT_DIR, name);
    fs.writeFileSync(filePath, buf);
    manifest.push({
      id: `press-${src.year}-${slug(src.outlet).slice(0, 18)}`,
      file: `/images/press/${name}`,
      bytes: buf.length,
      width: dim.w,
      height: dim.h,
      ratio: +(dim.w / dim.h).toFixed(3),
      orientation: orientationOf(dim.w, dim.h),
      credit: `Photo: ${src.outlet}`,
      caption: src.headline,
      year: src.year,
      source_url: src.url,
    });
    console.log(`✓ ${tag} → ${name} ${dim.w}×${dim.h} (${(buf.length / 1024).toFixed(0)} KB)`);
  } catch (err) {
    failures.push([tag, err.message]);
    console.log(`✗ ${tag} — ${err.message}`);
  }
  await sleep(700);
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`\n${manifest.length} images → public/images/press/, manifest at data/press-media.json`);
if (failures.length) console.log(`skipped: ${failures.map(([t, r]) => `${t} (${r})`).join('; ')}`);
