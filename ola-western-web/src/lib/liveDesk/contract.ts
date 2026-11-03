/**
 * liveDesk/contract.ts — the grammar that turns a rendered page into the CMS.
 *
 * Every editable thing on a public page carries one attribute:
 *
 *   data-ow="settings.hero_title"      homepage headline (PATCH /api/admin/settings)
 *   data-ow="settings.stats.2.label"   one tile of the animated stat strip
 *   data-ow="record.a10.title"         a track-record entry, in place on /impact
 *   data-ow="press.pr-7.summary"       a release, in place on /news
 *   data-ow="fact.fc-3.verdict"        a Truth Room ruling, in place on /truth-room
 *   data-ow="media.gfx-mandate.caption" the caption under a photograph
 *   data-ow="slot.town-hall-festac"    an image frame → opens the library picker
 *
 * The page itself stays a server component: no handlers, no client JS, no state.
 * The overlay in components/livedesk attaches one delegated click listener to the
 * document, reads this attribute off whatever the desk tapped, looks the field up
 * here, and sends the body the existing admin route already validates. That is why
 * this file is the whole integration — a field is editable the moment its element
 * carries the attribute, and nothing about a mutation path is duplicated: the same
 * 400 a tab would show is the 400 this sheet shows, because it is the same route.
 *
 * `type: 'area'` renders a textarea, `url` gets the link validator's own wording,
 * `choice` renders chips instead of a keyboard, and `secret` is the honesty flag:
 * a field whose value is a public statement about a real person.
 */

export type FieldKind = 'text' | 'area' | 'url' | 'choice' | 'boolean';

export interface FieldSpec {
  /** Shown as the editor's heading, so the desk never wonders what they are typing. */
  label: string;
  kind: FieldKind;
  /** Same ceiling the route enforces — the counter in the sheet is honest. */
  max: number;
  options?: readonly string[];
  hint?: string;
  /** Public-facing consequence of getting it wrong: shown above the input. */
  attested?: boolean;
  /**
   * The field lives inside a stored array (the stat strip is one JSON column).
   * The sheet reads the array first, edits the tapped index, and PATCHes the
   * whole thing — which is why a tile is editable without inventing a per-tile route.
   */
  inArray?: string;
  /** Where it goes. `id` is the row from the data-ow string, `index` the stat tile. */
  send: (ctx: { id?: string; index?: number; value: string }) => { path: string; method: string; body: Record<string, unknown> };
}

const VERDICTS = ['VERIFIED FACT', 'FALSE CLAIM', 'MISLEADING'] as const;

/** `entity.field` — the last two segments of a data-ow string. */
export const FIELDS: Record<string, FieldSpec> = {
  /* Homepage / CTA copy — one settings row, revalidates every copy page. */
  'settings.hero_kicker': { label: 'Hero kicker', kind: 'text', max: 90, send: (c) => setting('hero_kicker', c) },
  'settings.hero_title': { label: 'Headline', kind: 'text', max: 80, attested: true, hint: 'The first sentence a voter reads. It cannot be empty.', send: (c) => setting('hero_title', c) },
  'settings.hero_slogan': { label: 'Slogan', kind: 'text', max: 90, send: (c) => setting('hero_slogan', c) },
  'settings.hero_body': { label: 'Hero paragraph', kind: 'area', max: 600, attested: true, send: (c) => setting('hero_body', c) },
  'settings.cta_title': { label: 'Closing band title', kind: 'text', max: 90, send: (c) => setting('cta_title', c) },
  'settings.cta_body': { label: 'Closing band paragraph', kind: 'area', max: 600, send: (c) => setting('cta_body', c) },
  'settings.stats.value': { label: 'Stat figure', kind: 'text', max: 24, inArray: 'stats', attested: true, hint: 'A number from the campaign dossier only — the site is audited against it.', send: (c) => settingStats(c) },
  'settings.stats.label': { label: 'Stat label', kind: 'text', max: 90, inArray: 'stats', send: (c) => settingStats(c) },

  /* Candidate file (About). An empty value hides the row publicly, by design. */
  'profile.value': { label: 'Confirmed value', kind: 'text', max: 200, attested: true, hint: 'Leave blank to keep this row off the public site until HQ confirms it in writing.', send: (c) => ({ path: '/api/admin/profile', method: 'PUT', body: { id: c.id, value: c.value } }) },

  /* Track record (/impact). */
  'record.title': { label: 'Record entry', kind: 'text', max: 200, attested: true, send: (c) => row('/api/admin/record', c, 'title') },
  'record.description': { label: 'What happened', kind: 'area', max: 4000, attested: true, send: (c) => row('/api/admin/record', c, 'description') },
  'record.ward_impact': { label: 'Ward / constituency', kind: 'text', max: 120, send: (c) => row('/api/admin/record', c, 'ward_impact') },
  'record.category': { label: 'Category', kind: 'choice', max: 40, options: ['Infrastructure', 'Youth & Sports', 'Security', 'Philanthropy', 'Legislative'], send: (c) => row('/api/admin/record', c, 'category') },
  'record.verification_source_url': { label: 'Link to the published report', kind: 'url', max: 400, attested: true, hint: 'The route refuses a published entry without this link.', send: (c) => row('/api/admin/record', c, 'verification_source_url') },

  /* Newsroom (/news, home preview). */
  'press.title': { label: 'Headline', kind: 'text', max: 200, send: (c) => row('/api/admin/press', c, 'title') },
  'press.summary': { label: 'Standfirst', kind: 'area', max: 400, hint: 'This is the only text a newsfeed card shows.', send: (c) => row('/api/admin/press', c, 'summary') },
  'press.body': { label: 'Release body', kind: 'area', max: 20000, send: (c) => row('/api/admin/press', c, 'body') },
  'press.pdf_url': { label: 'Link to the signed-off PDF', kind: 'url', max: 400, send: (c) => row('/api/admin/press', c, 'pdf_url') },

  /* Truth Room (/truth-room, home preview). */
  'fact.claim_summary': { label: 'The claim', kind: 'text', max: 300, attested: true, send: (c) => row('/api/admin/fact-checks', c, 'claim_summary') },
  'fact.detailed_explanation': { label: 'The evidence', kind: 'area', max: 8000, attested: true, hint: 'A ruling with no reasoning is not a ruling.', send: (c) => row('/api/admin/fact-checks', c, 'detailed_explanation') },
  'fact.verdict': { label: 'Verdict', kind: 'choice', max: 20, options: VERDICTS, attested: true, send: (c) => row('/api/admin/fact-checks', c, 'verdict') },
  'fact.official_document_url': { label: 'Document that proves it', kind: 'url', max: 400, attested: true, send: (c) => row('/api/admin/fact-checks', c, 'official_document_url') },

  /* Photo captions, under the picture itself. */
  'media.caption': { label: 'Caption', kind: 'text', max: 400, hint: 'Say only what the report says the photograph shows.', send: (c) => row('/api/admin/media', c, 'caption') },
  'media.alt': { label: 'Alt text', kind: 'text', max: 240, send: (c) => row('/api/admin/media', c, 'alt') },
  'media.credit': { label: 'Credit', kind: 'text', max: 160, hint: 'Name the outlet that took it.', send: (c) => row('/api/admin/media', c, 'credit') },
};

