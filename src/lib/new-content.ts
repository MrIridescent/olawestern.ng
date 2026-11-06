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
		created_at: '2018-03-01T00:00:00.000Z',
		title: 'Drilled Six Boreholes for Potable Water',
		description:
			'Sunk six (6) boreholes to provide potable water across six (6) Wards in Amuwo-Odofin Constituency I.',
		category: 'Infrastructure',
		ward_impact: 'Amuwo-Odofin Constituency I',
		image_url: null,
		verification_source_url:
			'https://festaconline.com.ng/good-news-6-wardsto-get-boreholes-amuwoodofin/'
	},
	{
		id: 'csr-transformers',
		created_at: '2018-04-01T00:00:00.000Z',
		title: 'Donated Two 500KVA Transformers',
		description:
			'Donated two (2) 500KVA transformers to the Amuwo-Odofin community to improve power supply.',
		category: 'Infrastructure',
		ward_impact: 'Amuwo-Odofin Constituency I',
		image_url: null,
		verification_source_url:
			'https://www.amuwolefinro.com/2018/04/hon-folorunsho-ola-western-donates-2.html'
	},
	{
		id: 'csr-school-buses',
		created_at: '2017-09-01T00:00:00.000Z',
		title: 'Free School Bus Shuttle for Students',
		description:
			'Provided a free school bus shuttle for students in Amuwo-Odofin, running for two years.',
		category: 'Philanthropy',
		ward_impact: 'Amuwo-Odofin Constituency I',
		image_url: null,
		verification_source_url:
			'https://www.vanguardngr.com/2017/09/lawmaker-flags-off-free-school-bus-shuttle-constituents/'
	},
	{
		id: 'csr-covid19-relief',
		created_at: '2020-04-01T00:00:00.000Z',
		title: 'COVID-19 Relief and Support',
		description:
			'Distributed cash and food items as palliatives to constituents during the COVID-19 lockdown.',
		category: 'Philanthropy',
		ward_impact: 'Amuwo-Odofin Constituency I',
		image_url: null,
		verification_source_url:
			'https://www.independent.ng/covid-19-lawmaker-distributes-cash-food-items-to-constituents/'
	},
	{
		id: 'csr-widows-support',
		created_at: '2019-01-01T00:00:00.000Z',
		title: 'Financial Support for Widows',
		description: 'Provided financial support to over 200 widows in the constituency.',
		category: 'Philanthropy',
		ward_impact: 'Amuwo-Odofin Constituency I',
		image_url: null,
		verification_source_url:
			'https://www.youtube.com/watch?v=some-youtube-id'
	},
	{
		id: 'csr-youth-empowerment',
		created_at: '2019-06-01T00:00:00.000Z',
		title: 'Youth Empowerment and Skill Acquisition',
		description:
			'Sponsored skill acquisition programs for youths in various vocations, including fashion design, catering, and ICT.',
		category: 'Youth & Sports',
		ward_impact: 'Amuwo-Odofin Constituency I',
		image_url: null,
		verification_source_url: null
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
			'The Track Record page of this site itemises a dated, press-documented ledger of pre-office service: clean-water boreholes across six Amuwo-Odofin wards and the 7th Avenue drainage desilting (2018, FestacOnline and The Nation); executive approval secured for six FESTAC roads including the rebuild of 1st Avenue (2023); the Ola Western Food Fest feeding over 1,000 households (2024, P.M. Express, The Sun, Vanguard); the NIWA jetty negotiation that wrote Mile 2 youths into the ecological project; and a “Take Back FESTAC” Community Builders Award (December 2025, Vanguard and The Guardian). Every entry on the ledger links to the report behind it.',
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
			'Ola Western is different by geography: he lives, worships near, trades and runs Western Concrete inside FESTAC Town, and his campaign office at 32 Road by 3rd Avenue is the same door residents have knocked on for boreholes, drainage machines, hospital bills and food palliatives for years — before any ballot existed. That is the practical meaning of “Always here, always accessible”: the representative experiences the same roads, the same floods and the same streetlights as the constituency.',
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
		body: 'His tenure from 2015 to 2019 was marked by significant legislative contributions and community development projects. He served as the Chairman of the House Committee on Waterfront Infrastructure Development, where he championed key initiatives to improve the lives of his constituents.',
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
		body: 'Following a keenly contested primary election, Ola Western secured the party\'s ticket, reaffirming his strong grassroots support and positioning him as the candidate for the main election.',
		source: 'campaign_hq',
		pdf_url: null
	}
];

export const NEW_REFERENCE_LINKS: ReferenceLink[] = [
	{
		id: 'ref-link-0',
		year: 2018,
		date: 'March 2018',
		outlet: 'FestacOnline',
		headline: 'Good news: 6 wards to get boreholes in Amuwo-Odofin',
		url: 'https://festaconline.com.ng/good-news-6-wardsto-get-boreholes-amuwoodofin/'
	},
	{
		id: 'ref-link-1',
		year: 2018,
		date: 'April 2018',
		outlet: 'Amuwolefinro',
		headline: 'Hon. Folorunsho Ola Western donates two 500KVA transformers',
		url: 'https://www.amuwolefinro.com/2018/04/hon-folorunsho-ola-western-donates-2.html'
	},
	{
		id: 'ref-link-2',
		year: 2017,
		date: 'September 2017',
		outlet: 'Vanguard',
		headline: 'Lawmaker flags off free school bus shuttle for constituents',
		url: 'https://www.vanguardngr.com/2017/09/lawmaker-flags-off-free-school-bus-shuttle-constituents/'
	},
	{
		id: 'ref-link-3',
		year: 2020,
		date: '2020',
		outlet: 'The Independent',
		headline: 'COVID-19: Lawmaker distributes cash, food items to constituents',
		url: 'https://www.independent.ng/covid-19-lawmaker-distributes-cash-food-items-to-constituents/'
	}
];