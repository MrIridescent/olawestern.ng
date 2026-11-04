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
		label: 'Primary & Secondary Education',
		value: "St. Mary's Primary School; St. Lawrence Grammar School.",
		confirmed: true
	},
	{
		label: 'Tertiary Education',
		value:
			'Osun State Polytechnic (HND, Business Administration), Lagos State University (B.Sc., Accounting), Yaba College of Technology (HND, Civil Engineering), CJ College (Diploma, Mental Health and Addiction)',
		confirmed: true
	},
	{
		label: 'Corporate Experience',
		value:
			'CEO of Western Group of Companies (Western Logistics, Western Construction, Western Entertainment)',
		confirmed: true,
		note: 'A successful entrepreneur with a strong background in business and engineering.'
	},
	{
		label: 'Political Experience',
		value:
			'Member, Lagos State House of Assembly (2015-2019); Chairman, House Committee on Waterfront Infrastructure Development.',
		confirmed: true
	},
	{
		label: 'Awards & Honours',
		value:
			'ECOWAS Youth Parliament Role Model, Symbol of Hope, Grand Commander of African Youths, Amuwo-Odofin Man of the Year (2017, 2018).',
		confirmed: true
	}
];

export const NEW_FACT_CHECKS: FactCheck[] = [
	{
		claim: 'Provided six boreholes for potable water.',
		verification_source_url:
			'https://festaconline.com.ng/good-news-6-wardsto-get-boreholes-amuwoodofin/',
		status: 'verified'
	},
	{
		claim: 'Donated two 500KVA transformers to the community.',
		verification_source_url:
			'https://www.amuwolefinro.com/2018/04/hon-folorunsho-ola-western-donates-2.html',
		status: 'verified'
	},
	{
		claim: 'Launched a free school bus shuttle for students.',
		verification_source_url:
			'https://www.vanguardngr.com/2017/09/lawmaker-flags-off-free-school-bus-shuttle-constituents/',
		status: 'verified'
	},
	{
		claim: 'Distributed COVID-19 palliatives to constituents.',
		verification_source_url:
			'https://www.independent.ng/covid-19-lawmaker-distributes-cash-food-items-to-constituents/',
		status: 'verified'
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
		title: 'Verification: Borehole Projects',
		url: 'https://festaconline.com.ng/good-news-6-wardsto-get-boreholes-amuwoodofin/'
	},
	{
		title: 'Verification: Transformer Donations',
		url: 'https://www.amuwolefinro.com/2018/04/hon-folorunsho-ola-western-donates-2.html'
	},
	{
		title: 'Verification: Free School Bus Initiative',
		url: 'https://www.vanguardngr.com/2017/09/lawmaker-flags-off-free-school-bus-shuttle-constituents/'
	},
	{
		title: 'Verification: COVID-19 Relief Efforts',
		url: 'https://www.independent.ng/covid-19-lawmaker-distributes-cash-food-items-to-constituents/'
	}
];