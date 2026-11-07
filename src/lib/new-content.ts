/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
	Accomplishment,
	AccomplishmentCategory,
	FactCheck,
	PressItem,
	ProfileFactRow as ProfileFact,
	ReferenceRow as ReferenceLink
} from '@/types';

// =================================================================================================
//	ACCOMPLISHMENTS
// =================================================================================================

export const NEW_ACCOMPLISHMENTS: Accomplishment[] = [
	{
		id: 'csr-boreholes',
		created_at: '2018-03-16T00:00:00.000Z',
		title: 'Clean-water boreholes — six per ward',
		description:
			'Committed to sinking six boreholes in each ward, with sites selected alongside party leaders and community stakeholders and a March 2018 commissioning target — a direct response to streets relying on unsafe water.',
		category: 'Infrastructure',
		ward_impact: 'Amuwo-Odofin Constituency I',
		image_url: null,
		verification_source_url:
			'https://festaconline.com.ng/amuwo-odofin-boreholes-construction-rehabilitation-western-concrete/'
	},
	{
		id: 'a2',
		created_at: '2018-03-20T09:00:00Z',
		title: '7th Avenue drainage desilting',
		description:
			'Moved heavy equipment in to clear chronic drainage blockages along 7th Avenue, FESTAC Town, at the request of residents and local leaders — ahead of the rainy season.',
		category: 'Infrastructure',
		ward_impact: 'Festac II · Mile 2',
		image_url: null,
		verification_source_url:
			'https://festaconline.com.ng/7th-avenue-festac-to-get-support-on-drainage-clearing/'
	},
	{
		id: 'csr-food-fest-2021',
		created_at: '2021-12-19T00:00:00.000Z',
		title: 'Christmas Food Festival — 500 homes fed',
		description:
			'On 19 December 2021 the Ola Western Food Festival reached 500 homes in Amuwo-Odofin with food packs and cash support for vulnerable households — the first edition of what became an annual Christmas and Easter outreach.',
		category: 'Philanthropy',
		ward_impact: 'Amuwo-Odofin Constituency I',
		image_url: null,
		verification_source_url:
			'https://www.facebook.com/NaomiSophypage/videos/hon-folorunsho-ola-western-touched-lives-and-impacted-humanity-into-the-lives-of/1251098185393772/'
	},
	{
		id: 'a3',
		created_at: '2022-05-27T09:00:00Z',
		title: 'Won the APC primary — 12 of 20 delegate votes',
		description:
			'Elected APC flagbearer for the Lagos State House of Assembly, Amuwo-Odofin Constituency I, polling 12 of 20 accredited delegate votes (60%) against four contenders under a Primary Election Committee witnessed by INEC, Police, DSS and NSCDC observers.',
		category: 'Legislative',
		ward_impact: 'All Wards',
		image_url: null,
		verification_source_url:
			'https://festaconline.com.ng/ola-western-wins-amuwo-house-of-assembly-primaries/'
	},
	{
		id: 'csr-viewing-centres-2022',
		created_at: '2022-11-20T00:00:00.000Z',
		title: 'Community viewing centres for Qatar 2022',
		description:
			'Powered community viewing centres across Amuwo-Odofin Constituency I during the Qatar 2022 FIFA World Cup — a free, safe place for residents and young people to watch the tournament together.',
		category: 'Youth & Sports',
		ward_impact: 'Amuwo-Odofin Constituency I',
		image_url: null,
		verification_source_url:
			'https://www.facebook.com/groups/505691341217951/posts/523422759444809/'
	},
	{
		id: 'a7',
		created_at: '2022-09-16T09:00:00Z',
		title: 'NIWA jetty talks — host community at the table',
		description:
			'Led a Mile 2 youth delegation to the National Inland Waterways Authority in Marina, Lagos, over the Federal Ecological Fund Project at the Mile 2 Jetty Terminal, insisting that the host community be properly engaged and benefit from the project.',
		category: 'Youth & Sports',
		ward_impact: 'Mile 2 / Housing Estate',
		image_url: null,
		verification_source_url:
			'https://pmexpressng.com/ola-western-sterling-youth-of-all-times/'
	},
	{
		id: 'a4',
		created_at: '2023-01-17T09:00:00Z',
		title: 'Announced state approval for six FESTAC roads',
		description:
			'In a January 2023 interview, Ola Western said Lagos State had approved six roads for rehabilitation in the constituency, with work on 1st Avenue, FESTAC Town, almost completed.',
		category: 'Infrastructure',
		ward_impact: 'Festac I',
		image_url: null,
		verification_source_url:
			'https://festaconline.com.ng/amuwodecides23-watch-3-mins-with-hon-folorunso/'
	},
	{
		id: 'a5',
		created_at: '2024-03-30T09:00:00Z',
		title: 'Ola Western Food Fest — 700+ households fed',
		description:
			'The second Food Fest reached more than 700 households. The Sun reported over 1,000 residents; Vanguard and FestacOnline reported at least 750 vulnerable residents receiving live chicken, rice, yam, garri, vegetable oil and cash, with elderly residents, widows, low-income youths and the PWD community among the beneficiaries.',
		category: 'Philanthropy',
		ward_impact: 'All Wards',
		image_url: null,
		verification_source_url:
			'https://thesun.ng/over-1000-persons-benefit-from-ola-western-food-festival-in-festac/'
	},
	{
		id: 'a8',
		created_at: '2025-12-22T09:00:00Z',
		title: '“Take Back FESTAC” Community Builders Award',
		description:
			'Honoured by the Take Back FESTAC Amuwo Odofin initiative at its maiden End-of-Year Dinner and Community Builder Award ceremony in December 2025, recognising residents, investors and professionals who have contributed to the growth and revival of FESTAC Town — coverage in Vanguard and The Guardian.',
		category: 'Philanthropy',
		ward_impact: 'Festac I–III',
		image_url: null,
		verification_source_url:
			'https://www.vanguardngr.com/2025/12/take-back-festac-celebrates-community-builders/'
	},
	{
		id: 'csr-cowlso-2026',
		created_at: '2026-10-28T09:00:00Z',
		title: 'Sponsored seven women to COWLSO 2026',
		description:
			'Sponsored seven women from Amuwo-Odofin to attend the COWLSO 2026 National Women’s Conference at Eko Hotels and Suites, Victoria Island — covering their participation in the state’s flagship women’s leadership and development programme.',
		category: 'Philanthropy',
		ward_impact: 'All Wards',
		image_url: null,
		verification_source_url:
			'https://www.facebook.com/100063294486613/photos/1065193355600471/'
	},
	{
		id: 'a9',
		created_at: '2026-05-27T09:00:00Z',
		title: 'APC consensus flagbearer for 2027 — 3,000+ votes',
		description:
			'Won the May 2026 APC primary for Amuwo-Odofin Constituency I with over 3,000 votes across the wards and was formally presented as the party’s flagbearer for the 2027 Lagos State House of Assembly seat.',
		category: 'Legislative',
		ward_impact: 'All Wards',
		image_url: null,
		verification_source_url:
			'https://festaconline.com.ng/ola-folorunsho-emerges-apc-flagbearer-for-amuwo-constituency-i-with-3k-votes/'
	},
	{
		id: 'a10',
		created_at: '2026-08-24T09:00:00Z',
		title: 'Public accountability forum with ARBR',
		description:
			'Fielded questions at an Amuwo Residents for Better Representation (ARBR) candidates’ forum and made public commitments on constituency consultation, state capital projects for FESTAC and technical skills for young people.',
		category: 'Legislative',
		ward_impact: 'All Wards',
		image_url: null,
		verification_source_url:
			'https://arbr.com.ng/news/people/ola-western-folorunsho-olaitan/'
	}
];

