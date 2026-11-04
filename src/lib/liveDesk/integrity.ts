/**
 * liveDesk/integrity.ts — the campaign site grades its own publishability.
 *
 * A public-relations CMS that only stores what it is told is a database with a
 * login screen. The thing a campaign actually needs to know is whether what is
 * live right now can survive scrutiny: is every service claim linked to the
 * report that proves it, is every photo big enough for the frame it sits in, is
 * anything sitting in the open that a resident told us in confidence?
 *
 * This module answers that from the store, purely — no fetches, no side effects,
 * so /api/admin/health can call it and a test can assert on it. Each finding
 * carries the page the problem is visible on and the exact selector the Live Desk
 * overlay highlights, which is what turns a score into a to-do list: click the
 * finding, the offending sentence on the voter-facing page gets outlined, and the
 * editor opens on it.
 *
 * Server-only (it imports MEDIA_POSITIONS metadata and slot labels).
 */
import { MEDIA_POSITIONS } from '../content';
import { SLOT_LABELS } from '../slots';
import type { Inquiry, VolunteerLead } from '../store';
import { fitFor, MAX_CROP } from './contract';
import type {
  Accomplishment, CommunityIssue, FactCheck, MediaAsset,
  PressItem, ProfileFactRow, ReferenceRow, SiteSettings, SocialRow, VideoItem,
} from '@/types';

export type Severity = 'block' | 'warn' | 'info';

export interface FindingItem {
  label: string;
  /** Where the fix happens: a public route, or the tab CMS (`/admin?tab=…`). */
  page: string;
  /**
   * `data-ow` target to outline on that route. Empty means the problem has no
   * sentence on a public page — a queue of resident reports, an unconfirmed
   * handle — so the desk navigates instead of hunting for an element.
   */
  selector: string;
  /** What to do about it, in one line. */
  fix: string;
}

export interface Finding {
  id: string;
  label: string;
  /** Why this matters, in the campaign's own terms — shown in the panel. */
  why: string;
  severity: Severity;
  count: number;
  items: FindingItem[];
}

export interface HealthReport {
  score: number;
  /** Nothing at block level: safe to share the site with a journalist. */
  ready: boolean;
  /** Deducted per severity — exported so the gauge and the list cannot disagree. */
  weights: Record<Severity, number>;
  findings: Finding[];
  counts: {
    photos: number;
    frames_bound: number;
    frames_total: number;
    clips: number;
    claims: number;
    record: number;
    sources: number;
    releases: number;
    drafts: number;
    leads_new: number;
    reports_unpublished: number;
  };
  generated_at: string;
}

export interface Rows {
  media: MediaAsset[];
  videos: VideoItem[];
  facts: FactCheck[];
  record: Accomplishment[];
  press: PressItem[];
  references: ReferenceRow[];
  issues: CommunityIssue[];
  inquiries: Inquiry[];
  volunteers: VolunteerLead[];
  profile: ProfileFactRow[];
  socials: SocialRow[];
  settings: SiteSettings;
}

/** Weight per unresolved finding, clamped per check — a score the desk can trust. */
const WEIGHTS: Record<Severity, number> = { block: 18, warn: 7, info: 2 };

/* Frames are rendered by name; this is where the desk should look for one. */
const FRAME_PAGE: Record<string, string> = {
  'candidate-portrait': '/',
  'hq-office': '/contact',
  'primary-victory': '/join',
  consensus: '/truth-room',
  'primary-night': '/truth-room',
  graphic: '/blueprint',
  'rally-address': '/blueprint',
};

const framePage = (slot: string) => FRAME_PAGE[slot] ?? '/gallery';

const clip = (s: string | null | undefined, n = 58) => {
  const text = s ?? '';
  return text.length > n ? `${text.slice(0, n - 1)}…` : text;
};

