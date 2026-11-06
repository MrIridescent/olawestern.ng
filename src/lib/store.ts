/**
 * store.ts — the campaign's real data layer.
 *
 * Two interchangeable backends, same interface:
 *  • Supabase (Postgres + RLS) — used automatically when credentials exist.
 *  • File store (data/db.json) — real persistence with zero configuration,
 *    for `npm run build && npm start`, self-hosting and pitch demos.
 *
 * Everything (Truth Engine ledger, press releases, track record, volunteer
 * leads, Ask-Ola inquiries) is genuinely stored and editable through the
 * admin CMS — nothing on this layer is a stub.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { getSupabase, getSupabaseAdmin, getWriteClient } from './supabase';
import { SEED_ACCOMPLISHMENTS, SEED_FACT_CHECKS, SEED_PRESS_ITEMS, SEED_SETTINGS, SEED_VERSION } from './content';
import type {
  Accomplishment, CommunityIssue, FactCheck, MediaAsset, PressItem, ProfileFactRow,
  PublicIssue, ReferenceRow, SiteSettings, SocialRow, VideoItem,
} from '@/types';

export interface VolunteerLead {
  id: string;
  created_at: string;
  full_name: string;
  phone_number: string;
  email: string | null;
  ward_location: string;
  address_street: string | null;
  polling_unit_code: string | null;
  primary_concern: string;
  status: string;
  /**
   * When the volunteer ticked the NDPA 2023 data-processing box. The form cannot
   * be submitted without it, so a lead always carries the timestamp — and the
   * campaign can answer a deletion or objection request with the date consent was
   * captured instead of asserting it.
   */
  consent_at?: string | null;
}

export interface Inquiry {
  id: string;
  created_at: string;
  full_name: string;
  phone_number: string;
  ward: string;
  message_type: string;
  message_body: string;
  status: 'new' | 'reviewed' | 'answered';
}

interface Db {
  seed_version?: string;
  volunteers: VolunteerLead[];
  inquiries: Inquiry[];
  fact_checks: FactCheck[];
  accomplishments: Accomplishment[];
  press_releases: PressItem[];
  issues: CommunityIssue[];
  media: MediaAsset[];
  videos: VideoItem[];
  profile_facts: ProfileFactRow[];
  socials: SocialRow[];
  references: ReferenceRow[];
  settings: SiteSettings;
  /**
   * Ids the desk deleted deliberately. A bundled seed row is otherwise restored
   * on the next content drop, so a withdrawn photo or retracted citation would
   * silently come back — a tombstone keeps it gone.
   */
  removed?: string[];
}

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

let cache: Db | null = null;

function freshDb(): Db {
  return {
    seed_version: SEED_VERSION,
    volunteers: [],
    inquiries: [],
    fact_checks: SEED_FACT_CHECKS.map((f) => ({ ...f })),
    accomplishments: SEED_ACCOMPLISHMENTS.map((a) => ({ ...a })),
    press_releases: SEED_PRESS_ITEMS.map((p) => ({ ...p })),
    issues: [],
    media: [],
    videos: [],
    profile_facts: [],
    socials: [],
    references: [],
    settings: SEED_SETTINGS,
    removed: [],
  };
}

/**
 * Refresh the bundled seed rows when content.ts ships a new SEED_VERSION,
 * without touching anything the campaign actually collected: leads always
 * survive, and CMS-created ledger rows (ids the bundle does not own) survive.
 */
/**
 * Remember that the desk deleted a row on purpose.
 * Only ids owned by the bundled seeds need this — a CMS-created row has nothing
 * to resurrect it, so the tombstone list stays a record of deliberate removals
 * rather than a log of every deletion ever made.
 */
function tombstone(db: Db, id: string) {
  const seeded = (Object.values(freshDb()) as unknown[]).some(
    (rows) => Array.isArray(rows) && rows.some((r) => (r as { id?: string })?.id === id),
  );
  if (!seeded) return;
  const gone = db.removed ?? [];
  db.removed = gone.includes(id) ? gone : [...gone, id];
}

