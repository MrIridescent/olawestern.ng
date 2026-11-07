/**
 * visits.ts — durable aggregate visitor count.
 *
 * Production (Netlify): Netlify Blobs, a site-wide store that survives
 * deploys. Increments use ETag conditional writes, so two simultaneous
 * visitors cannot overwrite each other's count.
 *
 * Local / self-hosted: a JSON file under DATA_DIR. Real persistence with no
 * configuration, and the same read/increment contract.
 *
 * The counter stores one integer and one timestamp. It stores no IP address,
 * cookie value, user agent or any other personal data.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { getStore, type Store } from '@netlify/blobs';

export interface VisitStats {
  count: number;
  updatedAt: string | null;
}

const STORE_NAME = 'site-metrics';
const KEY = 'visits';
const FILE = path.join(process.env.DATA_DIR ?? path.join(process.cwd(), 'data'), 'visits.json');
const MAX_COUNT = 1_000_000_000;
const MAX_ATTEMPTS = 6;

let store: Store | null = null;
let storeFailed = false;
let fileQueue: Promise<unknown> = Promise.resolve();

/** Netlify injects at least one of these in its build and function runtime. */
function onNetlify(): boolean {
  return Boolean(
    process.env.NETLIFY ||
      process.env.NETLIFY_BLOBS_CONTEXT ||
      process.env.SITE_ID,
  );
}

function blobs(): Store | null {
  if (store) return store;
  if (storeFailed) return null;
  try {
    store = getStore({ name: STORE_NAME, consistency: 'strong' });
    return store;
  } catch {
    storeFailed = true;
    return null;
  }
}

function cleanCount(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.floor(n), MAX_COUNT);
}

function parseStats(value: unknown): VisitStats {
  if (!value || typeof value !== 'object') return { count: 0, updatedAt: null };
  const row = value as { count?: unknown; updatedAt?: unknown };
  return {
    count: cleanCount(row.count),
    updatedAt: typeof row.updatedAt === 'string' ? row.updatedAt : null,
  };
}

/* ── Blobs backend ─────────────────────────────────────────── */

async function readBlobs(s: Store): Promise<VisitStats> {
  const entry = await s.getWithMetadata(KEY, { type: 'json', consistency: 'strong' });
  return parseStats(entry?.data);
}

async function incrementBlobs(s: Store): Promise<VisitStats> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const entry = await s.getWithMetadata(KEY, { type: 'json', consistency: 'strong' });
    const current = parseStats(entry?.data);
    const next: VisitStats = {
      count: cleanCount(current.count + 1),
      updatedAt: new Date().toISOString(),
    };

    // A missing key is created with onlyIfNew; an existing key is replaced only
    // if the ETag still matches what we read. A losing race returns modified:
    // false and the loop re-reads the winner's value.
    const result = entry?.etag
      ? await s.setJSON(KEY, next, { onlyIfMatch: entry.etag })
      : await s.setJSON(KEY, next, { onlyIfNew: true });

    if (result.modified) return next;
  }

  throw new Error('The visitor counter could not record this visit after several attempts.');
}

/* ── File backend (local / self-hosted) ────────────────────── */

function serialize<T>(task: () => Promise<T>): Promise<T> {
  const run = fileQueue.then(task, task);
  fileQueue = run.catch(() => undefined);
  return run;
}

async function readFile(): Promise<VisitStats> {
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    return parseStats(JSON.parse(raw));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return { count: 0, updatedAt: null };
    throw err;
  }
}

async function incrementFile(): Promise<VisitStats> {
  return serialize(async () => {
    const current = await readFile();
    const next: VisitStats = {
      count: cleanCount(current.count + 1),
      updatedAt: new Date().toISOString(),
    };
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    const temp = `${FILE}.${process.pid}.tmp`;
    await fs.writeFile(temp, JSON.stringify(next), 'utf8');
    await fs.rename(temp, FILE);
    return next;
  });
}

/* ── Public contract ───────────────────────────────────────── */

export async function getVisitStats(): Promise<VisitStats> {
  const s = blobs();
  if (s) {
    try {
      return await readBlobs(s);
    } catch (err) {
      // On Netlify a Blobs failure must be reported, never replaced with an
      // empty ephemeral file that would reset the public count.
      if (onNetlify()) throw err;
    }
  }
  return serialize(readFile);
}

export async function recordVisit(): Promise<VisitStats> {
  const s = blobs();
  if (s) {
    try {
      return await incrementBlobs(s);
    } catch (err) {
      if (onNetlify()) throw err;
    }
  }
  return incrementFile();
}
