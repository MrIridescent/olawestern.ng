import type {
  Accomplishment, CommunityIssue, FactCheck, GallerySlide, MediaAsset, PressItem,
  ProfileFactRow, ReferenceRow, SocialProfile, SocialRow, SiteSettings, VideoItem,
} from '@/types';
import { PRESS_PHOTOS } from './pressPhotos';

/**
 * Central site configuration & bundled seed content.
 *
 * Sourcing: the profile facts, dated record entries and REFERENCE_LINKS below
 * were transcribed from the campaign's dossier, which documents each item with
 * published press reports (FestacOnline, Vanguard, The Sun, The Nation, The
 * Guardian, P.M. Express, ARBR). Undocumented personal details remain null and
 * are never auto-filled. The media desk at 32 Road HQ edits everything here
 * live through the campaign CMS at /admin before production launch.
 */

/**
 * Bumped whenever the bundled seed content below changes meaningfully.
 * The file store (data/db.json) refreshes the seeded rows on a version change
 * while keeping volunteer/inquiry leads and any CMS-created rows whose ids are
 * not in the bundle. See README → "Editing model".
 */
export const SEED_VERSION = '2026-11-02-media';

export const SITE = {
  candidateName: 'Hon. Engr. Folorunsho Olaitan Segun',
  brandName: 'Ola Western',
  office: 'Lagos State House of Assembly',
  constituency: 'Amuwo-Odofin Constituency I',
  party: 'All Progressives Congress (APC)',
  slogan: '... towards responsible representation',
  hq: '32 Road by 3rd Avenue, FESTAC Town, Amuwo-Odofin LGA',
  whatsappNumber: '2349041258180',
  whatsappLink: 'https://wa.me/2349041258180?text=SupportOlaWestern',
  email: 'olawesternco@gmail.com',
  campaignDeskPhone: '+234 803 400 5708',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.olawestern.ng',
} as const;

/**
 * SOCIAL MEDIA — the campaign's public handles.
 * `url: null` means the handle has not been confirmed by 32 Road HQ yet;
 * the site shows it as "coming soon" instead of linking somewhere wrong.
 * Fill the real URLs here once confirmed — every icon/link updates.
 */
export const SOCIALS: SocialProfile[] = [
  { platform: 'whatsapp', label: 'WhatsApp', handle: '+234 904 125 8180', url: 'https://wa.me/2349041258180?text=SupportOlaWestern' },
  { platform: 'x', label: 'X (Twitter)', handle: '@olawestern23', url: 'https://x.com/olawestern23' },
  { platform: 'instagram', label: 'Instagram', handle: '@olawestern23', url: 'https://www.instagram.com/olawestern23' },
  { platform: 'facebook', label: 'Facebook', handle: 'Ola Western Campaign [CONFIRM]', url: null },
  { platform: 'tiktok', label: 'TikTok', handle: '@olawestern [CONFIRM]', url: null },
  { platform: 'youtube', label: 'YouTube', handle: 'Ola Western Campaign [CONFIRM]', url: null },
];

/**
 * CANDIDATE FILE — the standard public fact sheet voters expect.
 * Anything the campaign has not confirmed in writing is null and renders
 * as "Awaiting campaign confirmation" — never guess or auto-fill these.
 */
export interface ProfileFact {
  label: string;
  value: string | null;
  confirmed: boolean;
  note?: string;
}

export const PROFILE_FACTS: ProfileFact[] = [
  { label: 'Full Name', value: 'Hon. Engr. Folorunsho Olaitan Segun', confirmed: true, note: 'Popularly known as Ola Western' },
  { label: 'Office Sought', value: 'Member, Lagos State House of Assembly', confirmed: true, note: 'Amuwo-Odofin Constituency I (Festac I–III & Mile 2)' },
  { label: 'Party', value: 'All Progressives Congress (APC)', confirmed: true, note: 'Flagbearer after winning the party primary' },
  { label: 'Profession', value: 'Certified Civil Engineer · Chief Executive Officer, Western Concrete', confirmed: true, note: 'Civil engineering and construction firm headquartered in FESTAC Town' },
  { label: 'Residence', value: 'Lives and works in FESTAC Town, Amuwo-Odofin', confirmed: true, note: 'Business and campaign HQ both on the constituency ground he represents' },
  { label: 'Constituency Base', value: 'FESTAC Town, Amuwo-Odofin', confirmed: true },
  { label: 'Campaign HQ', value: '32 Road by 3rd Avenue, FESTAC Town', confirmed: true },
  { label: 'Languages', value: 'English · Nigerian Pidgin · Yoruba', confirmed: true },
  { label: 'Date of Birth', value: null, confirmed: false, note: 'Awaiting campaign confirmation' },
  { label: 'State of Origin', value: null, confirmed: false, note: 'Awaiting campaign confirmation' },
  { label: 'Marital Status / Family', value: null, confirmed: false, note: 'Known as a family man — details awaiting confirmation' },
  { label: 'Education', value: null, confirmed: false, note: 'Certified civil engineer — institutions awaiting written confirmation' },
  { label: 'Faith', value: null, confirmed: false, note: 'Awaiting campaign confirmation' },
];

/**
 * PRESS & PUBLIC SOURCES — the external reference ledger.
 * Every claim on this site's Track Record should be traceable to one of these
 * independently published reports. Transcribed from the campaign's sourced
 * dossier; the media desk appends new coverage through the CMS newsroom and
 * keeps this list as the permanent bibliography of the record.
 */
export interface ReferenceLink {
  year: number;
  date: string;
  outlet: string;
  headline: string;
  url: string;
}