// =================================================================================================
//	PROFILE & FACT CHECKS
// =================================================================================================

export const NEW_PROFILE_FACTS: ProfileFact[] = [
	{
		id: 'fact-education',
		key: 'Primary & Secondary Education',
		value: "St. Mary's Primary School; St. Lawrence Grammar School.",
		note: null,
		sort: 4
	},
	{
		id: 'fact-tertiary-education',
		key: 'Tertiary Education',
		value:
			'Osun State Polytechnic (HND, Business Administration), Lagos State University (B.Sc., Accounting), Yaba College of Technology (HND, Civil Engineering), CJ College (Diploma, Mental Health and Addiction)',
		note: null,
		sort: 5
	},
	{
		id: 'fact-corporate-experience',
		key: 'Corporate Experience',
		value:
			'CEO of Western Group of Companies (Western Logistics, Western Construction, Western Entertainment)',
		note: 'A successful entrepreneur with a strong background in business and engineering.',
		sort: 6
	},
	{
		id: 'fact-political-experience',
		key: 'Political Experience',
		value:
			'Member, Lagos State House of Assembly (2015-2019); Chairman, House Committee on Waterfront Infrastructure Development.',
		note: null,
		sort: 7
	},
	{
		id: 'fact-awards',
		key: 'Awards & Honours',
		value:
			'ECOWAS Youth Parliament Role Model, Symbol of Hope, Grand Commander of African Youths, Amuwo-Odofin Man of the Year (2017, 2018).',
		note: null,
		sort: 8
	}
];

