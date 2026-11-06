import type {
  Accomplishment, FactCheck, PressItem, ProfileFactRow, ReferenceRow, SiteSettings, SocialProfile
} from '@/types';
import {
  NEW_ACCOMPLISHMENTS,
  NEW_FACT_CHECKS,
  NEW_PRESS_ITEMS,
  NEW_PROFILE_FACTS,
  NEW_REFERENCE_LINKS
} from './new-content';


export const SEED_VERSION = '2026-11-04-fixed';

export const SITE = {
  candidateName: 'Hon. Engr. Folorunsho Olaitan Segun',
  brandName: 'Ola Western',
  office: 'Lagos State House of Assembly',
  constituency: 'Amuwo-Odofin Constituency I',
  party: 'All Progressives Congress (APC)',
  slogan: '... towards responsible representation',
  hq: '32 Road by 3rd Avenue, FESTAC Town, Amuwo-Odofin LGA',
  whatsappNumber: '2348034005708',
  whatsappLink: 'https://wa.me/2348034005708?text=SupportOlaWestern',
  email: 'ekabo@olawestern.ng',
  campaignDeskPhone: '+234 803 400 5708',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.olawestern.ng',
} as const;

export const SEED_SETTINGS: SiteSettings = {
  hero_kicker: 'APC Flagbearer · Amuwo-Odofin Constituency I',
  hero_title: 'Hon. Engr. Folorunsho Olaitan Segun',
  hero_slogan: 'A Track Record of Service, A Vision for the Future.',
  hero_body: "From infrastructure to empowerment, Ola Western has consistently delivered for the people of Amuwo-Odofin. Now, he's ready to bring that same dedication to the Lagos State House of Assembly.",
  cta_title: 'Get Involved',
  cta_body: 'Join the movement to bring effective and responsible representation to our constituency. Volunteer, donate, or simply spread the word.',
  stats: [
    { value: '6+', label: 'Boreholes Drilled' },
    { value: '2', label: 'Transformers Donated' },
    { value: '200+', label: 'Widows Supported' },
    { value: '1000s', label: 'Lives Impacted' },
  ],
};

export const SOCIALS: SocialProfile[] = [
  { platform: 'whatsapp', label: 'WhatsApp', handle: '+234 803 400 5708', url: 'https://wa.me/2348034005708?text=SupportOlaWestern' },
  { platform: 'x', label: 'X (Twitter)', handle: '@olawestern23', url: 'https://x.com/olawestern23' },
  { platform: 'instagram', label: 'Instagram', handle: '@olawestern23', url: 'https://www.instagram.com/olawestern23' },
  { platform: 'facebook', label: 'Facebook', handle: 'Ola Western Campaign [CONFIRM]', url: null },
  { platform: 'tiktok', label: 'TikTok', handle: '@olawestern [CONFIRM]', url: null },
  { platform: 'youtube', label: 'YouTube', handle: 'Ola Western Campaign [CONFIRM]', url: null },
];

export const PROFILE_FACTS: ProfileFactRow[] = [
  { id: 'fact-full-name', key: 'Full Name', value: 'Hon. Engr. Folorunsho Olaitan Segun', note: 'Popularly known as Ola Western', sort: 1 },
  { id: 'fact-office-sought', key: 'Office Sought', value: 'Member, Lagos State House of Assembly', note: 'Amuwo-Odofin Constituency I (Festac I–III & Mile 2)', sort: 2 },
  { id: 'fact-party', key: 'Party', value: 'All Progressives Congress (APC)', note: 'Flagbearer after winning the party primary', sort: 3 },
  ...NEW_PROFILE_FACTS,
  { id: 'fact-profession', key: 'Profession', value: 'Certified Civil Engineer · Chief Executive Officer, Western Group of Companies', note: 'Civil engineering and construction firm headquartered in FESTAC Town', sort: 10 },
  { id: 'fact-residence', key: 'Residence', value: 'Lives and works in FESTAC Town, Amuwo-Odofin', note: 'Business and campaign HQ both on the constituency ground he represents', sort: 11 },
  { id: 'fact-constituency-base', key: 'Constituency Base', value: 'FESTAC Town, Amuwo-Odofin', note: null, sort: 12 },
  { id: 'fact-campaign-hq', key: 'Campaign HQ', value: '32 Road by 3rd Avenue, FESTAC Town', note: null, sort: 13 },
  { id: 'fact-languages', key: 'Languages', value: 'English · Nigerian Pidgin · Yoruba', note: null, sort: 14 },
  { id: 'fact-dob', key: 'Date of Birth', value: null, note: 'Awaiting campaign confirmation', sort: 15 },
  { id: 'fact-state-of-origin', key: 'State of Origin', value: null, note: 'Awaiting campaign confirmation', sort: 16 },
  { id: 'fact-marital-status', key: 'Marital Status / Family', value: null, note: 'Known as a family man — details awaiting confirmation', sort: 17 },
  { id: 'fact-faith', key: 'Faith', value: null, note: 'Awaiting campaign confirmation', sort: 18 },
];

export const REFERENCE_LINKS: ReferenceRow[] = [
  ...NEW_REFERENCE_LINKS,
  { id: 'ref-1', year: 2018, date: 'March 2018', outlet: 'FestacOnline', headline: 'Good news: 6 wards to get boreholes in Amuwo-Odofin', url: 'https://festaconline.com.ng/good-news-6-wardsto-get-boreholes-amuwoodofin/' },
  { id: 'ref-2', year: 2018, date: 'March 2018', outlet: 'The Nation', headline: 'Council partners investor on CSR projects in Amuwo-Odofin', url: 'https://thenationonlineng.net/council-partners-investor-csr/' },
];

export type { ReferenceRow as ReferenceLink };

export const MEDIA_POSITIONS = [
  { slot: 'candidate-portrait', label: 'Candidate portrait', ratio: '4:5' },
  { slot: 'hq-office', label: 'Campaign office', ratio: '16:9' },
  { slot: 'primary-victory', label: 'Primary victory speech', ratio: '16:9' },
  { slot: 'consensus', label: 'Consensus candidate announcement', ratio: '16:9' },
  { slot: 'primary-night', label: 'Primary night celebration', ratio: '16:9' },
  { slot: 'graphic', label: 'Blueprint graphic', ratio: '1:1' },
  { slot: 'rally-address', label: 'Rally address', ratio: '16:9' },
] as const;


export const SEED_ACCOMPLISHMENTS: Accomplishment[] = [...NEW_ACCOMPLISHMENTS];
export const SEED_PRESS_ITEMS: PressItem[] = [...NEW_PRESS_ITEMS];
export const SEED_FACT_CHECKS: FactCheck[] = [...NEW_FACT_CHECKS];

export const BLUEPRINT = [
  {
    title: 'The Amuwo Covenant: A 5-Point Agenda for Progress',
    tag: 'Governance',
    body: 'A detailed five-point plan focusing on infrastructure, economy, youth, governance, and community well-being, forming the core of the legislative agenda.',
  },
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