function resyncSeeds(db: Db): boolean {
  if (db.seed_version === SEED_VERSION) return false;
  const base = freshDb();

  const merge = <T extends { id: string }>(bundled: T[], stored: T[]): T[] => {
    const owned = new Set(bundled.map((r) => r.id));
    return [...bundled, ...stored.filter((r) => !owned.has(r.id))];
  };

  db.fact_checks = merge(base.fact_checks, db.fact_checks);
  db.accomplishments = merge(base.accomplishments, db.accomplishments);
  db.press_releases = merge(base.press_releases, db.press_releases);

  // A row the desk deleted stays deleted, even when a later content drop bundles it again.
  const gone = new Set(db.removed ?? []);
  if (gone.size) {
    const keep = <T extends { id: string }>(rows: T[]) => rows.filter((r) => !gone.has(r.id));
    db.fact_checks = keep(db.fact_checks);
    db.accomplishments = keep(db.accomplishments);
    db.press_releases = keep(db.press_releases);
  }

  db.seed_version = SEED_VERSION;
  return true;
}

function load(): Db {
  if (cache) return cache;
  try {
    // Read forward-compatibly: a db.json written by an older build may be
    // missing collections (or the seed_version marker). Normalise to empty
    // arrays rather than seeding them here — resyncSeeds() below is the only
    // place bundled seed rows are introduced, so it can tell a genuinely old
    // store apart from a store that has already been refreshed.
    const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) as Partial<Db>;
    const base = freshDb();
    cache = {
      seed_version: parsed.seed_version,
      volunteers: parsed.volunteers ?? [],
      inquiries: parsed.inquiries ?? [],
      fact_checks: parsed.fact_checks ?? [],
      accomplishments: parsed.accomplishments ?? [],
      press_releases: parsed.press_releases ?? [],
      issues: parsed.issues ?? [],
      media: parsed.media ?? [],
      videos: parsed.videos ?? [],
      profile_facts: parsed.profile_facts ?? [],
      socials: parsed.socials ?? [],
      references: parsed.references ?? [],
      settings: parsed.settings && parsed.settings.hero_title ? parsed.settings : base.settings,
      removed: parsed.removed ?? [],
    };
    if (resyncSeeds(cache)) save();
  } catch {
    cache = freshDb();
    save();
  }
  return cache!;
}

/** Bounded busy-wait: save() is synchronous, so a timer would need an async rewrite. */
function waitSync(ms: number) {
  const end = Date.now() + ms;
  while (Date.now() < end) { /* give the lock holder a moment to let go */ }
}

/**
 * Write the store out atomically.
 *
 * On Windows a file that was just created can still be held for a moment by
 * antivirus or a concurrent reader, and a plain renameSync then throws EPERM —
 * which would fail a perfectly good CMS write. The rename is retried with short
 * waits and falls back to writing in place. If every attempt fails the change is
 * still live in memory, so the next save flushes it; the desk is told the file
 * was locked rather than shown a bare stack trace.
 */
function save() {
  if (!cache) return;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const json = JSON.stringify(cache, null, 2);
  const tmp = DB_FILE + '.tmp';
  const strategies: (() => void)[] = [
    () => { fs.writeFileSync(tmp, json); fs.renameSync(tmp, DB_FILE); },
    () => fs.writeFileSync(DB_FILE, json),
  ];
  for (const attempt of strategies) {
    for (let i = 0; i < 3; i++) {
      try {
        attempt();
        return;
      } catch (err) {
        const code = (err as NodeJS.ErrnoException).code;
        if (code !== 'EPERM' && code !== 'EBUSY' && code !== 'EACCES') throw err;
        waitSync(25 * (i + 1));
      }
    }
  }
  throw new Error('The data file is locked by another process. This change is held in memory and will be written on the next save — close whatever has data/db.json open and save again.');
}

const now = () => new Date().toISOString();
const uid = () => crypto.randomUUID();

/** Which backend is live? 'supabase' when configured, else 'file'. */
export function backend(): 'supabase' | 'file' {
  return getSupabase() ? 'supabase' : 'file';
}