export const NEW_FACT_CHECKS: FactCheck[] = [
	{
		id: 'fc-mandate',
		created_at: '2026-10-20T09:00:00Z',
		claim_summary: '“The APC primary result did not reflect the will of the ward executives.”',
		verdict: 'FALSE CLAIM',
		detailed_explanation:
			'The record shows the opposite, twice. In May 2022 Ola Western won the APC primary for Amuwo-Odofin Constituency I with 12 of 20 accredited delegate votes (60%), defeating the incumbent and three other contenders under a Primary Election Committee witnessed by INEC, Police, DSS and NSCDC observers. In May 2026 he won the party’s consensus primary again — this time on a mandate of over 3,000 votes across the wards — and was formally presented as flagbearer alongside the House of Representatives candidate. Both results were certified through the party’s own primary structures and covered by the press.',
		official_document_url:
			'https://festaconline.com.ng/ola-folorunsho-emerges-apc-flagbearer-for-amuwo-constituency-i-with-3k-votes/',
		is_featured: true
	},
	{
		id: 'fc-no-record',
		created_at: '2026-10-22T10:00:00Z',
		claim_summary: '“The candidate has no record of community investment.”',
		verdict: 'FALSE CLAIM',
		detailed_explanation:
			'The Track Record page of this site itemises a dated, press-documented ledger of pre-office service: clean-water boreholes committed for each ward and the 7th Avenue drainage desilting (2018, FestacOnline and The Nation); the Christmas Food Festival that fed 500 homes (December 2021); community viewing centres for the Qatar 2022 World Cup; the NIWA jetty negotiation that put Mile 2 youths at the table (September 2022); state approval for six FESTAC roads including the rebuild of 1st Avenue (2023); the Ola Western Food Fest that reached more than 700 households — over 1,000 residents, with FestacOnline reporting 750 vulnerable residents at the Easter edition (2024, P.M. Express, The Sun, Vanguard); sponsorship of seven Amuwo-Odofin women to the COWLSO 2026 National Women’s Conference (October 2026, Festac Weekly); and a “Take Back FESTAC” Community Builders Award (December 2025, Vanguard and The Guardian). Every entry on the ledger links to the report behind it.',
		official_document_url:
			'https://festaconline.com.ng/7th-avenue-festac-to-get-support-on-drainage-clearing/',
		is_featured: false
	},
	{
		id: 'fc-ballot',
		created_at: '2026-10-25T11:00:00Z',
		claim_summary: 'Which seat and which party is Ola Western running on?',
		verdict: 'VERIFIED FACT',
		detailed_explanation:
			'Hon. Engr. Folorunsho Olaitan Segun (Ola Western) is the candidate of the All Progressives Congress (APC) for the Lagos State House of Assembly representing Amuwo-Odofin Constituency I — FESTAC Town I, FESTAC Town II, FESTAC Town III and Mile 2 / Housing Estate. Any ballot or slogan variation circulating outside this site and the campaign’s official channels should be reported through Ask Ola.',
		official_document_url:
			'https://festaconline.com.ng/ola-folorunsho-emerges-apc-flagbearer-for-amuwo-constituency-i-with-3k-votes/',
		is_featured: false
	},
	{
		id: 'fc-accessible',
		created_at: '2026-10-28T10:00:00Z',
		claim_summary: '“Lawmakers are far removed from the people who elected them.”',
		verdict: 'VERIFIED FACT',
		detailed_explanation:
			'Ola Western is different by geography: he lives, worships near, trades and runs Western Concrete inside FESTAC Town, and his campaign office at 32 Road by 3rd Avenue is the same door residents have knocked on for boreholes, drainage machines and food palliatives for years — before any ballot existed. That is the practical meaning of “Always here, always accessible”: the representative experiences the same roads, the same floods and the same streetlights as the constituency.',
		official_document_url: null,
		is_featured: false
	}
];

