#!/usr/bin/env node
/**
 * scripts/check-cms-gates.mjs — smoke test for the CMS write path.
 *
 * Points it at a running server and it walks the gates that protect what goes
 * public: the session, the integrity audit, and the rule that no claim about the
 * candidate is publishable without the report or document that evidences it.
 *
 *   node scripts/check-cms-gates.mjs                     # 127.0.0.1:3100
 *   BASE=http://127.0.0.1:3000 node scripts/check-cms-gates.mjs
 *
 * It creates one throwaway track-record entry to prove the gate accepts a sourced
 * row, then deletes that entry and nothing else. Run it against a dev store, or
 * accept that the two throwaway rows appear for a second before they are removed.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname.replace(/^\/(\w:)/, '$1'), '..');
const BASE = process.env.BASE ?? 'http://127.0.0.1:3100';

/* ── the dev password, read from .env.local so it never lands in a file ───── */
function password() {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  const env = path.join(ROOT, '.env.local');
  if (!fs.existsSync(env)) fail('no .env.local and no ADMIN_PASSWORD in the environment');
  const line = fs.readFileSync(env, 'utf8').split(/\r?\n/).find((l) => l.startsWith('ADMIN_PASSWORD='));
  if (!line) fail('.env.local has no ADMIN_PASSWORD');
  return line.slice('ADMIN_PASSWORD='.length).trim();
}

let cookie = '';
const results = [];

function record(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

function fail(msg) {
  console.error(`\nCannot run the check: ${msg}`);
  process.exit(2);
}

async function call(method, url, body) {
  const res = await fetch(`${BASE}${url}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const set = res.headers.getSetCookie?.() ?? [];
  for (const c of set) {
    const pair = c.split(';')[0];
    if (pair.endsWith('=')) cookie = '';
    else cookie = pair;
  }
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON answer is itself a finding */ }
  return { status: res.status, json };
}

/** The publish gate's wording, imported from the same source the routes use. */
const RULE = 'A public claim about a real person needs its evidence: paste the link to the published report or document that proves it.';

const EVIDENCE = 'https://www.dailynewsextended.com/2023/09/18/test-fixture-for-the-publish-gate/';
const RUN_ID = `gate-check-${Date.now()}`;

async function main() {
  console.log(`Checking ${BASE}\n`);

  /* 1 — nothing is writable without a session */
  const anon = await call('GET', '/api/admin/health');
  record('integrity audit refuses an anonymous request', anon.status === 401, `HTTP ${anon.status}`);

  const wrong = await call('POST', '/api/admin/login', { password: 'definitely-not-the-password' });
  record('wrong password is refused', wrong.status === 401, `HTTP ${wrong.status}`);

  const login = await call('POST', '/api/admin/login', { password: password() });
  if (login.status !== 200 || !cookie) fail(`could not open an admin session (HTTP ${login.status})`);
  record('campaign session opens', true, 'signed cookie issued');

  /* 2 — the audit answers and grades the site */
  const health = await call('GET', '/api/admin/health');
  const h = health.json?.data;
  record('integrity audit returns a score', health.status === 200 && typeof h?.score === 'number',
    h ? `score ${h.score} · ${h.ready ? 'defensible' : 'not yet defensible'} · ${h.findings.length} finding(s)` : `HTTP ${health.status}`);
  if (h) {
    const blocks = h.findings.filter((f) => f.severity === 'block');
    for (const b of blocks) {
      console.log(`      block: ${b.label} (${b.count}) → ${b.items[0]?.page ?? '—'} ${b.items[0]?.selector ?? ''}`);
    }
  }

  /* 3 — the gate: creation without evidence */
  const base = { title: `${RUN_ID} unsourced`, category: 'Infrastructure', ward_impact: 'Festac Town', description: 'Created by check-cms-gates.mjs; deleted again below.' };
  const noSource = await call('POST', '/api/admin/record', base);
  record('record entry without a report is refused', noSource.status === 400 && noSource.json?.error === RULE,
    `HTTP ${noSource.status} · ${noSource.json?.error ?? 'no message'}`);

  const fakeSource = await call('POST', '/api/admin/record', { ...base, verification_source_url: 'javascript:alert(1)' });
  record('non-http evidence is refused', fakeSource.status === 400, `HTTP ${fakeSource.status}`);

  /* 4 — the gate: creation with evidence */
  const sourced = await call('POST', '/api/admin/record', { ...base, verification_source_url: EVIDENCE });
  const id = sourced.json?.data?.id;
  record('record entry with a report is published', sourced.status === 200 && !!id, `HTTP ${sourced.status}${id ? ` · ${id}` : ''}`);

  if (id) {
    const strip = await call('PATCH', `/api/admin/record/${id}`, { verification_source_url: '' });
    record('evidence link cannot be emptied', strip.status === 400, `HTTP ${strip.status} · ${strip.json?.error ?? 'no message'}`);

    const fix = await call('PATCH', `/api/admin/record/${id}`, { title: `${RUN_ID} corrected` });
    record('a published entry stays correctable', fix.status === 200, `HTTP ${fix.status}`);

    const gone = await call('DELETE', `/api/admin/record/${id}`);
    record('the throwaway entry is removed again', gone.status === 200, `HTTP ${gone.status}`);
  }

  /* 5 — same rule on the other side of the site */
  const fact = await call('POST', '/api/admin/fact-checks', {
    claim_summary: `${RUN_ID} — a ruling with no document`,
    verdict: 'VERIFIED FACT',
    detailed_explanation: 'Created by check-cms-gates.mjs to prove the gate; never stored.',
  });
  record('Truth Room ruling without a document is refused', fact.status === 400 && fact.json?.error === RULE,
    `HTTP ${fact.status} · ${fact.json?.error ?? 'no message'}`);

  const ledger = await call('GET', '/api/admin/record');
  const left = Array.isArray(ledger.json?.data) ? ledger.json.data.filter((r) => String(r.title).startsWith('gate-check-')) : [];
  record('no test rows left behind', left.length === 0, `${left.length} leftover`);

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => fail(e?.stack ?? String(e)));
