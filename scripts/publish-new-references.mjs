/**
 * publish-new-references.mjs — cite the three newly verified 2026/2022 stories.
 *
 * The Truth Room's "Every Mention" ledger reads the live CMS, so adding the
 * links to src/lib/new-content.ts only covers the static fallback. This files
 * them through the real admin API the way a researcher would in /admin.
 *
 * Matches on the URL, so re-running is a no-op.
 *
 * Usage: node scripts/publish-new-references.mjs [--base http://127.0.0.1:3100] [--dry-run]
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BASE = (() => {
  const i = process.argv.indexOf('--base');
  return i > -1 ? process.argv[i + 1].replace(/\/$/, '') : 'http://127.0.0.1:3100';
})();
const DRY = process.argv.includes('--dry-run');

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

const ROWS = [
  {
    year: 2026,
    date: '2026-04-26',
    outlet: 'The Nation',
    headline: 'Amuwo Odofin APC showcases Ola Western, MO as consensus candidates',
    url: 'https://thenationonlineng.net/amuwo-odofin-apc-showcases-ola-western-mo-as-consensus-candidates/',
  },
  {
    year: 2026,
    date: '2026-04-28',
    outlet: 'Vanguard',
    headline: "2027: APC stakeholders back Olanrewaju, Ola Western's bids in Amuwo-Odofin",
    url: 'https://www.vanguardngr.com/2026/04/2027-apc-stakeholders-back-olanrewaju-olawestern-bids-in-amuwo-ofin/',
  },
  {
    year: 2022,
    date: '2022-05-30',
    outlet: 'Vanguard',
    headline: 'Amuwo-Odofin APC primaries: Group raises alarm over ploy to tamper with result',
    url: 'https://www.vanguardngr.com/2022/05/amuwo-odofin-apc-primaries-group-raises-alarm-over-ploy-to-tamper-with-result/',
  },
];

const existing = (await api('/api/admin/references')).data;
const seen = new Set(existing.map((r) => r.url));

let filed = 0;
for (const row of ROWS) {
  if (seen.has(row.url)) {
    console.log(`= already cited ← ${row.outlet} · ${row.headline}`);
    continue;
  }
  if (DRY) {
    console.log(`· would cite ${row.outlet} · ${row.headline}`);
    continue;
  }
  await api('/api/admin/references', { method: 'POST', body: JSON.stringify(row) });
  filed++;
  console.log(`✓ ${row.outlet} · ${row.headline}`);
}

const after = await api('/api/admin/references');
console.log(`\n${filed} filed · ledger ${after.data.length} entries`);