/**
 * What the desk is actually writing to, in terms the CMS can print.
 *
 * Reads use the anon key so RLS can keep unpublished rows off the public pages;
 * writes need the service-role key, because every campaign table is write-protected
 * for anonymous requests. The two are reported apart deliberately: a site can be
 * configured for Supabase and still refuse to save until
 * SUPABASE_SERVICE_ROLE_KEY is set.
 */
export function storageState(): { backend: 'supabase' | 'file'; writable: boolean } {
  if (!getSupabase()) return { backend: 'file', writable: true };
  return { backend: 'supabase', writable: !!getSupabaseAdmin() };
}

/* ── Truth Engine ledger ─────────────────────────────────────── */

/**
 * Rows written by the pre-CMS schema carry `claim`/`status` and no `created_at`.
 * They cannot render as a FactCard (no verdict, evidence or date), so the public
 * ledger only surfaces records in the current shape. The originals stay in the
 * data file untouched for a future migration.
 */
function isFactCheck(row: unknown): row is FactCheck {
  const r = row as Partial<FactCheck> | null;
  return (
    !!r &&
    typeof r.id === 'string' &&
    typeof r.claim_summary === 'string' &&
    r.claim_summary.trim().length > 0 &&
    typeof r.created_at === 'string' &&
    r.created_at.length > 0 &&
    (r.verdict === 'VERIFIED FACT' || r.verdict === 'FALSE CLAIM' || r.verdict === 'MISLEADING')
  );
}

export async function listFactChecks(): Promise<FactCheck[]> {
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb.from('fact_checks').select('*').order('is_featured', { ascending: false }).order('created_at', { ascending: false });
    const rows = (data ?? []).filter(isFactCheck);
    if (rows.length) return rows;
  }
  return load()
    .fact_checks.filter(isFactCheck)
    .sort(
      (a, b) =>
        Number(!!b.is_featured) - Number(!!a.is_featured) ||
        b.created_at.localeCompare(a.created_at),
    );
}

export async function addFactCheck(input: Omit<FactCheck, 'id' | 'created_at'> & { id?: string }): Promise<FactCheck> {
  const sb = getWriteClient();
  const rec: FactCheck = {
    id: input.id ?? uid(),
    created_at: now(),
    claim_summary: input.claim_summary,
    verdict: input.verdict,
    detailed_explanation: input.detailed_explanation,
    official_document_url: input.official_document_url ?? null,
    is_featured: !!input.is_featured,
  };
  if (sb) {
    const { error } = await sb.from('fact_checks').insert([rec]);
    if (error) throw error;
    return rec;
  }
  const db = load();
  db.fact_checks.unshift(rec);
  save();
  return rec;
}

export async function updateFactCheck(id: string, patch: Partial<FactCheck>): Promise<boolean> {
  const sb = getWriteClient();
  if (sb) {
    const { error } = await sb.from('fact_checks').update(patch).eq('id', id);
    return !error;
  }
  const db = load();
  const i = db.fact_checks.findIndex((f) => f.id === id);
  if (i < 0) return false;
  db.fact_checks[i] = { ...db.fact_checks[i], ...patch, id };
  save();
  return true;
}

export async function deleteFactCheck(id: string): Promise<boolean> {
  const sb = getWriteClient();
  if (sb) {
    const { error } = await sb.from('fact_checks').delete().eq('id', id);
    return !error;
  }
  const db = load();
  const before = db.fact_checks.length;
  db.fact_checks = db.fact_checks.filter((f) => f.id !== id);
  tombstone(db, id);
  save();
  return db.fact_checks.length < before;
}

/* ── Track record (accomplishments) ──────────────────────────── */

export async function listAccomplishments(): Promise<Accomplishment[]> {
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb.from('accomplishments').select('*').order('created_at', { ascending: false });
    if (data && data.length) return data as Accomplishment[];
  }
  return [...load().accomplishments].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function addAccomplishment(input: Omit<Accomplishment, 'id' | 'created_at'>): Promise<Accomplishment> {
  const sb = getWriteClient();
  const rec: Accomplishment = { id: uid(), created_at: now(), ...input };
  if (sb) {
    const { error } = await sb.from('accomplishments').insert([rec]);
    if (error) throw error;
    return rec;
  }
  load().accomplishments.unshift(rec);
  save();
  return rec;
}