export const REFERENCE_LINKS: ReferenceLink[] = [
  { year: 2018, date: 'March 2018', outlet: 'FestacOnline', headline: 'Good news: 6 wards to get boreholes in Amuwo-Odofin', url: 'https://festaconline.com.ng/good-news-6-wardsto-get-boreholes-amuwoodofin/' },
  { year: 2018, date: 'March 2018', outlet: 'The Nation', headline: 'Council partners investor on CSR projects in Amuwo-Odofin', url: 'https://thenationonlineng.net/council-partners-investor-csr/' },
  { year: 2018, date: 'March 2018', outlet: 'FestacOnline', headline: '7th Avenue, Festac to get support on drainage clearing', url: 'https://festaconline.com.ng/7th-avenue-festac-to-get-support-on-drainage-clearing/' },
  { year: 2022, date: 'April 2022', outlet: 'FestacOnline', headline: 'Ola Western clinches form for House of Assembly, Amuwo', url: 'https://festaconline.com.ng/ola-western-form-for-house-of-assembly/' },
  { year: 2022, date: 'May 2022', outlet: 'FestacOnline', headline: 'Ola Western wins APC Amuwo House of Assembly primaries (12 of 20 delegates)', url: 'https://festaconline.com.ng/ola-western-wins-amuwo-house-of-assembly-primaries/' },
  { year: 2023, date: 'January 2023', outlet: 'FestacOnline', headline: '#AmuwoDecides23 — Meet the Candidates: Hon. Folorunsho (1st Avenue road advocacy)', url: 'https://festaconline.com.ng/amuwodecides23-watch-3-mins-with-hon-folorunso/' },
  { year: 2023, date: 'February 2023', outlet: 'Vanguard', headline: '2023 LAHAA Connect canvasses votes for Tinubu, Sanwo-Olu and others in Lagos', url: 'https://www.vanguardngr.com/2023/02/2023-lahaa-connect-canvasses-votes-for-tinubu-sanwo-olu-others-in-lagos/' },
  { year: 2023, date: 'February 2023', outlet: 'The Nation', headline: 'Aspirants in markets to sell Tinubu, Sanwo-Olu — Amuwo-Odofin campaign walks', url: 'https://thenationonlineng.net/aspirants-in-markets-to-sell-tinubu-sanwo-olu/' },
  { year: 2024, date: 'March 2024', outlet: 'P.M. Express', headline: 'Hon. Ola Western doles out palliatives worth millions of naira to Amuwo-Odofin residents', url: 'https://pmexpressng.com/hon-ola-western-doles-out-palliatives-worth-millions-of-naira-to-amuwo-odofin-lga-residents/' },
  { year: 2024, date: 'March 2024', outlet: 'The Sun', headline: 'Over 1,000 persons benefit from Ola Western Food Festival in Festac', url: 'https://thesun.ng/over-1000-persons-benefit-from-ola-western-food-festival-in-festac/' },
  { year: 2024, date: 'March 2024', outlet: 'Vanguard', headline: 'Easter: APC stalwart distributes food items in Amuwo-Odofin', url: 'https://www.vanguardngr.com/2024/03/easter-apc-stalwart-distributes-food-items-in-amuwo-odofin/' },
  { year: 2024, date: 'March 2024', outlet: 'Nairaland', headline: 'Community reaction: Over 700 households benefit from Hon. Ola Western palliatives', url: 'https://www.nairaland.com/8049217/over-700-households-benefit-hon' },
  { year: 2025, date: 'Mid 2025', outlet: 'Lagos Panorama', headline: 'Hamzat, Sanusi lead Amuwo-Odofin residents in monthly environmental sanitation exercise', url: 'https://lagospanorama.com/hamzat-sanusi-lead-amuwo-odofin-residents-in-monthly-environmental-sanitation-exercise/' },
  { year: 2025, date: '2025', outlet: 'P.M. Express', headline: 'Ola Western — Sterling Youth of All Times (NIWA jetty negotiation for Mile 2 youths)', url: 'https://pmexpressng.com/ola-western-sterling-youth-of-all-times/' },
  { year: 2025, date: 'December 2025', outlet: 'Vanguard', headline: 'Take Back FESTAC celebrates community builders', url: 'https://www.vanguardngr.com/2025/12/take-back-festac-celebrates-community-builders/' },
  { year: 2025, date: 'December 2025', outlet: 'The Guardian', headline: 'Lawmaker group honour Festac residents, pledge community revival', url: 'https://guardian.ng/news/nigeria/metro/lawmaker-group-honour-festac-residents-pledge-community-revival/' },
  { year: 2026, date: 'May 2026', outlet: 'FestacOnline', headline: 'Ola Folorunsho emerges APC flagbearer for Amuwo Constituency I with 3,000+ votes', url: 'https://festaconline.com.ng/ola-folorunsho-emerges-apc-flagbearer-for-amuwo-constituency-i-with-3k-votes/' },
  { year: 2026, date: 'May 2026', outlet: 'P.M. Express', headline: 'Ola Western sweeps APC Amuwo-Odofin Constituency I House of Assembly primaries', url: 'https://pmexpressng.com/ola-western-sweeps-apc-amuwo-odofin-constituency-i-house-of-assembly-primaries/' },
  { year: 2026, date: 'May 2026', outlet: 'P.M. Express', headline: 'APC Amuwo-Odofin rallies behind Ola Western, unites for 2027 assembly poll', url: 'https://pmexpressng.com/apc-amuwo-odofin-rallies-behind-ola-western-unites-for-2027-assembly-poll/' },
  { year: 2026, date: 'May 2026', outlet: 'FestacOnline', headline: 'APC unveils consensus candidates for Assembly and House of Representatives in Amuwo-Odofin', url: 'https://festaconline.com.ng/apc-unveils-consensus-candidates-for-assembly-house-of-representatives-in-amuwo-odofin/' },
  { year: 2026, date: 'August 2026', outlet: 'ARBR News', headline: 'Interactive candidate session — Ola Western Folorunsho Olaitan, accountability forum', url: 'https://arbr.com.ng/news/people/ola-western-folorunsho-olaitan/' },
];

/** Outlets that have covered the record — the "as seen in" strip. */
export const MEDIA_OUTLETS = [
  'FestacOnline',
  'Vanguard',
  'The Sun',
  'The Nation',
  'The Guardian',
  'P.M. Express',
  'ARBR',
] as const;

/**
 * GALLERY — photo slots plus published branded graphics.
 * Photographs: drop the file into `public/images/<slot>.jpg` and set
 * `src: '/images/<slot>.jpg'`. Slots without a photo render a clean branded
 * panel (file mapping lives in public/images/README.md). Slides with src set
 * are published graphics already live on the site.
 */
