import type { IssueCategory, Ward } from '@/types';

/**
 * The public operating data behind /hq.
 *
 * Everything here is drawn from the published record or the published agenda.
 * Nothing is invented, no poll is simulated and no promise is marked delivered
 * without a report the campaign can point a resident to.
 */

export type PromiseStatus = 'delivered' | 'in_progress' | 'pledged';

export interface PublicPromise {
  id: string;
  title: string;
  summary: string;
  ward: string;
  status: PromiseStatus;
  evidence: string;
  href: string;
}

export const PROMISE_STATUS_LABEL: Record<PromiseStatus, string> = {
  delivered: 'Delivered',
  in_progress: 'In progress',
  pledged: 'Pledged',
};

export const PROMISE_LEDGER: PublicPromise[] = [
  {
    id: 'boreholes',
    title: 'Six-ward borehole drive',
    summary: 'Water points delivered across the constituency before office, not after a campaign photo.',
    ward: 'All wards',
    status: 'delivered',
    evidence: 'Six boreholes delivered across six wards, with press coverage from 2018.',
    href: '/impact',
  },
  {
    id: 'seventh-avenue',
    title: '7th Avenue drainage desilting',
    summary: 'Support for clearing the drainage channel that floods the avenue every rainy season.',
    ward: 'Festac I',
    status: 'delivered',
    evidence: '7th Avenue drainage desilting supported in 2018.',
    href: '/impact',
  },
  {
    id: 'first-avenue',
    title: 'Rebuild 1st Avenue',
    summary: 'The road standard residents can see, not a promise on a pamphlet.',
    ward: 'Festac I',
    status: 'delivered',
    evidence: '1st Avenue rebuilt in 2023 after state approval for six FESTAC roads.',
    href: '/impact',
  },
  {
    id: 'food-fest',
    title: 'Food Fest for households',
    summary: 'Direct household relief at a time when many families were stretched.',
    ward: 'All wards',
    status: 'delivered',
    evidence: 'More than 1,000 households fed at the Ola Western Food Fest in 2024.',
    href: '/impact',
  },
  {
    id: 'open-door',
    title: 'A permanent constituency office',
    summary: 'The 32 Road desk is already open. The pledge is to make it a permanent office of a lawmaker.',
    ward: 'All wards',
    status: 'in_progress',
    evidence: 'Open-door hours and a public request dashboard are already running.',
    href: '/help-desk',
  },
  {
    id: 'town-halls',
    title: 'Quarterly ward town halls',
    summary: 'A fixed accountability rhythm across Festac I–III and Mile 2, not a listening tour once every four years.',
    ward: 'All wards',
    status: 'in_progress',
    evidence: 'The open-door cycle is running; quarterly ward slots are confirmed by each ward desk.',
    href: '/help-desk#open-door',
  },
  {
    id: 'twenty-three-road',
    title: 'Rehabilitate 23 Road',
    summary: 'A full rehabilitation pushed through FHA–state–LGA cooperation.',
    ward: 'Festac II',
    status: 'pledged',
    evidence: 'A published legislative agenda item, with the delivery route named.',
    href: '/blueprint',
  },
  {
    id: 'street-lighting',
    title: 'Avenue street-lighting schedule',
    summary: 'Working lights and a maintenance schedule residents can actually hold the Assembly to.',
    ward: 'All wards',
    status: 'pledged',
    evidence: 'A published agenda commitment on lighting and maintenance.',
    href: '/blueprint',
  },
  {
    id: 'youth-hubs',
    title: 'Youth digital and sports hubs',
    summary: 'One hub per ward, connected to real jobs rather than a one-week training photo-op.',
    ward: 'All wards',
    status: 'pledged',
    evidence: 'Agenda commitment: one hub per ward and an annual opportunity report.',
    href: '/blueprint',
  },
  {
    id: 'trader-protection',
    title: 'Trader protection bill',
    summary: 'A written levy schedule and fair regulatory guidelines traders can hold agencies to.',
    ward: 'Mile 2 / Housing Estate',
    status: 'pledged',
    evidence: 'A published bill commitment covering LAWMA and municipal task forces.',
    href: '/blueprint',
  },
];

export interface WardBrief {
  headline: string;
  commitments: string[];
  onTheGround: string;
  townHall: string;
  priority: IssueCategory;
}

/**
 * Ward-specific commitments from the published agenda and record.
 * Town-hall slots are described as a cycle, never as invented dates.
 */