// =================================================================================================
//	PRESS & REFERENCE LINKS
// =================================================================================================

export const NEW_PRESS_ITEMS: PressItem[] = [
	{
		id: 'political-history-lsha-2015',
		created_at: '2015-04-11T00:00:00.000Z',
		published_at: '2015-04-11T00:00:00.000Z',
		slug: 'election-to-lsha-2015',
		title: 'Elected to Lagos State House of Assembly',
		summary:
			'In 2015, Hon. Folorunsho Olusegun was elected as the representative for Amuwo-Odofin Constituency I in the Lagos State House of Assembly.',
		body: 'Hon. Folorunsho Olusegun was elected in April 2015 to represent Amuwo-Odofin Constituency I in the Lagos State House of Assembly. His tenure ran from 2015 to 2019.\n\nIn the House he served as Chairman of the Committee on Waterfront Infrastructure Development, where his committee work focused on the infrastructure and environmental needs of waterfront communities in the constituency.\n\nThat first Assembly term is the foundation of the public record he now asks voters to extend: a seat held, committee work done, and a constituency base that remained in FESTAC Town after the term ended.',
		source: 'campaign_hq',
		pdf_url: null
	},
	{
		id: 'political-history-apc-primaries-2023',
		created_at: '2023-05-27T00:00:00.000Z',
		published_at: '2023-05-27T00:00:00.000Z',
		slug: 'apc-primaries-victory-2023',
		title: 'Victory at the APC Primaries for Lagos House of Assembly',
		summary:
			'Hon. Folorunsho Olusegun emerged as the winner of the All Progressives Congress (APC) primaries for the Lagos State House of Assembly, Amuwo-Odofin Constituency 1.',
		body: 'Following a keenly contested primary election, Ola Western secured the party\'s ticket with 12 of 20 accredited delegate votes — 60 per cent — defeating the incumbent and three other contenders.\n\nThe Primary Election Committee was witnessed by INEC, Police, DSS and NSCDC observers. The result reaffirmed his grassroots support and positioned him as the APC candidate for the main election.\n\nThe full result was reported by FestacOnline under the headline “Ola Western wins APC Amuwo House of Assembly primaries”.',
		source: 'campaign_hq',
		pdf_url: null
	},
	{
		id: 'press-truth-room-opens',
		created_at: '2026-11-01T08:00:00Z',
		published_at: '2026-11-01T08:00:00Z',
		slug: 'ola-western-opens-truth-room',
		title: 'Ola Western campaign opens public Truth Room',
		summary:
			'The campaign media desk has launched a permanent fact-checking desk at olawestern.ng/truth-room where every claim circulating in FESTAC Town and Mile 2 is answered with evidence.',
		body: 'Amuwo-Odofin Constituency I deserves politics that can be checked. Today the Ola Western campaign opened the Truth Room — a public ledger of verified facts and debunked claims, each ruling linked to the documents behind it.\n\nRumours and questions can be submitted through the Ask Ola channel; the media team at 32 Road HQ reviews every submission and publishes a ruling when an issue is significant enough for the whole constituency.\n\nNothing is published in the Truth Room without executive approval and evidence on file.',
		source: 'campaign_hq',
		pdf_url: null
	},
	{
		id: 'press-service-record-published',
		created_at: '2026-11-01T08:05:00Z',
		published_at: '2026-11-01T08:05:00Z',
		slug: 'service-record-before-office-published',
		title: 'Pre-office service record published ahead of the general election',
		summary:
			'A verifiable ledger of Ola Western’s community work in Festac I–III and Mile 2 — before he ever sought elective office — is now published at olawestern.ng/impact.',
		body: 'Before the ballot, there is the record. The campaign has published a dated ledger of service: clean-water boreholes committed for six wards (2018); the 7th Avenue drainage desilting (2018); the Christmas Food Festival that fed 500 homes (2021); community viewing centres for the Qatar 2022 World Cup; the NIWA jetty negotiation that put Mile 2 youths at the table (2022); state approval for six FESTAC roads including the rebuild of 1st Avenue (2023); the second Food Fest that reached more than 700 households — over 1,000 residents according to The Sun (2024); and a “Take Back FESTAC” Community Builders Award (December 2025).\n\nEvery entry on the ledger links to the report behind it. Ward and constituency are named so any resident can verify the work where it happened.\n\nAdditional entries with documentation can be submitted to the media desk at 32 Road HQ.',
		source: 'campaign_hq',
		pdf_url: null
	},
	{
		id: 'press-volunteer-registration',
		created_at: '2026-11-01T08:10:00Z',
		published_at: '2026-11-01T08:10:00Z',
		slug: 'volunteer-registration-opens-constituency-wide',
		title: 'Volunteer registration opens across all four wards',
		summary:
			'Residents of Festac I, Festac II, Festac III and Mile 2 can now register as volunteers or polling-unit supporters directly on olawestern.ng/join.',
		body: 'The Ola Western campaign is grassroots by design, and the movement now has the tools to organise like one. Volunteer registration is open constituency-wide: supporters choose their ward, their street and their polling unit code, and flag the issue they care about most — roads, drainage, market and SME support, community security, youth and sports, or street lighting.\n\nEvery registration is processed under the Nigeria Data Protection Act (2023) with explicit consent, and ward captains follow up directly on WhatsApp.',
		source: 'campaign_hq',
		pdf_url: null
	}
];