export const GALLERY: GallerySlide[] = [
  { id: 'g1', slot: 'candidate-portrait', src: null, alt: 'Official portrait of Hon. Ola Western', caption: 'Official campaign portrait.' },
  { id: 'g2', slot: 'primary-victory', src: null, alt: 'Ola Western with party leaders after the APC primary', caption: 'APC primary victory — over 3,000 votes, Constituency I.' },
  { id: 'g3', slot: 'town-hall-festac', src: null, alt: 'Town hall meeting with FESTAC residents', caption: 'Estate town hall — residents set the legislative agenda.' },
  { id: 'g4', slot: '23-road-inspection', src: null, alt: 'Street inspection on 23 Road, Festac', caption: '23 Road assessment with council stakeholders.' },
  { id: 'g5', slot: 'agboju-market', src: null, alt: 'Conversation with traders at Agboju market, Mile 2', caption: 'Agboju/Mile 2 traders on fair regulation and market security.' },
  { id: 'g6', slot: 'youth-tournament', src: null, alt: 'Penalty King youth football tournament', caption: 'Penalty King — youth sports sponsorship across FESTAC.' },
  { id: 'g7', slot: 'community-security', src: null, alt: 'Meeting with local vigilante and estate security groups', caption: 'Estate security coordination — patrol logistics and safety.' },
  { id: 'g8', slot: 'family-portrait', src: null, alt: 'Ola Western with his family', caption: 'Family and roots — the FESTAC Town story.' },
  { id: 'g9', slot: 'graphic-mandate', src: '/images/generated/mandate.jpg', alt: 'Graphic: 3,000-plus mandate — APC primary, Amuwo-Odofin Constituency I', caption: 'The mandate, by the numbers — APC primary, Constituency I.', credit: 'Campaign graphic' },
  { id: 'g10', slot: 'graphic-pillars', src: '/images/generated/pillars.jpg', alt: 'Graphic: the four pillars of the Ola Western legislative blueprint', caption: 'Four pillars of the legislative blueprint — Roads & Drainage, Jobs & SMEs, Security, Youth & Sports.', credit: 'Campaign graphic' },
  { id: 'g11', slot: 'graphic-slogan', src: '/images/generated/slogan.jpg', alt: 'Graphic: Ola Western — towards responsible representation', caption: '… towards responsible representation.', credit: 'Campaign graphic' },
];

/** Homepage carousel — graphics first, then photo slots as they are supplied. */
export const HOME_CAROUSEL: GallerySlide[] = [GALLERY[8], GALLERY[0], GALLERY[9], GALLERY[2], GALLERY[10], GALLERY[4]];

/** Media / press kit row on the gallery page. */
export const MEDIA_SLOTS = [
  {
    title: 'The Blueprint',
    body: 'The four-pillar legislative plan for FESTAC Town and Mile 2 — read the full manifesto online.',
    cta: 'Open the Blueprint',
    href: '/blueprint',
  },
  {
    title: 'Press Kit',
    body: 'Hi-res campaign imagery, ward maps and approved banners for accredited journalists — released same-day on request.',
    cta: 'Request from the press desk',
    href: 'mailto:olawesternco@gmail.com',
  },
  {
    title: 'File A Story Tip',
    body: 'Coverage of Constituency I that mentions the campaign? Send the link to the media desk for the newsroom ledger.',
    cta: 'Send a tip',
    href: 'mailto:olawesternco@gmail.com',
  },
] as const;

export const STATS = [
  { value: '3,000+', label: 'Votes — 2026 APC primary mandate' },
  { value: '6', label: 'State-approved roads for Constituency I' },
  { value: '1,000+', label: 'Households fed at the Food Fest' },
  { value: '20+', label: 'Published press sources on the record' },
] as const;

export const PILLARS = [
  {
    title: 'Infrastructure Advocacy',
    description:
      'FHA–municipal alignment for FESTAC road maintenance, rehabilitation of 23 Road, avenue street lighting, and canal and drainage desilting before the rainy season.',
    icon: 'road',
  },
  {
    title: 'SME & Market Support',
    description:
      'Fair regulatory enforcement by LAWMA and municipal task forces to protect small shop owners along commercial avenues and Agboju market traders.',
    icon: 'market',
  },
  {
    title: 'Youth Empowerment',
    description:
      'Digital skill hubs, sports facilities, and sponsorship of youth development initiatives such as the Penalty King tournaments across FESTAC.',
    icon: 'youth',
  },
  {
    title: 'Community Security',
    description:
      'Sustained support for local vigilante groups, patrol logistics, and estate safety initiatives in coordination with council leadership.',
    icon: 'shield',
  },
] as const;

export const TIMELINE = [
  {
    period: 'Roots',
    title: 'One of FESTAC Town’s own',
    body: 'A certified civil engineer who lives and works inside the constituency — Western Concrete and the campaign office at 32 Road by 3rd Avenue both stand on the same streets Ola Western walks every day.',
  },
  {
    period: '2018–2021',
    title: 'Delivering before office',
    body: 'Clean-water boreholes financed and built across six Amuwo-Odofin wards; heavy equipment deployed to desilt the chronic 7th Avenue drainage blockages in FESTAC Town, after earlier work in Mile 2 Wards A1 and A2 — executed with the local legislative council and covered by the press.',
  },
  {
    period: '2022–2023',
    title: 'The party’s choice; the roads follow',
    body: 'Won the May 2022 APC primary with 12 of 20 accredited delegate votes under INEC-witnessed structures, then carried detailed civil assessments to the State Governor — securing executive approval for the rehabilitation of six FESTAC roads, headlined by the rebuilt 1st Avenue.',
  },
  {
    period: '2024–2025',
    title: 'Service between the cycles',
    body: 'The Ola Western Food Fest fed over 1,000 households — elderly residents, widows, youths and persons with disabilities; an indigent healthcare fund began settling hospital bills; Mile 2 youths were negotiated into the NIWA jetty project; and Take Back FESTAC gave him a Community Builders Award.',
  },
  {
    period: '2026',
    title: 'A 3,000-vote mandate',
    body: 'Emerged from the May 2026 APC primary as the consensus flagbearer for Constituency I with over 3,000 votes across the wards, then stood before the ARBR civic forum in August to pledge an accountable legislative plan for the 2027 election.',
  },
  {
    period: 'Now',
    title: 'The general election campaign',
    body: 'Running for the Lagos State House of Assembly on a single promise: governance that moves "... towards responsible representation".',
  },
] as const;

export const ENDORSEMENTS = [
  {
    name: 'Prince Lanre Sanusi',
    role: 'APC LGA Chairman, Amuwo-Odofin',
    quote:
      'The party structure speaks with one voice: Ola Western is the consensus candidate who can deliver Constituency I to the House of Assembly.',
  },
  {
    name: 'Otunba Dotun Adegbola',
    role: 'APC Leadership, Amuwo-Odofin',
    quote:
      'His track record in the community is visible on every street — this is a man who has already served before asking for the vote.',
  },
  {
    name: 'Alhaja Memunat Ajao',
    role: 'APC Leadership, Amuwo-Odofin',
    quote:
      'A unifier. Women, traders and youth of FESTAC and Mile 2 see their own struggles reflected in his agenda.',
  },
] as const;