export async function updateAccomplishment(id: string, patch: Partial<Accomplishment>): Promise<boolean> {
  const sb = getWriteClient();
  if (sb) {
    const { error } = await sb.from('accomplishments').update(patch).eq('id', id);
    return !error;
  }
  const db = load();
  const i = db.accomplishments.findIndex((a) => a.id === id);
  if (i < 0) return false;
  db.accomplishments[i] = { ...db.accomplishments[i], ...patch, id };
  save();
  return true;
}

export async function deleteAccomplishment(id: string): Promise<boolean> {
  const sb = getWriteClient();
  if (sb) {
    const { error } = await sb.from('accomplishments').delete().eq('id', id);
    return !error;
  }
  const db = load();
  const before = db.accomplishments.length;
  db.accomplishments = db.accomplishments.filter((a) => a.id !== id);
  tombstone(db, id);
  save();
  return db.accomplishments.length < before;
}

/* ── Press / newsfeed ────────────────────────────────────────── */

/**
 * Newsroom releases. Public pages pass `publishedOnly` so a release the desk took
 * offline disappears from the feed without being deleted.
 */
export async function listPress(opts?: { publishedOnly?: boolean }): Promise<PressItem[]> {
  const sb = getSupabase();
  if (sb) {
    let q = sb.from('press_releases').select('*').order('published_at', { ascending: false });
    if (opts?.publishedOnly) q = q.not('published_at', 'is', null);
    const { data } = await q;
    if (data && data.length) {
      return (data as any[]).map((r) => ({ ...r, summary: r.summary ?? r.excerpt ?? '' }));
    }
  }
  const rows = [...load().press_releases].sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? ''));
  return opts?.publishedOnly ? rows.filter((p) => p.published_at) : rows;
}

export async function addPress(input: {
  title: string; summary: string; body: string; source: PressItem['source']; pdf_url?: string | null; publish?: boolean;
}): Promise<PressItem> {
  const slug = input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) + '-' + uid().slice(0, 6);
  const sb = getWriteClient();
  const rec: PressItem = {
    id: uid(),
    created_at: now(),
    published_at: input.publish === false ? null : now(),
    slug,
    title: input.title,
    summary: input.summary,
    body: input.body,
    source: input.source,
    pdf_url: input.pdf_url ?? null,
  };
  if (sb) {
    // The table calls the standfirst `excerpt`; the app calls it `summary`.
    // Send only real columns — PostgREST rejects an insert carrying a key the
    // schema does not have, which would fail the write outright.
    const { summary, ...columns } = rec;
    const { error } = await sb.from('press_releases').insert([{ ...columns, excerpt: summary }]);
    if (error) throw error;
    return rec;
  }
  load().press_releases.unshift(rec);
  save();
  return rec;
}

/**
 * Correct a release the desk already filed — including taking it back offline
 * (`published_at: null`) without losing the text.
 */
export async function updatePress(id: string, patch: Partial<PressItem>): Promise<boolean> {
  const sb = getWriteClient();
  if (sb) {
    const { summary, ...rest } = patch;
    const { error } = await sb.from('press_releases')
      .update({ ...(rest as any), ...(summary !== undefined ? { excerpt: summary } : {}) })
      .eq('id', id);
    return !error;
  }
  const db = load();
  const i = db.press_releases.findIndex((p) => p.id === id);
  if (i < 0) return false;
  db.press_releases[i] = { ...db.press_releases[i], ...patch, id };
  save();
  return true;
}

export async function deletePress(id: string): Promise<boolean> {
  const sb = getWriteClient();
  if (sb) {
    const { error } = await sb.from('press_releases').delete().eq('id', id);
    return !error;
  }
  const db = load();
  const before = db.press_releases.length;
  db.press_releases = db.press_releases.filter((p) => p.id !== id);
  tombstone(db, id);
  save();
  return db.press_releases.length < before;
}

/* ── Leads: volunteers + inquiries ───────────────────────────── */