export function assess(rows: Rows): HealthReport {
  const findings: Finding[] = [];

  /* ── Attestation: a claim a voter can check must be a claim they can check ── */
  const unverifiedRecord = rows.record.filter((r) => !r.verification_source_url);
  findings.push({
    id: 'record-source',
    label: 'Service claims with no published report linked',
    why: 'The record page is the campaign’s whole argument. An entry with nothing behind it is the one a opponent can point at.',
    severity: 'block',
    count: unverifiedRecord.length,
    items: unverifiedRecord.map((r) => ({
      label: clip(r.title),
      page: '/impact',
      selector: `[data-ow="record.${r.id}.verification_source_url"]`,
      fix: 'Paste the press link that documents it.',
    })),
  });

  const unverifiedFacts = rows.facts.filter((f) => !f.official_document_url);
  findings.push({
    id: 'fact-source',
    label: 'Truth Room rulings with no document attached',
    why: 'A debunking is only as good as the paper behind it. The ledger is the site’s credibility engine, so a bare verdict reads as another rumour.',
    severity: 'block',
    count: unverifiedFacts.length,
    items: unverifiedFacts.map((f) => ({
      label: clip(f.claim_summary),
      page: '/truth-room',
      selector: `[data-ow="fact.${f.id}.official_document_url"]`,
      fix: 'Attach the official document or press report.',
    })),
  });

  const unlinkedReleases = rows.press.filter((p) => p.published_at && p.source !== 'campaign_hq' && !p.pdf_url);
  findings.push({
    id: 'release-source',
    label: 'Republished third-party items with no document',
    why: 'Anything that is not the campaign’s own statement should carry the file or link it ran in.',
    severity: 'warn',
    count: unlinkedReleases.length,
    items: unlinkedReleases.map((p) => ({
      label: clip(p.title),
      page: '/news',
      selector: `[data-ow="press.${p.id}.body"]`,
      fix: 'Attach the PDF or link it published under.',
    })),
  });

  /* ── Photography: present, but honest about what is missing ────────────── */
  const bound = new Set(rows.media.filter((m) => m.published && m.slot).map((m) => m.slot));
  const open = MEDIA_POSITIONS.filter((p) => !bound.has(p.slot));
  findings.push({
    id: 'frames-open',
    label: 'Frames still showing the branded panel',
    why: 'A frame that names a place or a person is never filled with a picture of something else — it waits for the real photograph.',
    severity: open.length > 6 ? 'warn' : 'info',
    count: open.length,
    items: open.map((p) => ({
      label: p.label,
      page: framePage(p.slot),
      selector: `[data-ow="slot.${p.slot}"]`,
      fix: 'Tap the frame and upload the shot.',
    })),
  });

  const published = rows.media.filter((m) => m.published);
  const soft = published.filter((m) => m.width && m.height && Math.max(m.width, m.height) < 700);
  findings.push({
    id: 'photos-soft',
    label: 'Photos too small for the size they render at',
    why: 'On a phone these stretch; the hero and the carousel lead are the two places a voter looks first.',
    severity: 'warn',
    count: soft.length,
    items: soft.map((m) => ({
      label: `${m.slot ? SLOT_LABELS[m.slot] ?? m.slot : 'gallery tile'} — ${m.width}×${m.height}`,
      page: framePage(m.slot ?? 'graphic'),
      selector: `[data-ow="slot.${m.slot ?? 'graphic'}"]`,
      fix: 'Replace with the original-resolution file from the outlet.',
    })),
  });

  const misfit = published.filter((m) => m.slot && m.width && m.height).map((m) => {
    const ratio = MEDIA_POSITIONS.find((p) => p.slot === m.slot)?.ratio ?? '16:9';
    return { m, fit: fitFor(m, ratio), ratio };
  }).filter((x) => !x.fit.fits);
  findings.push({
    id: 'photos-crop',
    label: 'Photos cropped past a third of their short edge',
    why: `${Math.round(MAX_CROP * 100)}% is where an ${'object-cover'} frame starts cutting people out of their own picture.`,
    severity: 'warn',
    count: misfit.length,
    items: misfit.map((x) => ({
      label: `${SLOT_LABELS[x.m.slot!] ?? x.m.slot} — ${Math.round(x.fit.crop * 100)}% crop on a ${x.ratio} frame`,
      page: framePage(x.m.slot!),
      selector: `[data-ow="slot.${x.m.slot}"]`,
      fix: 'Choose a photo closer to the frame’s shape.',
    })),
  });

  const uncaptioned = published.filter((m) => !m.caption);
  findings.push({
    id: 'photos-uncaptioned',
    label: 'Published photos with no caption',
    why: 'An uncaptioned press photo is an uncredited one — the outlet and the event should travel with the picture.',
    severity: 'info',
    count: uncaptioned.length,
    items: uncaptioned.map((m) => ({
      label: m.src.split('/').pop() ?? m.id,
      page: framePage(m.slot ?? 'graphic'),
      selector: `[data-ow="media.${m.id}.caption"]`,
      fix: 'Write what the report says it shows.',
    })),
  });

  /* ── Motion ─────────────────────────────────────────────────────────────── */
  const clips = rows.videos.filter((v) => v.published);
  findings.push({
    id: 'video-empty',
    label: 'No broadcast clips live',
    why: 'The shelf is the proof-of-attention section: a voter watches a news report about the candidate before they read a paragraph about him.',
    severity: clips.length ? 'info' : 'block',
    count: clips.length ? 0 : 1,
    items: clips.length ? [] : [{ label: 'Add the report that filmed it', page: '/admin?tab=video', selector: '', fix: '⌘K and paste the YouTube link, or use the Video tab.' }],
  });

  /* ── What the desk owes a resident, and what it must not leak ──────────── */
  const awaitingReports = rows.issues.filter((i) => !i.published);
  findings.push({
    id: 'reports-waiting',
    label: 'Resident reports waiting on the desk',
    why: 'Each one is a person who gave a phone number in confidence. Publishing one needs a human decision; leaving it forever needs one too.',
    severity: 'info',
    count: awaitingReports.length,
    items: awaitingReports.slice(0, 8).map((i) => {
      const line = clip(i.detail, 40);
      return {
        label: line ? `${i.ward} · ${i.category} — ${line}` : `${i.ward} · ${i.category}`,
        page: '/admin?tab=helpdesk',
        selector: '',
        fix: 'Answer or publish it in the Help Desk queue.',
      };
    }),
  });

  const newInquiries = rows.inquiries.filter((q) => q.status === 'new');
  const leadLabels = [
    ...newInquiries.map((q) => `${q.message_type} — ${clip(q.full_name, 30)}`),
    ...rows.volunteers.map((v) => `Volunteer — ${clip(v.full_name, 30)} (${v.ward_location})`),
  ];
  findings.push({
    id: 'leads-new',
    label: 'Volunteers and enquiries not yet triaged',
    why: 'A movement that does not call back loses the people it recruited.',
    severity: 'info',
    count: leadLabels.length,
    items: leadLabels.slice(0, 8).map((label) => ({
      label,
      page: '/admin?tab=leads',
      selector: '',
      fix: 'Move it to reviewed or answered in the Leads Inbox.',
    })),
  });

  /* ── Unconfirmed campaign facts stay unconfirmed ───────────────────────── */
  const blankProfile = rows.profile.filter((p) => !p.value);
  findings.push({
    id: 'profile-blank',
    label: 'Candidate-file rows awaiting written confirmation',
    why: 'They are hidden publicly on purpose. This count is what HQ still owes, not what the site is missing.',
    severity: 'info',
    count: blankProfile.length,
    items: blankProfile.map((p) => ({
      label: p.key,
      page: '/about',
      selector: `[data-ow="profile.${p.id}.value"]`,
      fix: 'Fill it once HQ confirms it in writing.',
    })),
  });

  const pendingSocials = rows.socials.filter((s) => !s.url);
  findings.push({
    id: 'socials-pending',
    label: 'Channels without a confirmed link',
    why: 'Rendered as pending, never as a dead link — an unconfirmed handle is a fake profile waiting to be mistaken for the campaign.',
    severity: 'info',
    count: pendingSocials.length,
    items: pendingSocials.map((s) => ({
      label: `${s.platform} — ${s.handle}`,
      page: '/admin?tab=site',
      selector: '',
      fix: 'Confirm the handle in Site Copy → Official channels.',
    })),
  });

  const drafts = rows.press.filter((p) => !p.published_at);
  findings.push({
    id: 'press-drafts',
    label: 'Releases written but not published',
    why: 'Drafts are invisible to voters; the count is here so nothing is forgotten in the queue.',
    severity: 'info',
    count: drafts.length,
    items: drafts.map((p) => ({ label: clip(p.title), page: '/news', selector: `[data-ow="press.${p.id}.title"]`, fix: 'Publish it from the Newsroom tab.' })),
  });

  const sources = rows.references.length;
  findings.push({
    id: 'sources-thin',
    label: 'Public reference library is thin',
    why: 'The whole reputation argument rests on 20+ dated press links a reader can open. Below that the page is a claim, not a record.',
    severity: sources < 12 ? 'warn' : 'info',
    count: sources < 12 ? 1 : 0,
    items: sources < 12 ? [{ label: `${sources} sources cited`, page: '/admin?tab=sources', selector: '', fix: 'Cite the reports the dossier lists.' }] : [],
  });

  const kept = findings.filter((f) => f.count > 0);
  const penalty = kept.reduce((sum, f) => sum + Math.min(WEIGHTS[f.severity] * Math.max(1, Math.ceil(f.count / 3)), WEIGHTS[f.severity] * 3), 0);
  const score = Math.max(0, Math.min(100, 100 - penalty));

  return {
    score,
    ready: !kept.some((f) => f.severity === 'block'),
    weights: WEIGHTS,
    findings: kept,
    counts: {
      photos: published.length,
      frames_bound: bound.size,
      frames_total: MEDIA_POSITIONS.length,
      clips: clips.length,
      claims: rows.facts.length,
      record: rows.record.length,
      sources,
      releases: rows.press.filter((p) => p.published_at).length,
      drafts: drafts.length,
      leads_new: leadLabels.length,
      reports_unpublished: awaitingReports.length,
    },
    generated_at: new Date().toISOString(),
  };
}