export const BLUEPRINT = [
  {
    title: 'FHA & Municipal Infrastructure Bill',
    tag: 'Infrastructure',
    body: 'A legislative framework to streamline federal (FHA) – state – local cooperation for FESTAC road maintenance, canal desilting, avenue street-lighting and the full rehabilitation of 23 Road.',
  },
  {
    title: 'SME & Market Trader Protection',
    tag: 'Economy',
    body: 'Enforce fair regulatory guidelines by LAWMA and municipal task forces to protect small shop owners along commercial avenues and Agboju market, keeping livelihoods secure from arbitrary disruption.',
  },
  {
    title: 'Youth Innovation & Creative Economy Hubs',
    tag: 'Youth',
    body: 'Establish digital skill centres and sports facilities for constituents across all wards — turning youth energy into employable, income-generating capability.',
  },
  {
    title: 'Constituent Accessibility & Transparency Charter',
    tag: 'Governance',
    body: 'Institutionalise what "responsible representation" means: open feedback channels, published legislative activity, and regular town halls in Festac I, II, III and Mile 2.',
  },
] as const;

export const WARD_IMPACT = [
  {
    ward: 'Festac I',
    focus: 'FHA infrastructure alignment, avenue street lighting, estate security levies reform.',
    initiatives: ['Street-lighting advocacy on 1st Avenue', 'Vigilante patrol logistics support', 'Estate residents’ association town halls'],
  },
  {
    ward: 'Festac II',
    focus: '23 Road rehabilitation, drainage & canal desilting, youth engagement.',
    initiatives: ['23 Road rehabilitation advocacy', 'Penalty King youth tournament sponsorship', 'Drainage desilting before rainy season'],
  },
  {
    ward: 'Festac III',
    focus: 'Community security, civic forums, disability & vulnerable-group support.',
    initiatives: ['Support for local vigilante groups', 'Civic & disability advocacy forums', 'Direct empowerment programmes'],
  },
  {
    ward: 'Mile 2 / Housing Estate',
    focus: 'Market trade protection for vendors, flood mitigation, transport infrastructure.',
    initiatives: ['Agboju market trader protection', 'Mile 2 flood & drainage advocacy', 'Commercial avenue SME engagement'],
  },
] as const;

/**
 * Truth Room seed ledger — documented campaign facts. The media desk edits,
 * adds and removes entries live through the campaign CMS at /admin (the CMS
 * writes to Supabase when configured, otherwise to the bundled data store).
 */
export const SEED_FACT_CHECKS: FactCheck[] = [
  {
    id: 'fc-mandate',
    created_at: '2026-10-20T09:00:00Z',
    claim_summary: '“The APC primary result did not reflect the will of the ward executives.”',
    verdict: 'FALSE CLAIM',
    detailed_explanation:
      'The record shows the opposite, twice. In May 2022 Ola Western won the APC primary for Amuwo-Odofin Constituency I with 12 of 20 accredited delegate votes (60%), defeating the incumbent and three other contenders under a Primary Election Committee witnessed by INEC, Police, DSS and NSCDC observers. In May 2026 he won the party’s consensus primary again — this time on a mandate of over 3,000 votes across the wards — and was formally presented as flagbearer alongside the House of Representatives candidate. Both results were certified through the party’s own primary structures and covered by the press.',
    official_document_url: 'https://festaconline.com.ng/ola-folorunsho-emerges-apc-flagbearer-for-amuwo-constituency-i-with-3k-votes/',
    is_featured: true,
  },
  {
    id: 'fc-no-record',
    created_at: '2026-10-22T10:00:00Z',
    claim_summary: '“The candidate has no record of community investment.”',
    verdict: 'FALSE CLAIM',
    detailed_explanation:
      'The Track Record page of this site itemises a dated, press-documented ledger of pre-office service: clean-water boreholes across six Amuwo-Odofin wards and the 7th Avenue drainage desilting (2018, FestacOnline and The Nation); executive approval secured for six FESTAC roads including the rebuild of 1st Avenue (2023); the Ola Western Food Fest feeding over 1,000 households (2024, P.M. Express, The Sun, Vanguard); the NIWA jetty negotiation that wrote Mile 2 youths into the ecological project; and a “Take Back FESTAC” Community Builders Award (December 2025, Vanguard and The Guardian). Every entry on the ledger links to the report behind it.',
    official_document_url: 'https://festaconline.com.ng/7th-avenue-festac-to-get-support-on-drainage-clearing/',
    is_featured: false,
  },
  {
    id: 'fc-ballot',
    created_at: '2026-10-25T11:00:00Z',
    claim_summary: 'Which seat and which party is Ola Western running on?',
    verdict: 'VERIFIED FACT',
    detailed_explanation:
      'Hon. Engr. Folorunsho Olaitan Segun (Ola Western) is the candidate of the All Progressives Congress (APC) for the Lagos State House of Assembly representing Amuwo-Odofin Constituency I — FESTAC Town I, FESTAC Town II, FESTAC Town III and Mile 2 / Housing Estate. Any ballot or slogan variation circulating outside this site and the campaign’s official channels should be reported through Ask Ola.',
    official_document_url: null,
    is_featured: false,
  },
  {
    id: 'fc-accessible',
    created_at: '2026-10-28T10:00:00Z',
    claim_summary: '“Lawmakers are far removed from the people who elected them.”',
    verdict: 'VERIFIED FACT',
    detailed_explanation:
      'Ola Western is different by geography: he lives, worships near, trades and runs Western Concrete inside FESTAC Town, and his campaign office at 32 Road by 3rd Avenue is the same door residents have knocked on for boreholes, drainage machines, hospital bills and food palliatives for years — before any ballot existed. That is the practical meaning of “Always here, always accessible”: the representative experiences the same roads, the same floods and the same streetlights as the constituency.',
    official_document_url: null,
    is_featured: false,
  },
];