export async function addVolunteer(record: Omit<VolunteerLead, 'id' | 'created_at'>): Promise<VolunteerLead | 'duplicate'> {
  const sb = getWriteClient();
  if (sb) {
    const { error } = await sb.from('volunteers').insert([{ ...record }]);
    if (error) {
      if (error.code === '23505') return 'duplicate';
      throw error;
    }
    return { ...record, id: uid(), created_at: now() };
  }
  const db = load();
  const digits = (v: string) => v.replace(/[^0-9]/g, '');
  if (db.volunteers.some((v) => digits(v.phone_number) === digits(record.phone_number))) return 'duplicate';
  const rec: VolunteerLead = { ...record, id: uid(), created_at: now() };
  db.volunteers.unshift(rec);
  save();
  return rec;
}

export async function listVolunteers(): Promise<VolunteerLead[]> {
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb.from('volunteers').select('*').order('created_at', { ascending: false });
    if (data) return data as VolunteerLead[];
  }
  return load().volunteers;
}

export async function addInquiry(input: Omit<Inquiry, 'id' | 'created_at' | 'status'>): Promise<Inquiry> {
  const sb = getWriteClient();
  const rec: Inquiry = { ...input, id: uid(), created_at: now(), status: 'new' };
  if (sb) {
    const { error } = await sb.from('constituent_inquiries').insert([rec satisfies any]);
    if (error) throw error;
    return rec;
  }
  load().inquiries.unshift(rec);
  save();
  return rec;
}

export async function listInquiries(): Promise<Inquiry[]> {
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb.from('constituent_inquiries').select('*').order('created_at', { ascending: false });
    if (data) return data as Inquiry[];
  }
  return load().inquiries;
}

export async function updateInquiryStatus(id: string, status: Inquiry['status']): Promise<boolean> {
  const sb = getWriteClient();
  if (sb) {
    const { error } = await sb.from('constituent_inquiries').update({ status }).eq('id', id);
    return !error;
  }
  const db = load();
  const i = db.inquiries.findIndex((q) => q.id === id);
  if (i < 0) return false;
  db.inquiries[i].status = status;
  save();
  return true;
}

/** Remove a spam or duplicate Ask-Ola row. Genuine constituent records are the desk's to keep. */
export async function deleteInquiry(id: string): Promise<boolean> {
  const sb = getWriteClient();
  if (sb) {
    const { error } = await sb.from('constituent_inquiries').delete().eq('id', id);
    return !error;
  }
  const db = load();
  const before = db.inquiries.length;
  db.inquiries = db.inquiries.filter((q) => q.id !== id);
  save();
  return db.inquiries.length < before;
}

/** Remove a spam or duplicate volunteer sign-up. */
export async function deleteVolunteer(id: string): Promise<boolean> {
  const sb = getWriteClient();
  if (sb) {
    const { error } = await sb.from('volunteers').delete().eq('id', id);
    return !error;
  }
  const db = load();
  const before = db.volunteers.length;
  db.volunteers = db.volunteers.filter((v) => v.id !== id);
  save();
  return db.volunteers.length < before;
}

/* ── Constituent Help Desk (neighbourhood issue tracker) ─────── */

/** Reporter name/phone stay campaign-side; the public dashboard never sees them. */
function toPublic(issue: CommunityIssue): PublicIssue {
  const { reporter_name: _n, reporter_phone: _p, consent: _c, ...rest } = issue;
  return rest;
}

export async function listPublicIssues(): Promise<PublicIssue[]> {
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb
      .from('community_issues')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    if (data) return (data as CommunityIssue[]).map(toPublic);
  }
  return load()
    .issues.filter((i) => i.published)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map(toPublic);
}

