/**
 * amuwo-politics.ts — the sourced civic and political brief behind the Truth Desk.
 *
 * Everything here is either (a) a structural fact about Amuwo-Odofin and the
 * Lagos State House of Assembly, or (b) a fact already published in the
 * campaign record. Each entry carries the source the answer should cite. This
 * is what lets the desk answer questions about the constituency itself — wards,
 * FESTAC Town, the Assembly, elections, the candidate's political timeline —
 * not only questions that quote a ledger entry word for word.
 *
 * No opponent claims, no speculation, no unsourced election results.
 */

export interface PoliticsFact {
  id: string;
  topic: string;
  fact: string;
  sourceLabel: string;
  sourceUrl: string | null;
}

export const AMUWO_POLITICS: PoliticsFact[] = [
  {
    id: 'pol-lga',
    topic: 'Local government structure',
    fact:
      'Amuwo-Odofin is one of the 20 Local Government Areas of Lagos State. Lagos State has 40 state constituencies, each electing one member to the 40-member Lagos State House of Assembly.',
    sourceLabel: 'Lagos State House of Assembly — About Us',
    sourceUrl: 'https://lagoshouseofassembly.gov.ng/home/about-us/',
  },
  {
    id: 'pol-constituency',
    topic: 'Amuwo-Odofin Constituency I',
    fact:
      'Amuwo-Odofin Constituency I is a Lagos State House of Assembly constituency made up of four wards: Amuwo-Odofin Housing Estate, Mile 2; Festac I; Festac II; and Festac III.',
    sourceLabel: 'Our Nigeria — Amuwo-Odofin I State Constituency',
    sourceUrl: 'https://ournigeria.ng/constituencies/state_lagos_amuwo_odofin_i',
  },
  {
    id: 'pol-lga-wards',
    topic: 'LGA and LCDA wards',
    fact:
      'Amuwo-Odofin LGA also contains Oriade LCDA and Amuwo LCDA. LASIEC lists LGA electoral wards including Festac, Mile 2, Kirikiri, Ijegun, Trade Fair, Satellite, Kirikiri II, Abule Ado, Ilasamaja and Kirikiri III. Not every LGA ward falls inside the four-ward Amuwo-Odofin Constituency I.',
    sourceLabel: 'Lagos State Independent Electoral Commission — Electoral Wards',
    sourceUrl: 'https://lasiec.gov.ng/electoral-wards/',
  },
  {
    id: 'pol-festac',
    topic: 'FESTAC Town and FESTAC 77',
    fact:
      'FESTAC Town is a federal housing estate in Amuwo-Odofin, built as the festival village for FESTAC 77 — the Second World Black and African Festival of Arts and Culture — held in Lagos in January and February 1977. The name FESTAC comes from that festival.',
    sourceLabel: 'FESTAC 77 — festival history',
    sourceUrl: 'https://en.wikipedia.org/wiki/FESTAC_77',
  },
  {
    id: 'pol-festac-services',
    topic: 'Why FESTAC infrastructure needs coordination',
    fact:
      'FESTAC Town is a federal housing estate, while its avenues sit inside Lagos State and Amuwo-Odofin LGA/LCDA territory. Road maintenance, drainage, street-lighting and refuse therefore cross federal (FHA), state and local responsibilities. The campaign’s FHA & Municipal Infrastructure Bill proposes a formal coordination framework instead of treating the estate as a single-agency problem.',
    sourceLabel: 'Campaign blueprint — FHA & Municipal Infrastructure Bill',
    sourceUrl: 'https://www.olawestern.ng/blueprint',
  },
  {
    id: 'pol-assembly',
    topic: 'What the Lagos State House of Assembly does',
    fact:
      'The Lagos State House of Assembly is the state legislature. Its 40 members make state laws, scrutinise the executive and approve the state budget. The member for Amuwo-Odofin Constituency I represents the four wards listed above; the seat is a state Assembly seat, not a House of Representatives or local government chairmanship seat.',
    sourceLabel: 'Lagos State House of Assembly — About Us',
    sourceUrl: 'https://lagoshouseofassembly.gov.ng/home/about-us/',
  },
  {
    id: 'pol-elections',
    topic: 'Who runs elections',
    fact:
      'INEC conducts federal and state elections in Nigeria, including Lagos State House of Assembly seats, which are contested every four years alongside the general election. LASIEC conducts local government council elections in Lagos State. Party primaries, such as the APC primary, choose each party’s flagbearer before the general election.',
    sourceLabel: 'Lagos State Independent Electoral Commission',
    sourceUrl: 'https://lasiec.gov.ng/',
  },
  {
    id: 'pol-candidate-timeline',
    topic: 'Ola Western’s political timeline',
    fact:
      'Ola Western served as Member, Lagos State House of Assembly for Amuwo-Odofin Constituency I from 2015 to 2019 and chaired the House Committee on Waterfront Infrastructure Development. He won the APC primary in May 2022 with 12 of 20 accredited delegate votes (60%), and the party’s 2026 consensus primary with over 3,000 votes across the wards.',
    sourceLabel: 'Campaign record — Truth Room ledger',
    sourceUrl: 'https://www.olawestern.ng/truth-room',
  },
  {
    id: 'pol-candidate-record',
    topic: 'Published pre-office and constituency record',
    fact:
      'The campaign’s dated record begins before elected office: six boreholes committed for each ward and the 7th Avenue drainage desilting (2018); a Christmas Food Festival that fed 500 homes (December 2021); community viewing centres for the Qatar 2022 World Cup; the NIWA jetty negotiation that put Mile 2 youths at the table (September 2022); state approval for six FESTAC roads including the rebuild of 1st Avenue (2023); the Ola Western Food Fest that reached more than 700 households — over 1,000 residents (2024); and a Community Builders Award (December 2025).',
    sourceLabel: 'Campaign record — track record and newsroom',
    sourceUrl: 'https://www.olawestern.ng/impact',
  },
  {
    id: 'pol-charitable-record-recent',
    topic: 'Recent charitable and community record',
    fact:
      'The published record also includes the second Ola Western Food Fest in March 2024 — The Sun reported over 1,000 residents, while Vanguard and FestacOnline reported at least 750 vulnerable residents receiving live chicken, rice, yam, garri, vegetable oil and cash — and the sponsorship of seven Amuwo-Odofin women to attend the COWLSO 2026 National Women’s Conference in October 2026.',
    sourceLabel: 'The Sun, Vanguard, FestacOnline, Festac Weekly',
    sourceUrl: 'https://festaconline.com.ng/amuwos-councilman-distributes-food-items/',
  },
  {
    id: 'pol-representation',
    topic: 'What a state lawmaker can and cannot deliver alone',
    fact:
      'A state House of Assembly member’s formal tools are lawmaking, budget scrutiny, oversight and constituency engagement. Federal roads, FHA housing and federal drainage are not solely within a state lawmaker’s control; refuse, markets and some local roads involve the LGA/LCDA. The campaign frames its agenda around that division of responsibility rather than promising work that belongs to another tier of government.',
    sourceLabel: 'Campaign blueprint — governance and infrastructure',
    sourceUrl: 'https://www.olawestern.ng/blueprint',
  },
  {
    id: 'pol-ballot',
    topic: 'The office and party on the ballot',
    fact:
      'Ola Western is the candidate of the All Progressives Congress (APC) for the Lagos State House of Assembly in Amuwo-Odofin Constituency I. A ballot, slogan or social-media post that names a different office or party should be checked against the Truth Room ledger or sent to the media desk through Ask Ola.',
    sourceLabel: 'Campaign record — Truth Room ruling',
    sourceUrl: 'https://www.olawestern.ng/truth-room',
  },
  {
    id: 'pol-election-calendar',
    topic: 'When the 2027 election is held',
    fact:
      'INEC’s published 2027 calendar puts the Presidential and National Assembly elections on Saturday, 16 January 2027, and the Governorship and State Houses of Assembly elections — the election that decides the Amuwo-Odofin Constituency I seat — on Saturday, 6 February 2027.',
    sourceLabel: 'INEC — Full Election Calendar and Timetable',
    sourceUrl: 'https://www.inecnigeria.org/elections/calendar',
  },
  {
    id: 'pol-three-seats',
    topic: 'The three seats Amuwo-Odofin fills',
    fact:
      'Amuwo-Odofin does not elect one representative. It fills a House of Representatives seat (Amuwo-Odofin Federal Constituency) at the National Assembly, and two Lagos State House of Assembly seats (Constituency I and Constituency II). The LGA also elects a council chairman and councillors in LASIEC-run local government elections. INEC’s 2027 House of Representatives final list names Moses Olarewaju as the APC candidate for Amuwo-Odofin, and its State House of Assembly final list names Rauf Olawale Age-Sulaiman as the APC candidate for Constituency II alongside Ola Western for Constituency I.',
    sourceLabel: 'INEC — final candidate lists, 2027',
    sourceUrl:
      'https://inecnigeria.org/documents/uploads/2026/10/b7e9758b-56ae-4068-89c0-8a4b38dd5d35-final-list-lagos-house-of-representatives.pdf',
  },
  {
    id: 'pol-apc-local',
    topic: 'Why the 2027 Amuwo-Odofin race is a local contest',
    fact:
      'In April 2026, APC stakeholders in Amuwo-Odofin publicly backed Moses Olanrewaju for the House of Representatives and Ola Western for the Constituency I State Assembly seat; The Nation reported the party showcasing the two as consensus candidates. The primaries that followed were held locally — NAN reported Olanrewaju winning the House of Representatives primary in Festac in May 2026, and Festac Online reported Ola Western winning Constituency I with more than 3,000 votes. INEC’s final list also names Rauf Olawale Age-Sulaiman as the APC candidate for Constituency II. The public endorsements therefore came from Amuwo-Odofin stakeholders and the decisions were made inside the constituency. That is why this desk treats local knowledge — knowing the roads, wards, estates and drainage channels — as a fair test in this race, while leaving the choice itself to the voter.',
    sourceLabel: 'Vanguard, The Nation, NAN and Festac Online reporting; INEC final lists',
    sourceUrl:
      'https://www.vanguardngr.com/2026/04/2027-apc-stakeholders-back-olanrewaju-olawestern-bids-in-amuwo-ofin/',
  },
  {
    id: 'pol-comparison',
    topic: 'How to compare candidates without a campaign ranking',
    fact:
      'This desk does not rank candidates or tell anyone how to vote. The published record has no verified dossier on the other people contesting Amuwo-Odofin Constituency I, so any comparison should use tests a voter can check independently: the exact office and party on the ballot (INEC’s published candidate list); a dated, sourced record of constituency work rather than slogans; whether the candidate lives in or can be reached in the constituency; published legislative output and committee work in the Lagos State House of Assembly; and a plan whose promises match what a state lawmaker can actually control. Ola Western’s verifiable record is the dated ledger on the Impact page and the Truth Room; claims about any other candidate should be checked against that candidate’s own public record, not repeated from a WhatsApp forward.',
    sourceLabel: 'Campaign record — Truth Room and Impact ledger',
    sourceUrl: 'https://www.olawestern.ng/impact',
  },
];