/** Seed accomplishments — used until Supabase is connected. */
export const SEED_ACCOMPLISHMENTS: Accomplishment[] = [
  {
    id: 'a1',
    created_at: '2018-03-01T09:00:00Z',
    title: 'Clean-water boreholes across six wards',
    category: 'Infrastructure',
    ward_impact: 'Amuwo-Odofin (6 wards)',
    description:
      'Through Western Concrete, financed and constructed clean water borehole facilities across six wards in Amuwo-Odofin in partnership with local government stakeholders — restoring safe drinking water to high-density, water-stressed streets.',
    verification_source_url: 'https://festaconline.com.ng/good-news-6-wardsto-get-boreholes-amuwoodofin/',
  },
  {
    id: 'a2',
    created_at: '2018-03-20T09:00:00Z',
    title: '7th Avenue drainage desilting (Wards A1/A2 follow-through)',
    category: 'Infrastructure',
    ward_impact: 'Festac II · Mile 2',
    description:
      'Following formal requests from residents and the local legislative council, the Ola Western campaign group deployed heavy earth-moving equipment to clear chronic drainage blockages along 7th Avenue, FESTAC Town — extending earlier desilting work in Mile 2 Wards A1 and A2 ahead of the rainy season.',
    verification_source_url: 'https://festaconline.com.ng/7th-avenue-festac-to-get-support-on-drainage-clearing/',
  },
  {
    id: 'a3',
    created_at: '2022-05-27T09:00:00Z',
    title: 'Won the APC primary — 12 of 20 accredited delegate votes',
    category: 'Legislative',
    ward_impact: 'All Wards',
    description:
      'Elected APC flagbearer for the Lagos State House of Assembly, Amuwo-Odofin Constituency I, polling 12 of 20 accredited delegate votes (60%) against four contenders — under a Primary Election Committee witnessed by INEC, Police, DSS and NSCDC observers.',
    verification_source_url: 'https://festaconline.com.ng/ola-western-wins-amuwo-house-of-assembly-primaries/',
  },
  {
    id: 'a4',
    created_at: '2023-01-15T09:00:00Z',
    title: 'State approval secured for six FESTAC roads — 1st Avenue rebuilt',
    category: 'Infrastructure',
    ward_impact: 'Festac I',
    description:
      'Presented detailed civil assessments on deteriorating arterial roads directly to the Executive Governor of Lagos State, securing executive approval for the complete rehabilitation of six strategic roads in Constituency I — headlined by the reconstruction of 1st Avenue, FESTAC Town.',
    verification_source_url: 'https://festaconline.com.ng/amuwodecides23-watch-3-mins-with-hon-folorunso/',
  },
  {
    id: 'a5',
    created_at: '2024-03-30T09:00:00Z',
    title: 'Ola Western Food Fest — 1,000+ households fed',
    category: 'Philanthropy',
    ward_impact: 'All Wards',
    description:
      "The Food Fest's second edition distributed millions of naira worth of rice, yams, beans, garri, condiments and live poultry, plus cash palliatives, to over 1,000 households — elderly residents, widows, low-income youths and the PWD community — free of cost, aligned with the Ounje Eko food-security drive and supervised by CAN, the Chief Imam and community leaders.",
    verification_source_url: 'https://thesun.ng/over-1000-persons-benefit-from-ola-western-food-festival-in-festac/',
  },
  {
    id: 'a6',
    created_at: '2024-06-01T09:00:00Z',
    title: 'Indigent healthcare relief fund',
    category: 'Philanthropy',
    ward_impact: 'Amuwo-Odofin',
    description:
      'A standing emergency fund that pays off accumulated hospital bills for indigent patients in public health institutions across Amuwo-Odofin LGA — relieving families hit by medical emergencies. Operating from 32 Road HQ, outside of any election cycle.',
  },
  {
    id: 'a7',
    created_at: '2025-06-01T09:00:00Z',
    title: 'NIWA jetty negotiation — Mile 2 youths written into the project',
    category: 'Youth & Sports',
    ward_impact: 'Mile 2 / Housing Estate',
    description:
      'Led a Mile 2 youth delegation to the National Inland Waterways Authority at Marina, Lagos, on the Federal Ecological Fund Project at the Mile 2 Jetty Terminal — securing a framework that integrates local youths into the facility’s operational management, maintenance and security instead of marginalising them.',
    verification_source_url: 'https://pmexpressng.com/ola-western-sterling-youth-of-all-times/',
  },
  {
    id: 'a8',
    created_at: '2025-12-20T09:00:00Z',
    title: '“Take Back FESTAC” Community Builders Award',
    category: 'Philanthropy',
    ward_impact: 'Festac I–III',
    description:
      'Recognised by the Take Back FESTAC civic initiative with a Community Builders Award for sustained municipal interventions in the town — coverage in Vanguard and The Guardian.',
    verification_source_url: 'https://www.vanguardngr.com/2025/12/take-back-festac-celebrates-community-builders/',
  },
  {
    id: 'a9',
    created_at: '2026-05-27T09:00:00Z',
    title: 'Emerges APC consensus flagbearer for 2027 — 3,000+ votes',
    category: 'Legislative',
    ward_impact: 'All Wards',
    description:
      'Won the May 2026 APC primary for Amuwo-Odofin Constituency I with over 3,000 votes across the wards and was formally presented as the party’s flagbearer for the 2027 Lagos State House of Assembly seat.',
    verification_source_url: 'https://festaconline.com.ng/ola-folorunsho-emerges-apc-flagbearer-for-amuwo-constituency-i-with-3k-votes/',
  },
  {
    id: 'a10',
    created_at: '2026-08-15T09:00:00Z',
    title: 'Accountability pledge at the ARBR candidates’ forum',
    category: 'Legislative',
    ward_impact: 'All Wards',
    description:
      'Stood before Amuwo Residents for Better Representation (ARBR) at a public accountability forum and outlined his legislative plan for Constituency I — permanent constituent consultation, state capital projects for FESTAC, and technical skills for youth.',
    verification_source_url: 'https://arbr.com.ng/news/people/ola-western-folorunsho-olaitan/',
  },
  {
    id: 'a11',
    created_at: '2026-02-01T09:00:00Z',
    title: 'Penalty King youth tournament sponsorship',
    category: 'Youth & Sports',
    ward_impact: 'Festac II',
    description:
      'Personal sponsorship of youth football tournaments giving FESTAC boys structured sport, mentorship and safe engagement.',
  },
  {
    id: 'a12',
    created_at: '2026-02-05T09:00:00Z',
    title: 'Community vigilante and estate security support',
    category: 'Security',
    ward_impact: 'Festac I',
    description:
      'Funding of patrol logistics and estate safety initiatives in coordination with local vigilante groups and council leadership.',
  },
];