export async function listIssues(): Promise<CommunityIssue[]> {
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb.from('community_issues').select('*').order('created_at', { ascending: false });
    if (data) return data as CommunityIssue[];
  }
  return [...load().issues].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function addIssue(input: {
  title: string;
  ward: string;
  category: CommunityIssue['category'];
  detail?: string | null;
  reporter_name?: string | null;
  reporter_phone?: string | null;
  consent: boolean;
  /** HQ-submitted entries publish immediately; resident submissions wait for the ward team. */
  published?: boolean;
  status?: CommunityIssue['status'];
  update_note?: string | null;
}): Promise<CommunityIssue> {
  const rec: CommunityIssue = {
    id: uid(),
    created_at: now(),
    title: input.title,
    ward: input.ward,
    category: input.category,
    detail: input.detail ?? null,
    reporter_name: input.reporter_name ?? null,
    reporter_phone: input.reporter_phone ?? null,
    consent: input.consent,
    published: input.published ?? false,
    status: input.status ?? 'submitted',
    update_note: input.update_note ?? null,
  };
  const sb = getWriteClient();
  if (sb) {
    const { error } = await sb.from('community_issues').insert([rec satisfies any]);
    if (error) throw error;
    return rec;
  }
  load().issues.unshift(rec);
  save();
  return rec;
}

export async function updateIssue(id: string, patch: Partial<Omit<CommunityIssue, 'id' | 'created_at'>>): Promise<boolean> {
  const sb = getWriteClient();
  if (sb) {
    const { error } = await sb.from('community_issues').update(patch).eq('id', id);
    return !error;
  }
  const db = load();
  const i = db.issues.findIndex((x) => x.id === id);
  if (i < 0) return false;
  db.issues[i] = { ...db.issues[i], ...patch, id };
  save();
  return true;
}

export async function deleteIssue(id: string): Promise<boolean> {
  const sb = getWriteClient();
  if (sb) {
    const { error } = await sb.from('community_issues').delete().eq('id', id);
    return !error;
  }
  const db = load();
  const before = db.issues.length;
  db.issues = db.issues.filter((x) => x.id !== id);
  tombstone(db, id);
  save();
  return db.issues.length < before;
}

/* ══════════════════════════════════════════════════════════════
   MEDIA LIBRARY (photos)
   ══════════════════════════════════════════════════════════════ */

export interface MediaFilter {
  publishedOnly?: boolean;
  featuredOnly?: boolean;
  slot?: string;
}

export async function listMedia(filter: MediaFilter = {}): Promise<MediaAsset[]> {
  const sb = getSupabase();
  if (sb) {
    let q = sb.from('media').select('*');
    if (filter.publishedOnly) q = q.eq('published', true);
    if (filter.featuredOnly) q = q.eq('featured', true);
    if (filter.slot) q = q.eq('slot', filter.slot);
    const { data } = await q.order('featured', { ascending: false }).order('created_at', { ascending: false });
    if (data && data.length) return data as MediaAsset[];
  }
  const rows = load().media.filter((m) => (!filter.publishedOnly || m.published) && (!filter.featuredOnly || m.featured) && (!filter.slot || m.slot === filter.slot));
  return [...rows].sort((a, b) => Number(b.featured) - Number(a.featured) || b.created_at.localeCompare(a.created_at));
}

/** The published photo assigned to a named position, if the media desk has filled it. */
export async function getMediaBySlot(slot: string): Promise<MediaAsset | null> {
  const rows = await listMedia({ publishedOnly: true, slot });
  return rows[0] ?? null;
}

export async function addMedia(input: Omit<MediaAsset, 'id' | 'created_at'> & { id?: string }): Promise<MediaAsset> {
  const sb = getWriteClient();
  const rec: MediaAsset = { ...input, id: input.id ?? uid(), created_at: now() };
  if (sb) {
    const { error } = await sb.from('media').insert([rec]);
    if (error) throw error;
    return rec;
  }
  load().media.unshift(rec);
  save();
  return rec;
}

export async function updateMedia(id: string, patch: Partial<MediaAsset>): Promise<boolean> {
  const sb = getWriteClient();
  if (sb) {
    const { error } = await sb.from('media').update(patch).eq('id', id);
    return !error;
  }
  const db = load();
  const i = db.media.findIndex((m) => m.id === id);
  if (i < 0) return false;
  db.media[i] = { ...db.media[i], ...patch, id };
  save();
  return true;
}

export async function deleteMedia(id: string): Promise<boolean> {
  const sb = getWriteClient();
  if (sb) {
    const { error } = await sb.from('media').delete().eq('id', id);
    return !error;
  }
  const db = load();
  const before = db.media.length;
  db.media = db.media.filter((m) => m.id !== id);
  tombstone(db, id);
  save();
  return db.media.length < before;
}

