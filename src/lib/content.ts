import type {
  Accomplishment, FactCheck, PressItem, SocialProfile
} from '@/types';
import {
  NEW_ACCOMPLISHMENTS,
  NEW_FACT_CHECKS,
  NEW_PRESS_ITEMS,
  NEW_PROFILE_FACTS,
  NEW_REFERENCE_LINKS
} from './new-content';


export const SEED_VERSION = '2026-11-04-merged';

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

export const SOCIALS: SocialProfile[] = [
  { platform: 'whatsapp', label: 'WhatsApp', handle: '+234 904 125 8180', url: 'https://wa.me/2349041258180?text=SupportOlaWestern' },
  { platform: 'x', label: 'X (Twitter)', handle: '@olawestern23', url: 'https://x.com/olawestern23' },
  { platform: 'instagram', label: 'Instagram', handle: '@olawestern23', url: 'https://www.instagram.com/olawestern23' },
  { platform: 'facebook', label: 'Facebook', handle: 'Ola Western Campaign [CONFIRM]', url: null },
  { platform: 'tiktok', label: 'TikTok', handle: '@olawestern [CONFIRM]', url: null },
  { platform: 'youtube', label: 'YouTube', handle: 'Ola Western Campaign [CONFIRM]', url: null },
];

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
  ...NEW_PROFILE_FACTS,
  { label: 'Profession', value: 'Certified Civil Engineer · Chief Executive Officer, Western Group of Companies', confirmed: true, note: 'Civil engineering and construction firm headquartered in FESTAC Town' },
  { label: 'Residence', value: 'Lives and works in FESTAC Town, Amuwo-Odofin', confirmed: true, note: 'Business and campaign HQ both on the constituency ground he represents' },
  { label: 'Constituency Base', value: 'FESTAC Town, Amuwo-Odofin', confirmed: true },
  { label: 'Campaign HQ', value: '32 Road by 3rd Avenue, FESTAC Town', confirmed: true },
  { label: 'Languages', value: 'English · Nigerian Pidgin · Yoruba', confirmed: true },
  { label: 'Date of Birth', value: null, confirmed: false, note: 'Awaiting campaign confirmation' },
  { label: 'State of Origin', value: null, confirmed: false, note: 'Awaiting campaign confirmation' },
  { label: 'Marital Status / Family', value: null, confirmed: false, note: 'Known as a family man — details awaiting confirmation' },
  { label: 'Faith', value: null, confirmed: false, note: 'Awaiting campaign confirmation' },
];

export interface ReferenceLink {
  year: number;
  date: string;
  outlet: string;
  headline: string;
  url: string;
}

export const REFERENCE_LINKS: ReferenceLink[] = [
  ...NEW_REFERENCE_LINKS.map(link => ({ year: new Date().getFullYear(), date: new Date().toDateString(), outlet: new URL(link.url).hostname, headline: link.title, url: link.url })),
  { year: 2018, date: 'March 2018', outlet: 'FestacOnline', headline: 'Good news: 6 wards to get boreholes in Amuwo-Odofin', url: 'https://festaconline.com.ng/good-news-6-wardsto-get-boreholes-amuwoodofin/' },
  { year: 2018, date: 'March 2018', outlet: 'The Nation', headline: 'Council partners investor on CSR projects in Amuwo-Odofin', url: 'https://thenationonlineng.net/council-partners-investor-csr/' },
];

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