/**
 * Newsfeed seed — statements that are true of this campaign platform itself.
 * The media desk publishes ongoing dated releases through the campaign CMS at
 * /admin; community-press and endorsement items are added only with working
 * source links and the publisher's/consent of the signatory confirmed.
 */
export const SEED_NEWS: PressItem[] = [
  {
    id: 'news-truthroom',
    created_at: '2026-11-01T08:00:00Z',
    published_at: '2026-11-01T08:00:00Z',
    slug: 'ola-western-opens-truth-room',
    title: 'Ola Western campaign opens public Truth Room',
    summary:
      'The campaign media desk has launched a permanent fact-checking desk at olawestern.ng/truth-room where every claim circulating in FESTAC Town and Mile 2 is answered with evidence.',
    body:
      'Amuwo-Odofin Constituency I deserves politics that can be checked. Today the Ola Western campaign opened the Truth Room — a public ledger of verified facts and debunked claims, each ruling linked to the documents behind it. Rumours and questions can be submitted through the Ask Ola channel; the media team at 32 Road HQ reviews every submission and publishes a ruling when an issue is significant enough for the whole constituency. Nothing is published in the Truth Room without executive approval and evidence on file.',
    source: 'campaign_hq',
    pdf_url: null,
  },
  {
    id: 'news-record',
    created_at: '2026-11-01T08:05:00Z',
    published_at: '2026-11-01T08:05:00Z',
    slug: 'service-record-before-office-published',
    title: 'Pre-office service record published ahead of the general election',
    summary:
      'A verifiable ledger of Ola Western’s community work in Festac I–III and Mile 2 — before he ever sought elective office — is now published at olawestern.ng/impact.',
    body:
      'Before the ballot, there is the record. The campaign has published a categorized ledger of service spanning youth football tournament sponsorship, vigilante patrol logistics and estate safety support, advocacy with council leadership on the rehabilitation of 23 Road, and direct intervention for persons with disabilities and vulnerable residents. Ward-by-ward, the entries name where the work happened so any resident can verify it. Additional entries with documentation can be submitted to the media desk at 32 Road HQ.',
    source: 'campaign_hq',
    pdf_url: null,
  },
  {
    id: 'news-join',
    created_at: '2026-11-01T08:10:00Z',
    published_at: '2026-11-01T08:10:00Z',
    slug: 'volunteer-registration-opens-constituency-wide',
    title: 'Volunteer registration opens across all four wards',
    summary:
      'Residents of Festac I, Festac II, Festac III and Mile 2 can now register as volunteers or polling-unit supporters directly on olawestern.ng/join.',
    body:
      'The Ola Western campaign is grassroots by design, and the movement now has the tools to organise like one. Volunteer registration is open constituency-wide: supporters choose their ward, their street and their polling unit code, and flag the issue they care about most — roads, drainage, market and SME support, community security, youth and sports, or street lighting. Every registration is processed under the Nigeria Data Protection Act (2023) with explicit consent, and ward captains follow up directly on WhatsApp.',
    source: 'campaign_hq',
    pdf_url: null,
  },
];

/**
 * Constituent Help Desk seed ledger — the issues the campaign's Department of
 * Community Engagement has already logged and acted on, taken from the same
 * press-documented record as the Track Record page. Resident submissions arrive
 * through /api/issues and appear on the public dashboard only after the ward
 * team verifies and publishes them (published = true) — reporter name and phone
 * are never published.
 */
export const SEED_ISSUES: CommunityIssue[] = [
  {
    id: 'iss-7th-avenue-drainage',
    created_at: '2018-03-05T08:00:00Z',
    title: '7th Avenue arterial drainage completely blocked',
    ward: 'Festac II',
    category: 'Drainage & Flooding',
    detail:
      'Residents and the local legislative council flagged chronic water retention along the 7th Avenue commercial and residential corridor ahead of the rainy season.',
    reporter_name: null,
    reporter_phone: null,
    consent: true,
    published: true,
    status: 'resolved',
    update_note:
      'Heavy earth-moving equipment and personnel deployed by Western Concrete to desilt the primary channels, in coordination with the Amuwo-Odofin legislative council. Documented by FestacOnline.',
  },
  {
    id: 'iss-mile2-wards-drainage',
    created_at: '2018-02-10T08:00:00Z',
    title: 'Drainage blockage and flooding in Mile 2 Wards A1 & A2',
    ward: 'Mile 2 / Housing Estate',
    category: 'Drainage & Flooding',
    detail: 'Seasonal flooding reported by commuters and business operators around the Mile 2 corridor.',
    reporter_name: null,
    reporter_phone: null,
    consent: true,
    published: true,
    status: 'resolved',
    update_note: 'Cleared and desilted ahead of the 7th Avenue works — the first phase of the same drainage programme.',
  },
  {
    id: 'iss-boreholes-six-wards',
    created_at: '2018-03-01T08:00:00Z',
    title: 'No functional potable water point in six Amuwo-Odofin wards',
    ward: 'Amuwo-Odofin (6 wards)',
    category: 'Water & Boreholes',
    detail: 'Households in high-density, water-stressed pockets of FESTAC Town and peripheral settlements had no reliable safe drinking water point.',
    reporter_name: null,
    reporter_phone: null,
    consent: true,
    published: true,
    status: 'resolved',
    update_note:
      'Borehole facilities financed and constructed across six wards through Western Concrete in partnership with local government stakeholders. Covered by FestacOnline and The Nation.',
  },
  {
    id: 'iss-1st-avenue-road',
    created_at: '2022-11-20T08:00:00Z',
    title: '1st Avenue road surface failed — transit and trade blocked',
    ward: 'Festac I',
    category: 'Roads & Streetlighting',
    detail: 'Deterioration of the primary arterial road through FESTAC Town, presented to the state with a civil assessment.',
    reporter_name: null,
    reporter_phone: null,
    consent: true,
    published: true,
    status: 'resolved',
    update_note:
      'Executive approval secured from the Lagos State Government for six strategic roads in Constituency I; 1st Avenue comprehensively reconstructed. Documented in the FestacOnline candidate feature.',
  },
  {
    id: 'iss-23-road-rehabilitation',
    created_at: '2026-06-02T08:00:00Z',
    title: '23 Road rehabilitation still outstanding',
    ward: 'Festac II',
    category: 'Roads & Streetlighting',
    detail:
      'The campaign’s standing request to the FHA/municipal works partnership for full rehabilitation of 23 Road and avenue street lighting.',
    reporter_name: null,
    reporter_phone: null,
    consent: true,
    published: true,
    status: 'under_review',
    update_note:
      'Logged and carried into the legislative blueprint. Oversight continues into the state capital-work programme — the campaign will publish each step as it happens.',
  },
  {
    id: 'iss-mile2-jetty-youth',
    created_at: '2025-05-14T08:00:00Z',
    title: 'Mile 2 jetty project risked excluding local youths',
    ward: 'Mile 2 / Housing Estate',
    category: 'Market & SME',
    detail: 'The Federal Ecological Fund Project at the Mile 2 Jetty Terminal threatened to leave the Mile 2 Youth Community out of the work it created.',
    reporter_name: null,
    reporter_phone: null,
    consent: true,
    published: true,
    status: 'action_scheduled',
    update_note:
      'Delegation negotiated with the National Inland Waterways Authority at its Marina, Lagos area office, with local youth integration into operation, maintenance and security structured into the framework. Reported by P.M. Express.',
  },
];