function setting(key: string, c: { value: string }) {
  return { path: '/api/admin/settings', method: 'PATCH', body: { [key]: c.value } };
}

/**
 * Only the destination matters here for an array field: the sheet fetches the
 * current strip, replaces the tapped index, and PATCHes `{ stats: [...] }`, so a
 * single tile never needs an endpoint of its own.
 */
function settingStats(_c: { value: string; index?: number }) {
  return { path: '/api/admin/settings', method: 'PATCH', body: {} };
}

function row(base: string, c: { id?: string; value: string }, field: string) {
  return { path: `${base}/${c.id}`, method: 'PATCH', body: { [field]: c.value } };
}

export type Target =
  | { kind: 'field'; entity: string; id?: string; field: string; index?: number; spec: FieldSpec; ow: string }
  | { kind: 'slot'; slot: string; ow: string };

/**
 * Parse a data-ow value. Unknown fields return null rather than guessing: a tap on
 * something the desk cannot legitimately edit should do nothing, not write junk.
 */
export function parseTarget(ow: string): Target | null {
  const parts = ow.split('.');
  if (!parts.length) return null;
  if (parts[0] === 'slot') return parts[1] ? { kind: 'slot', slot: parts.slice(1).join('.'), ow } : null;

  const entity = parts[0];
  // settings.stats.2.label — the only indexed field.
  if (entity === 'settings' && parts[1] === 'stats') {
    const index = Number(parts[2]);
    const field = parts[3];
    const spec = FIELDS[`settings.stats.${field}`];
    return spec ? { kind: 'field', entity, field: `stats.${field}`, index: Number.isInteger(index) ? index : 0, spec, ow } : null;
  }
  const field = parts[parts.length - 1];
  const spec = FIELDS[`${entity}.${field}`];
  if (!spec) return null;
  const id = parts.length > 2 ? parts.slice(1, -1).join('.') : undefined;
  return { kind: 'field', entity, id, field, spec, ow };
}

/* ── Crop maths shared by the picker and the frame highlighter ───────────── */

export function ratioValue(ratio: string): number {
  const [w, h] = String(ratio).split(':').map(Number);
  return w && h ? w / h : 16 / 9;
}

/** How much of the shorter edge `object-cover` throws away. 0 = exact fit. */
export function cropLoss(photo: number, frame: number): number {
  const r = photo / frame;
  return r > 1 ? 1 - 1 / r : 1 - r;
}

/** Anything past a third of the frame is a crop that fights the subject. */
export const MAX_CROP = 0.34;

export interface FrameFit {
  fits: boolean;
  crop: number;
  /** Too small to hold the frame at its rendered size. */
  soft: boolean;
}

export function fitFor(asset: { width: number | null; height: number | null }, frameRatio: string): FrameFit {
  if (!asset.width || !asset.height) return { fits: false, crop: 1, soft: true };
  const crop = cropLoss(asset.width / asset.height, ratioValue(frameRatio));
  const long = Math.max(asset.width, asset.height);
  return { fits: crop <= MAX_CROP, crop, soft: long < 700 };
}

export const VERDICT_OPTIONS = VERDICTS;