/* ══════════════════════════════════════════════════════════════
   VIDEO LIBRARY (YouTube)
   ══════════════════════════════════════════════════════════════ */

export async function listVideos(opts: { publishedOnly?: boolean } = {}): Promise<VideoItem[]> {
  const sb = getSupabase();
  if (sb) {
    let q = sb.from('videos').select('*');
    if (opts.publishedOnly) q = q.eq('published', true);
    const { data } = await q.order('featured', { ascending: false }).order('created_at', { ascending: false });
    if (data && data.length) return data as VideoItem[];
  }
  const rows = load().videos.filter((v) => !opts.publishedOnly || v.published);
  return [...rows].sort((a, b) => Number(b.featured) - Number(a.featured) || b.created_at.localeCompare(a.created_at));
}

export async function addVideo(input: Omit<VideoItem, 'id' | 'created_at'> & { id?: string }): Promise<VideoItem> {
  const sb = getWriteClient();
  const rec: VideoItem = { ...input, id: input.id ?? uid(), created_at: now() };
  if (sb) {
    const { error } = await sb.from('videos').insert([rec]);
    if (error) throw error;
    return rec;
  }
  load().videos.unshift(rec);
  save();
  return rec;
}

export async function updateVideo(id: string, patch: Partial<VideoItem>): Promise<boolean> {
  const sb = getWriteClient();
  if (sb) {
    const { error } = await sb.from('videos').update(patch).eq('id', id);
    return !error;
  }
  const db = load();
  const i = db.videos.findIndex((v) => v.id === id);
  if (i < 0) return false;
  db.videos[i] = { ...db.videos[i], ...patch, id };
  save();
  return true;
}

export async function deleteVideo(id: string): Promise<boolean> {
  const sb = getWriteClient();
  if (sb) {
    const { error } = await sb.from('videos').delete().eq('id', id);
    return !error;
  }
  const db = load();
  const before = db.videos.length;
  db.videos = db.videos.filter((v) => v.id !== id);
  tombstone(db, id);
  save();
  return db.videos.length < before;
}

/* ══════════════════════════════════════════════════════════════
   PROFILE FACTS · SOCIAL CHANNELS · PRESS REFERENCES · SITE COPY
   ══════════════════════════════════════════════════════════════ */

export async function listProfileFacts(): Promise<ProfileFactRow[]> {
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb.from('profile_facts').select('*').order('sort', { ascending: true });
    if (data && data.length) return data as ProfileFactRow[];
  }
  return [...load().profile_facts].sort((a, b) => a.sort - b.sort);
}

export async function upsertProfileFact(input: ProfileFactRow): Promise<ProfileFactRow> {
  const sb = getWriteClient();
  if (sb) {
    const { error } = await sb.from('profile_facts').upsert(input);
    if (error) throw error;
    return input;
  }
  const db = load();
  const i = db.profile_facts.findIndex((p) => p.id === input.id);
  if (i >= 0) db.profile_facts[i] = input;
  else db.profile_facts.push(input);
  save();
  return input;
}

export async function deleteProfileFact(id: string): Promise<boolean> {
  const sb = getWriteClient();
  if (sb) {
    const { error } = await sb.from('profile_facts').delete().eq('id', id);
    return !error;
  }
  const db = load();
  const before = db.profile_facts.length;
  db.profile_facts = db.profile_facts.filter((p) => p.id !== id);
  tombstone(db, id);
  save();
  return db.profile_facts.length < before;
}

export async function listSocials(): Promise<SocialRow[]> {
  const sb = getSupabase();
  let rows: SocialRow[];
  if (sb) {
    const { data } = await sb.from('socials').select('*').order('sort', { ascending: true });
    rows = data && data.length ? (data as SocialRow[]) : [...load().socials];
  } else {
    rows = [...load().socials];
  }
  // Display-time normalization: only the official campaign line may ever be
  // published, even if a stale row lingers in Supabase.
  return rows
    .map((row) =>
      row.platform === 'whatsapp'
        ? {
            ...row,
            handle: '+234 803 400 5708',
            url: 'https://wa.me/2348034005708?text=SupportOlaWestern',
          }
        : row,
    )
    .sort((a, b) => a.sort - b.sort);
}