/* ══════════════════════════════════════════════════════════════
   STORE-BACKED, CMS-EDITABLE CONTENT
   Everything below is seeded into the database on first run (and on any
   SEED_VERSION bump) and is edited from /admin afterwards — the bundle is
   only the starting state, never the live source of truth.
   ══════════════════════════════════════════════════════════════ */

/** Named image positions across the site. The Media tab assigns a slot here. */
export const MEDIA_POSITIONS = [
  { slot: 'candidate-portrait', label: 'Candidate portrait (hero / about)', ratio: '4:5' },
  { slot: 'rally-address', label: 'Rally address (home band / gallery lead)', ratio: '16:9' },
  { slot: 'primary-victory', label: 'Primary victory celebration', ratio: '16:9' },
  { slot: 'food-fest', label: 'Food Fest / palliatives distribution', ratio: '4:5' },
  { slot: 'drainage-work', label: 'Drainage and road work', ratio: '16:9' },
  { slot: 'boreholes-water', label: 'Boreholes and water project', ratio: '16:9' },
  { slot: 'form-pickup', label: '2022 form pickup', ratio: '16:9' },
  { slot: 'candidate-profile', label: 'Candidate profile (2023 feature)', ratio: '4:5' },
  { slot: 'youth-niwa', label: 'Youth / NIWA jetty engagement', ratio: '4:5' },
  { slot: 'sanitation', label: 'Environmental sanitation drive', ratio: '1:1' },
  { slot: 'primary-night', label: '2026 primary result night', ratio: '16:9' },
  { slot: 'consensus', label: 'APC consensus candidate reveal', ratio: '16:9' },
  { slot: 'graphic', label: 'Campaign graphic', ratio: '16:9' },
  { slot: 'town-hall-festac', label: 'Estate town hall meeting', ratio: '16:9' },
  { slot: '23-road-inspection', label: '23 Road street inspection', ratio: '16:9' },
  { slot: 'agboju-market', label: 'Agboju / Mile 2 market engagement', ratio: '16:9' },
  { slot: 'youth-tournament', label: 'Penalty King youth tournament', ratio: '16:9' },
  { slot: 'community-security', label: 'Estate security coordination', ratio: '16:9' },
  { slot: 'family-portrait', label: 'Family and roots portrait', ratio: '4:5' },
  { slot: 'hq-office', label: 'Campaign HQ — 32 Road, FESTAC Town', ratio: '16:9' },
] as const;

/**
 * Editorial decisions for each harvested press photograph, keyed by the article
 * it came from. Captions describe the documented event only — never a scene
 * detail the report does not support.
 */
const PHOTO_EDITORIAL: Record<string, { slot: string; alt: string; caption: string; featured?: boolean; published?: boolean }> = {
  'https://festaconline.com.ng/ola-western-wins-amuwo-house-of-assembly-primaries/': {
    slot: 'candidate-portrait', featured: true,
    alt: 'Official studio portrait of Hon. Engr. Folorunsho Olaitan Segun (Ola Western)',
    caption: 'Official campaign portrait — released with the APC flagbearer announcement.',
  },
  'https://pmexpressng.com/apc-amuwo-odofin-rallies-behind-ola-western-unites-for-2027-assembly-poll/': {
    slot: 'rally-address', featured: true,
    alt: 'Ola Western addressing a crowd of supporters in Amuwo-Odofin',
    caption: 'APC Amuwo-Odofin rallies behind Ola Western for the 2027 assembly poll.',
  },
  'https://festaconline.com.ng/ola-folorunsho-emerges-apc-flagbearer-for-amuwo-constituency-i-with-3k-votes/': {
    slot: 'primary-victory', featured: true,
    alt: 'Supporters celebrate the APC flagbearer announcement in FESTAC Town',
    caption: 'Flagbearer night, May 2026 — 3,000+ votes in Amuwo-Odofin Constituency I.',
  },
  'https://festaconline.com.ng/7th-avenue-festac-to-get-support-on-drainage-clearing/': {
    slot: 'drainage-work',
    alt: 'Drainage clearing support on 7th Avenue, FESTAC Town',
    caption: '7th Avenue drainage clearing support — the work that started in 2018.',
  },
  'https://festaconline.com.ng/good-news-6-wardsto-get-boreholes-amuwoodofin/': {
    slot: 'boreholes-water',
    alt: 'Community borehole project coverage for six Amuwo-Odofin wards',
    caption: 'Six wards covered by the community borehole programme, March 2018.',
  },
  'https://festaconline.com.ng/ola-western-form-for-house-of-assembly/': {
    slot: 'form-pickup',
    alt: 'Ola Western collects his APC nomination form for the House of Assembly',
    caption: 'Collecting the APC nomination form for Amuwo-Odofin Constituency I, April 2022.',
  },
  'https://festaconline.com.ng/amuwodecides23-watch-3-mins-with-hon-folorunso/': {
    slot: 'candidate-profile',
    alt: 'Portrait used in the #AmuwoDecides23 meet-the-candidates feature',
    caption: '#AmuwoDecides23 — meet the candidates feature, January 2023.',
  },
  'https://pmexpressng.com/hon-ola-western-doles-out-palliatives-worth-millions-of-naira-to-amuwo-odofin-lga-residents/': {
    slot: 'food-fest', featured: true,
    alt: 'Ola Western addresses residents at the Food Fest palliatives distribution in FESTAC Town',
    caption: 'Food Fest, March 2024 — palliatives distributed to more than 1,000 households.',
  },
  'https://pmexpressng.com/ola-western-sterling-youth-of-all-times/': {
    slot: 'youth-niwa',
    alt: 'Portrait from the P.M. Express profile of Ola Western',
    caption: 'Sterling Youth of All Times — the Mile 2 jetty engagement for young workers.',
  },
  'https://lagospanorama.com/hamzat-sanusi-lead-amuwo-odofin-residents-in-monthly-environmental-sanitation-exercise/': {
    slot: 'sanitation',
    alt: 'Amuwo-Odofin residents at the monthly environmental sanitation exercise',
    caption: 'Monthly environmental sanitation exercise with Amuwo-Odofin residents, 2025.',
  },
  'https://pmexpressng.com/ola-western-sweeps-apc-amuwo-odofin-constituency-i-house-of-assembly-primaries/': {
    slot: 'primary-night',
    alt: 'Coverage of the APC primary result night in Amuwo-Odofin Constituency I',
    caption: 'Primary result night — the sweep across the ward delegates.',
  },
  'https://festaconline.com.ng/apc-unveils-consensus-candidates-for-assembly-house-of-representatives-in-amuwo-odofin/': {
    slot: 'consensus',
    alt: 'APC unveils consensus candidates for Amuwo-Odofin',
    caption: 'APC unveils consensus candidates for the Assembly and House of Representatives.',
  },
  'https://thesun.ng/over-1000-persons-benefit-from-ola-western-food-festival-in-festac/': {
    slot: 'food-fest', published: false,
    alt: 'The Sun coverage of the Ola Western Food Festival in FESTAC',
    caption: 'The Sun report on the Food Fest — held back: the 275px source image is too small for the site frames.',
  },
};