export const WARD_BRIEFS: Record<Ward, WardBrief> = {
  'Festac I': {
    headline: 'Roads, drainage and the 1st Avenue standard',
    commitments: [
      'Finish the 1st Avenue rebuild and extend the same standard to adjoining avenues.',
      'Clear and maintain the 7th Avenue drainage channel before every rainy season.',
      'Publish a ward-by-ward road and street-light schedule the Assembly can be held to.',
    ],
    onTheGround: '1st Avenue rebuilt (2023) · 7th Avenue drainage desilting supported (2018)',
    townHall: 'Quarterly open-door cycle · next slot confirmed by the Festac I ward desk',
    priority: 'Roads & Streetlighting',
  },
  'Festac II': {
    headline: '23 Road, schools and the everyday commute',
    commitments: [
      'Push the full rehabilitation of 23 Road through FHA–state–LGA cooperation.',
      'Protect school routes and pedestrian crossings with lighting and traffic calming.',
      'Open a constituency feedback desk that reports back on every request.',
    ],
    onTheGround: '23 Road rehabilitation is a published agenda item · ward feedback desk open',
    townHall: 'Quarterly open-door cycle · next slot confirmed by the Festac II ward desk',
    priority: 'Roads & Streetlighting',
  },
  'Festac III': {
    headline: 'Water, security and community infrastructure',
    commitments: [
      'Extend the borehole drive and publish a maintenance schedule for each pump.',
      'Support estate security coordination with the LGA and Lagos State command.',
      'Create youth digital-skill and sports hubs inside the ward.',
    ],
    onTheGround: 'Six-ward borehole drive delivered · palliative outreach across the constituency',
    townHall: 'Quarterly open-door cycle · next slot confirmed by the Festac III ward desk',
    priority: 'Water & Boreholes',
  },
  'Mile 2 / Housing Estate': {
    headline: 'Market livelihoods and safe transport corridors',
    commitments: [
      'Protect Agboju and Mile 2 traders from arbitrary levies and demolition notices.',
      'Fix the drainage and lighting around busy transport corridors.',
      'Route constituent complaints through a named ward captain, not a queue.',
    ],
    onTheGround: 'Agboju trader engagement documented · market-protection bill on the agenda',
    townHall: 'Quarterly open-door cycle · next slot confirmed by the Mile 2 ward desk',
    priority: 'Market & SME',
  },
};

/** What a Street Brief says next, keyed by the resident's chosen priority. */
export const STREET_ACTIONS: Record<IssueCategory, string[]> = {
  'Drainage & Flooding': [
    'Photograph the blocked channel and the nearest landmark, then file it at the Help Desk.',
    'The ward desk verifies the location and publishes the report on the public dashboard.',
    'The quarterly town hall escalates what the ward cannot fix alone.',
  ],
  'Roads & Streetlighting': [
    'Name the exact stretch and the nearest junction in your report.',
    'The desk groups repeat reports so the Assembly sees one ward-level case, not scattered complaints.',
    'Progress is published against the road and lighting schedule.',
  ],
  'Water & Boreholes': [
    'Report the pump, the ward and whether it is dry or broken.',
    'The desk logs it against the borehole maintenance schedule.',
    'A failing pump is escalated at the next open-door sitting.',
  ],
  'Community Security': [
    'Report the location and pattern without publishing anyone’s personal details.',
    'The ward desk coordinates with estate leadership and the LGA.',
    'Verified updates are published without identifying a reporter.',
  ],
  'Waste & Sanitation': [
    'Report the dump site or missed collection point with a landmark.',
    'The desk routes it to the ward sanitation contact and tracks the response.',
    'Recurring sites are raised with the relevant agency through the Assembly.',
  ],
  'Market & SME': [
    'Describe the levy, the collecting agency and the market gate involved.',
    'The desk documents the case for the trader-protection bill.',
    'Traders are briefed at the next ward market engagement.',
  ],
};

export interface LongGameChapter {
  year: string;
  title: string;
  body: string;
  checks: string[];
}

/**
 * A ten-year view. Written as conditional commitments: the election has not
 * been held, so every line is what the campaign would be judged on if elected.
 */
export const LONG_GAME: LongGameChapter[] = [
  {
    year: '2027',
    title: 'Earn the mandate',
    body: 'Run a constituency campaign built on the record and the published agenda, then publish the first 100-day contract before election day.',
    checks: ['Ward-by-ward vote plan', 'First 100-day contract published', 'Every promise entered in the public ledger'],
  },
  {
    year: '2027',
    title: 'Open the office in the first 100 days',
    body: 'Move the 32 Road desk from a campaign operation to a permanent constituency office with four named ward desks.',
    checks: ['Permanent office opened', 'Four ward desks named', 'Public request queue live'],
  },
  {
    year: '2028',
    title: 'First full legislative year',
    body: 'Take the road and drainage framework, the trader-protection bill and the youth-hub pilot into the Assembly.',
    checks: ['Roads and drainage framework tabled', 'Trader-protection bill tabled', 'First youth hub opened'],
  },
  {
    year: '2029–30',
    title: 'Deliver in public',
    body: 'Publish an annual scorecard against every ledger entry and invite an independent community review of what moved and what did not.',
    checks: ['Annual scorecard published', 'Community review convened', 'Unfinished promises carried forward'],
  },
  {
    year: '2031',
    title: 'Ask for a second mandate',
    body: 'Seek re-election on the public record, not a new set of slogans. The ledger is the manifesto.',
    checks: ['Record re-published', 'New commitments added', 'Town-hall cycle continues'],
  },
  {
    year: '2035',
    title: 'Leave an institution, not a poster',
    body: 'A constituency office, a maintenance culture and a talent pipeline that outlast one term in the House of Assembly.',
    checks: ['Office institutionalised', 'Maintenance schedules inherited', 'Youth pipeline active'],
  },
];