/**
 * Every published report behind the record. This is the single source of truth
 * for the public Reference Library and for the Truth Desk's evidence grounding —
 * a fresh deployment must show the same library the campaign has on file.
 */
export const NEW_REFERENCE_LINKS: ReferenceLink[] = [
	{
		id: 'ref-2026-the-nation-consensus',
		year: 2026,
		date: 'April 2026',
		outlet: 'The Nation',
		headline: 'Amuwo Odofin APC showcases Ola Western, MO as consensus candidates',
		url: 'https://thenationonlineng.net/amuwo-odofin-apc-showcases-ola-western-mo-as-consensus-candidates/'
	},
	{
		id: 'ref-2026-vanguard-stakeholders',
		year: 2026,
		date: 'April 2026',
		outlet: 'Vanguard',
		headline: "2027: APC stakeholders back Olanrewaju, Ola Western's bids in Amuwo-Odofin",
		url: 'https://www.vanguardngr.com/2026/04/2027-apc-stakeholders-back-olanrewaju-olawestern-bids-in-amuwo-ofin/'
	},
	{
		id: 'ref-2022-vanguard-primary-alarm',
		year: 2022,
		date: 'May 2022',
		outlet: 'Vanguard',
		headline: 'Amuwo-Odofin APC primaries: Group raises alarm over ploy to tamper with result',
		url: 'https://www.vanguardngr.com/2022/05/amuwo-odofin-apc-primaries-group-raises-alarm-over-ploy-to-tamper-with-result/'
	},
	{
		id: 'ref-2026-festaconline-16',
		year: 2026,
		date: 'May 2026',
		outlet: 'FestacOnline',
		headline: 'Ola Folorunsho emerges APC flagbearer for Amuwo Constituency I with 3,000+ votes',
		url: 'https://festaconline.com.ng/ola-folorunsho-emerges-apc-flagbearer-for-amuwo-constituency-i-with-3k-votes/'
	},
	{
		id: 'ref-2026-p-m-express-17',
		year: 2026,
		date: 'May 2026',
		outlet: 'P.M. Express',
		headline: 'Ola Western sweeps APC Amuwo-Odofin Constituency I House of Assembly primaries',
		url: 'https://pmexpressng.com/ola-western-sweeps-apc-amuwo-odofin-constituency-i-house-of-assembly-primaries/'
	},
	{
		id: 'ref-2026-p-m-express-18',
		year: 2026,
		date: 'May 2026',
		outlet: 'P.M. Express',
		headline: 'APC Amuwo-Odofin rallies behind Ola Western, unites for 2027 assembly poll',
		url: 'https://pmexpressng.com/apc-amuwo-odofin-rallies-behind-ola-western-unites-for-2027-assembly-poll/'
	},
	{
		id: 'ref-2026-festaconline-19',
		year: 2026,
		date: 'May 2026',
		outlet: 'FestacOnline',
		headline: 'APC unveils consensus candidates for Assembly and House of Representatives in Amuwo-Odofin',
		url: 'https://festaconline.com.ng/apc-unveils-consensus-candidates-for-assembly-house-of-representatives-in-amuwo-odofin/'
	},
	{
		id: 'ref-2026-arbr-news-20',
		year: 2026,
		date: 'August 2026',
		outlet: 'ARBR News',
		headline: 'Interactive candidate session — Ola Western Folorunsho Olaitan, accountability forum',
		url: 'https://arbr.com.ng/news/people/ola-western-folorunsho-olaitan/'
	},
	{
		id: 'ref-2026-cowlso-21',
		year: 2026,
		date: 'October 2026',
		outlet: 'Festac Weekly (Facebook)',
		headline: 'Ola Western sponsors seven Amuwo-Odofin women to COWLSO',
		url: 'https://www.facebook.com/100063294486613/photos/1065193355600471/'
	},
	{
		id: 'ref-link-tvc-primary-2026',
		year: 2026,
		date: 'May 2026',
		outlet: 'TVC News Nigeria',
		headline: 'Ola Western wins APC primary in Amuwo-Odofin',
		url: 'https://www.youtube.com/watch?v=r3ouz4Jzgwo'
	},
	{
		id: 'ref-2025-lagos-panorama-12',
		year: 2025,
		date: 'Mid 2025',
		outlet: 'Lagos Panorama',
		headline: 'Hamzat, Sanusi lead Amuwo-Odofin residents in monthly environmental sanitation exercise',
		url: 'https://lagospanorama.com/hamzat-sanusi-lead-amuwo-odofin-residents-in-monthly-environmental-sanitation-exercise/'
	},
	{
		id: 'ref-2025-p-m-express-13',
		year: 2025,
		date: '2025',
		outlet: 'P.M. Express',
		headline: 'Ola Western — Sterling Youth of All Times (NIWA jetty negotiation for Mile 2 youths)',
		url: 'https://pmexpressng.com/ola-western-sterling-youth-of-all-times/'
	},
	{
		id: 'ref-2025-vanguard-14',
		year: 2025,
		date: 'December 2025',
		outlet: 'Vanguard',
		headline: 'Take Back FESTAC celebrates community builders',
		url: 'https://www.vanguardngr.com/2025/12/take-back-festac-celebrates-community-builders/'
	},
	{
		id: 'ref-2025-the-guardian-15',
		year: 2025,
		date: 'December 2025',
		outlet: 'The Guardian',
		headline: 'Lawmaker group honour Festac residents, pledge community revival',
		url: 'https://guardian.ng/news/nigeria/metro/lawmaker-group-honour-festac-residents-pledge-community-revival/'
	},
	{
		id: 'ref-2024-p-m-express-8',
		year: 2024,
		date: 'March 2024',
		outlet: 'P.M. Express',
		headline: 'Hon. Ola Western doles out palliatives worth millions of naira to Amuwo-Odofin residents',
		url: 'https://pmexpressng.com/hon-ola-western-doles-out-palliatives-worth-millions-of-naira-to-amuwo-odofin-lga-residents/'
	},
	{
		id: 'ref-2024-the-sun-9',
		year: 2024,
		date: 'March 2024',
		outlet: 'The Sun',
		headline: 'Over 1,000 persons benefit from Ola Western Food Festival in Festac',
		url: 'https://thesun.ng/over-1000-persons-benefit-from-ola-western-food-festival-in-festac/'
	},
	{
		id: 'ref-2024-vanguard-10',
		year: 2024,
		date: 'March 2024',
		outlet: 'Vanguard',
		headline: 'Easter: APC stalwart distributes food items in Amuwo-Odofin',
		url: 'https://www.vanguardngr.com/2024/03/easter-apc-stalwart-distributes-food-items-in-amuwo-odofin/'
	},
	{
		id: 'ref-2024-nairaland-11',
		year: 2024,
		date: 'March 2024',
		outlet: 'Nairaland',
		headline: 'Community reaction: Over 700 households benefit from Hon. Ola Western palliatives',
		url: 'https://www.nairaland.com/8049217/over-700-households-benefit-hon'
	},
	{
		id: 'ref-2024-festaconline-12',
		year: 2024,
		date: 'April 2024',
		outlet: 'FestacOnline',
		headline: 'Amuwo’s Councilman Distributes Food Items — 750 vulnerable residents',
		url: 'https://festaconline.com.ng/amuwos-councilman-distributes-food-items/'
	},
	{
		id: 'ref-link-tvc-food-2024',
		year: 2024,
		date: 'March 2024',
		outlet: 'TVC News Nigeria',
		headline: 'FESTAC residents receive rice, chicken and cash gifts donated by Folorunsho Ola',
		url: 'https://www.youtube.com/watch?v=1iZpEo4LojQ'
	},
	{
		id: 'ref-2023-festaconline-5',
		year: 2023,
		date: 'January 2023',
		outlet: 'FestacOnline',
		headline: '#AmuwoDecides23 — Meet the Candidates: Hon. Folorunsho (1st Avenue road advocacy)',
		url: 'https://festaconline.com.ng/amuwodecides23-watch-3-mins-with-hon-folorunso/'
	},
	{
		id: 'ref-2023-vanguard-6',
		year: 2023,
		date: 'February 2023',
		outlet: 'Vanguard',
		headline: '2023 LAHAA Connect canvasses votes for Tinubu, Sanwo-Olu and others in Lagos',
		url: 'https://www.vanguardngr.com/2023/02/2023-lahaa-connect-canvasses-votes-for-tinubu-sanwo-olu-others-in-lagos/'
	},
	{
		id: 'ref-2023-the-nation-7',
		year: 2023,
		date: 'February 2023',
		outlet: 'The Nation',
		headline: 'Aspirants in markets to sell Tinubu, Sanwo-Olu — Amuwo-Odofin campaign walks',
		url: 'https://thenationonlineng.net/aspirants-in-markets-to-sell-tinubu-sanwo-olu/'
	},
	{
		id: 'ref-2022-festaconline-3',
		year: 2022,
		date: 'April 2022',
		outlet: 'FestacOnline',
		headline: 'Ola Western clinches form for House of Assembly, Amuwo',
		url: 'https://festaconline.com.ng/ola-western-form-for-house-of-assembly/'
	},
	{
		id: 'ref-2022-festaconline-4',
		year: 2022,
		date: 'May 2022',
		outlet: 'FestacOnline',
		headline: 'Ola Western wins APC Amuwo House of Assembly primaries (12 of 20 delegates)',
		url: 'https://festaconline.com.ng/ola-western-wins-amuwo-house-of-assembly-primaries/'
	},
	{
		id: 'ref-link-food-fest-2021',
		year: 2021,
		date: 'December 2021',
		outlet: 'NaomiSophysBlog (video)',
		headline: 'Ola Western Food Festival — feeding 500 homes for Christmas',
		url: 'https://www.facebook.com/NaomiSophypage/videos/hon-folorunsho-ola-western-touched-lives-and-impacted-humanity-into-the-lives-of/1251098185393772/'
	},
	{
		id: 'ref-2018-festaconline-0',
		year: 2018,
		date: 'March 2018',
		outlet: 'FestacOnline',
		headline: 'Good news: 6 wards to get boreholes in Amuwo-Odofin',
		url: 'https://festaconline.com.ng/good-news-6-wardsto-get-boreholes-amuwoodofin/'
	},
	{
		id: 'ref-2018-the-nation-1',
		year: 2018,
		date: 'March 2018',
		outlet: 'The Nation',
		headline: 'Council partners investor on CSR projects in Amuwo-Odofin',
		url: 'https://thenationonlineng.net/council-partners-investor-csr/'
	},
	{
		id: 'ref-2018-festaconline-2',
		year: 2018,
		date: 'March 2018',
		outlet: 'FestacOnline',
		headline: '7th Avenue, Festac to get support on drainage clearing',
		url: 'https://festaconline.com.ng/7th-avenue-festac-to-get-support-on-drainage-clearing/'
	}
];