export const SEED_MEDIA: MediaAsset[] = [
  ...PRESS_PHOTOS.map((p) => {
    const e = PHOTO_EDITORIAL[p.url] ?? { slot: '', alt: p.headline, caption: p.headline };
    return {
      id: p.id,
      created_at: `${p.year}-01-01T09:00:00Z`,
      src: p.src,
      alt: e.alt,
      caption: e.caption,
      credit: `Photo: ${p.outlet}`,
      source_url: p.url,
      width: p.width,
      height: p.height,
      orientation: p.orientation,
      slot: e.slot || null,
      published: e.published ?? true,
      featured: e.featured ?? false,
    };
  }),
  {
    id: 'gfx-mandate', created_at: '2026-10-20T09:00:00Z', src: '/images/generated/mandate.jpg',
    alt: 'Graphic: 3,000-plus mandate — APC primary, Amuwo-Odofin Constituency I',
    caption: 'The mandate, by the numbers — APC primary, Constituency I.',
    credit: 'Campaign graphic', source_url: null, width: 1200, height: 675, orientation: 'landscape',
    slot: 'graphic', published: true, featured: false,
  },
  {
    id: 'gfx-pillars', created_at: '2026-10-22T09:00:00Z', src: '/images/generated/pillars.jpg',
    alt: 'Graphic: the four pillars of the Ola Western legislative blueprint',
    caption: 'Four pillars of the legislative blueprint — Roads & Drainage, Jobs & SMEs, Security, Youth & Sports.',
    credit: 'Campaign graphic', source_url: null, width: 1200, height: 675, orientation: 'landscape',
    slot: 'graphic', published: true, featured: false,
  },
  {
    id: 'gfx-slogan', created_at: '2026-10-24T09:00:00Z', src: '/images/generated/slogan.jpg',
    alt: 'Graphic: Ola Western — towards responsible representation',
    caption: '… towards responsible representation.',
    credit: 'Campaign graphic', source_url: null, width: 1200, height: 675, orientation: 'landscape',
    slot: 'graphic', published: true, featured: false,
  },
];

/**
 * VIDEO — broadcast coverage of the campaign, played through the YouTube
 * no-cookie embed. Each id was checked against YouTube's oEmbed endpoint and
 * returns a live, embeddable video before it was added here.
 */
export const SEED_VIDEOS: VideoItem[] = [
  { id: 'vid-tvc-flagbearer', created_at: '2026-05-27T09:00:00Z', youtube_id: 'r3ouz4Jzgwo', title: 'Ola Western Wins APC Primary In Amuwo-Odofin Constituency', outlet: 'TVC News Nigeria', published_at: null, featured: true, published: true },
  { id: 'vid-tvc-stakeholders', created_at: '2026-05-27T09:05:00Z', youtube_id: 'jbp-N9O_Tg4', title: 'APC Stakeholders Rally Support For Ola Western In Amuwo-Odofin', outlet: 'TVC News Nigeria', published_at: null, featured: false, published: true },
  { id: 'vid-tvc-winner', created_at: '2026-05-27T09:10:00Z', youtube_id: 'hr_0-7fnb5w', title: 'Folorunso Ola Emerges Winner Of Amuwo-Odofin', outlet: 'TVC News Nigeria', published_at: null, featured: false, published: true },
];

const slugKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const SEED_PROFILE_FACTS: ProfileFactRow[] = PROFILE_FACTS.map((f, i) => ({
  id: `pf-${slugKey(f.label)}`, key: f.label, value: f.value, note: f.note ?? null, sort: i,
}));

export const SEED_SOCIALS: SocialRow[] = SOCIALS.map((s, i) => ({
  id: `soc-${s.platform}`, platform: s.platform, label: s.label, handle: s.handle, url: s.url, sort: i,
}));

export const SEED_REFERENCES: ReferenceRow[] = REFERENCE_LINKS.map((r, i) => ({
  id: `ref-${r.year}-${slugKey(r.outlet).slice(0, 14)}-${i}`, year: r.year, date: r.date, outlet: r.outlet, headline: r.headline, url: r.url,
}));

export const SEED_SETTINGS: SiteSettings = {
  hero_kicker: `APC · ${SITE.constituency}`,
  hero_title: 'Hon. Ola Western',
  hero_slogan: SITE.slogan,
  hero_body:
    'He lives here. He works here. Engr. Folorunsho Olaitan Segun — your neighbour in FESTAC Town — is running for the Lagos House of Assembly on a record already delivered: boreholes, drained avenues, rebuilt roads, fed households. Always here, always accessible.',
  cta_title: 'He is our choice — and his record is open for inspection.',
  cta_body:
    'Vote for the neighbour who already shows up. Register with your ward team, or send SupportOlaWestern on WhatsApp and talk to the campaign assistant now.',
  stats: STATS.map((s) => ({ value: s.value, label: s.label })),
};
