export type Ward = 'Festac I' | 'Festac II' | 'Festac III' | 'Mile 2 / Housing Estate';

export const WARDS: Ward[] = ['Festac I', 'Festac II', 'Festac III', 'Mile 2 / Housing Estate'];

export type AccomplishmentCategory =
  | 'Infrastructure'
  | 'Youth & Sports'
  | 'Security'
  | 'Philanthropy'
  | 'Legislative';

export interface Accomplishment {
  id: string;
  created_at: string;
  title: string;
  category: AccomplishmentCategory;
  ward_impact: string;
  description: string;
  image_url?: string | null;
  verification_source_url?: string | null;
}

export type FactVerdict = 'VERIFIED FACT' | 'FALSE CLAIM' | 'MISLEADING';

export interface FactCheck {
  id: string;
  created_at: string;
  claim_summary: string;
  verdict: FactVerdict;
  detailed_explanation: string;
  official_document_url?: string | null;
  is_featured: boolean;
}

export interface VolunteerPayload {
  fullName: string;
  phoneNumber: string;
  email?: string;
  wardLocation: Ward;
  addressStreet?: string;
  pollingUnitCode?: string;
  primaryConcern: string;
  consent: boolean;
}

export interface InquiryPayload {
  fullName: string;
  phoneNumber: string;
  ward: string;
  messageType: 'Policy Inquiry' | 'Rumor Verification' | 'General Support' | 'Office Hours Booking';
  messageBody: string;
}

export type PressSource = 'campaign_hq' | 'festaconline' | 'partner_press';

export interface PressItem {
  id: string;
  created_at: string;
  published_at: string | null;
  slug: string;
  title: string;
  summary: string;
  body: string;
  source: PressSource;
  pdf_url?: string | null;
}

/** A social profile row. url === null means "handle not yet confirmed" — the UI renders it as pending, never as a dead link. */
export interface SocialProfile {
  platform: 'x' | 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'whatsapp';
  label: string;
  handle: string;
  url: string | null;
}

/** A gallery image slot. src === null renders the editable placeholder frame. */
export interface GallerySlide {
  id: string;
  /** File name expected under public/images/ once the campaign drops the photo in. */
  slot: string;
  src: string | null;
  alt: string;
  caption: string;
  credit?: string;
  /** Published report the press photo ran in — makes the credit verifiable. */
  href?: string | null;
  /**
   * The photograph's own shape. The carousel is one fixed landscape frame per
   * slide, so it needs to know whether this picture is a portrait — a 4:5
   * campaign portrait forced into 16:9 with `object-cover` loses the head.
   */
  orientation?: MediaOrientation | null;
}

/** Constituent Help Desk — a neighbourhood issue reported by a resident. */
export type IssueCategory =
  | 'Drainage & Flooding'
  | 'Roads & Streetlighting'
  | 'Water & Boreholes'
  | 'Community Security'
  | 'Waste & Sanitation'
  | 'Market & SME';

export type IssueStatus = 'submitted' | 'under_review' | 'action_scheduled' | 'resolved';

export const ISSUE_CATEGORIES: IssueCategory[] = [
  'Drainage & Flooding',
  'Roads & Streetlighting',
  'Water & Boreholes',
  'Community Security',
  'Waste & Sanitation',
  'Market & SME',
];

export const ISSUE_STATUSES: IssueStatus[] = ['submitted', 'under_review', 'action_scheduled', 'resolved'];

export interface CommunityIssue {
  id: string;
  created_at: string;
  title: string;
  ward: string;
  category: IssueCategory;
  detail: string | null;
  /** Reporter contact is held for the ward team only — never published. */
  reporter_name: string | null;
  reporter_phone: string | null;
  consent: boolean;
  /** HQ approval gate: false keeps the issue off the public dashboard. */
  published: boolean;
  status: IssueStatus;
  /** Plain-language progress note the media desk writes for the public ledger. */
  update_note: string | null;
}

/** Public payload — reporter identity is stripped before it reaches the browser. */
export type PublicIssue = Omit<CommunityIssue, 'reporter_name' | 'reporter_phone' | 'consent'>;

/* ── Media library (photos) ─────────────────────────────────── */

export type MediaOrientation = 'portrait' | 'landscape' | 'square';

/**
 * A photograph the campaign publishes. `slot` binds it to a named position in
 * the site (candidate-portrait, town-hall-festac, …); `source_url` + `credit`
 * stay attached to press imagery so the outlet that took it is always named.
 */
export interface MediaAsset {
  id: string;
  created_at: string;
  src: string;
  alt: string;
  caption: string | null;
  credit: string | null;
  source_url: string | null;
  width: number | null;
  height: number | null;
  orientation: MediaOrientation;
  slot: string | null;
  published: boolean;
  featured: boolean;
}

/* ── Video library (YouTube) ────────────────────────────────── */

export interface VideoItem {
  id: string;
  created_at: string;
  /** 11-character YouTube id — validated before it can be saved. */
  youtube_id: string;
  title: string;
  outlet: string | null;
  published_at: string | null;
  featured: boolean;
  published: boolean;
}

/* ── Editable profile / channels / sources ──────────────────── */

export interface ProfileFactRow {
  id: string;
  key: string;
  /** null = not yet confirmed in writing by HQ; the row is hidden publicly. */
  value: string | null;
  note: string | null;
  sort: number;
}

export interface SocialRow {
  id: string;
  platform: SocialProfile['platform'];
  label: string;
  handle: string;
  url: string | null;
  sort: number;
}

export interface ReferenceRow {
  id: string;
  year: number;
  date: string;
  outlet: string;
  headline: string;
  url: string;
}

/* ── Editable site copy ─────────────────────────────────────── */

export interface SiteStat {
  value: string;
  label: string;
}

export interface SiteSettings {
  hero_kicker: string;
  hero_title: string;
  hero_slogan: string;
  hero_body: string;
  cta_title: string;
  cta_body: string;
  stats: SiteStat[];
}