export async function upsertSocial(input: SocialRow): Promise<SocialRow> {
  const sb = getWriteClient();
  if (sb) {
    const { error } = await sb.from('socials').upsert(input);
    if (error) throw error;
    return input;
  }
  const db = load();
  const i = db.socials.findIndex((s) => s.id === input.id);
  if (i >= 0) db.socials[i] = input;
  else db.socials.push(input);
  save();
  return input;
}

export async function deleteSocial(id: string): Promise<boolean> {
  const sb = getWriteClient();
  if (sb) {
    const { error } = await sb.from('socials').delete().eq('id', id);
    return !error;
  }
  const db = load();
  const before = db.socials.length;
  db.socials = db.socials.filter((s) => s.id !== id);
  tombstone(db, id);
  save();
  return db.socials.length < before;
}

/**
 * Press citations. The Postgres table is `press_references` because REFERENCES
 * is a reserved word in SQL; the file store keeps the shorter `references` key.
 */
export async function listReferences(): Promise<ReferenceRow[]> {
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb.from('press_references').select('*').order('year', { ascending: false });
    if (data && data.length) return data as ReferenceRow[];
  }
  return [...load().references].sort((a, b) => b.year - a.year);
}

export async function addReference(input: Omit<ReferenceRow, 'id'> & { id?: string }): Promise<ReferenceRow> {
  const sb = getWriteClient();
  const rec: ReferenceRow = { ...input, id: input.id ?? uid() };
  if (sb) {
    const { error } = await sb.from('press_references').insert([rec]);
    if (error) throw error;
    return rec;
  }
  load().references.unshift(rec);
  save();
  return rec;
}

export async function updateReference(id: string, patch: Partial<ReferenceRow>): Promise<boolean> {
  const sb = getWriteClient();
  if (sb) {
    const { error } = await sb.from('press_references').update(patch).eq('id', id);
    return !error;
  }
  const db = load();
  const i = db.references.findIndex((r) => r.id === id);
  if (i < 0) return false;
  db.references[i] = { ...db.references[i], ...patch, id };
  save();
  return true;
}

export async function deleteReference(id: string): Promise<boolean> {
  const sb = getWriteClient();
  if (sb) {
    const { error } = await sb.from('press_references').delete().eq('id', id);
    return !error;
  }
  const db = load();
  const before = db.references.length;
  db.references = db.references.filter((r) => r.id !== id);
  tombstone(db, id);
  save();
  return db.references.length < before;
}

/**
 * The desk retired its "assistant" framing when the public WhatsApp line moved
 * to the campaign desk. Existing CMS rows may still carry the old sentence, so
 * it is corrected at read time rather than left live until someone edits it.
 */
function retireAssistantCopy(settings: SiteSettings): SiteSettings {
  const clean = (value: string) => value.replace(/campaign assistant/gi, 'campaign desk');
  return {
    ...settings,
    hero_kicker: clean(settings.hero_kicker),
    hero_title: clean(settings.hero_title),
    hero_slogan: clean(settings.hero_slogan),
    hero_body: clean(settings.hero_body),
    cta_title: clean(settings.cta_title),
    cta_body: clean(settings.cta_body),
  };
}

export async function getSettings(): Promise<SiteSettings> {
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb.from('site_settings').select('*').eq('id', 'site').single();
    if (data && data.hero_title) {
      const stats = Array.isArray(data.stats) ? data.stats : SEED_SETTINGS.stats;
      return retireAssistantCopy({ ...(data as unknown as SiteSettings), stats });
    }
  }
  return retireAssistantCopy(load().settings);
}

export async function updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const sb = getWriteClient();
  if (sb) {
    const current = await getSettings();
    const next = { ...current, ...patch };
    const { error } = await sb.from('site_settings').upsert({ ...next, id: 'site' });
    if (error) throw error;
    return next;
  }
  const db = load();
  db.settings = { ...db.settings, ...patch };
  save();
  return db.settings;
}