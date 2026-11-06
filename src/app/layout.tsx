import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileActionBar from '@/components/layout/MobileActionBar';
import ScrollProgress from '@/components/hq/ScrollProgress';
import LiveDesk from '@/components/livedesk/LiveDesk';
import { SITE } from '@/lib/content';
import './globals.css';
import '@/styles/embla.css';

import { Inter, Cormorant_Garamond } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '700'] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.siteUrl),
  title: {
    default: 'Hon. Engr. Folorunsho Olaitan Segun (Ola Western) | Official Portfolio',
    template: '%s | Hon. Engr. Folorunsho Olaitan Segun (Ola Western)',
  },
  description: 'Official website of Hon. Engr. Folorunsho Olaitan Segun (Ola Western) — CEO of Western Concrete, APC Flagbearer for Lagos State House of Assembly (Amuwo-Odofin Constituency I).',
  keywords: [
    'Ola Western',
    'Folorunsho Olaitan Segun',
    'Amuwo-Odofin Constituency I',
    'APC Lagos',
    'FESTAC Town',
    'Mile 2',
    '23 Road',
    'Ola Western accomplishments',
    'Ola Western APC primary',
    'Folorunsho Olaitan manifesto',
    'Ola Western FESTAC Town',
  ],
  openGraph: {
    title: 'Hon. Engr. Folorunsho Olaitan Segun (Ola Western) | Official Portfolio',
    description: 'Official website of Hon. Engr. Folorunsho Olaitan Segun (Ola Western) — CEO of Western Concrete, APC Flagbearer for Lagos State House of Assembly (Amuwo-Odofin Constituency I).',
    url: SITE.siteUrl,
    siteName: 'Hon. Engr. Folorunsho Olaitan Segun (Ola Western)',
    type: 'website',
    locale: 'en_NG',
    images: [
      {
        url: '/og.png',
        width: 1181,
        height: 675,
        alt: 'Ola Western — ... towards responsible representation · APC, Amuwo-Odofin Constituency I',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hon. Engr. Folorunsho Olaitan Segun (Ola Western) | Official Portfolio',
    description: 'Official website of Hon. Engr. Folorunsho Olaitan Segun (Ola Western) — CEO of Western Concrete, APC Flagbearer for Lagos State House of Assembly (Amuwo-Odofin Constituency I).',
    images: ['/og.png'],
  },
  // Favicon: src/app/icon.svg is auto-detected by the App Router.
  robots: { index: true, follow: true },
  other: {
    'ai-robots': 'noai, noimageai',
  },
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': ['Person', 'Politician'],
  name: SITE.candidateName,
  alternateName: SITE.brandName,
  jobTitle: 'Candidate, Lagos State House of Assembly',
  worksFor: { '@type': 'Organization', name: 'Western Concrete' },
  sameAs: [
    'https://x.com/olawestern23',
    'https://www.instagram.com/olawestern23',
    'https://pmexpressng.com/ola-western-sweeps-apc-amuwo-odofin-constituency-i-house-of-assembly-primaries/',
    'https://thenationonlineng.net/council-partners-investor-csr/',
    'https://www.vanguardngr.com/2017/09/lawmaker-flags-off-free-school-bus-shuttle-constituents/',
    'https://festaconline.com.ng/ola-folorunsho-emerges-apc-flagbearer-for-amuwo-constituency-i-with-3k-votes/',
    'https://arbr.com.ng/news/people/ola-western-folorunsho-olaitan/'
  ],
  description:
    'Certified civil engineer and Chief Executive Officer of Western Concrete. APC candidate for Amuwo-Odofin Constituency I (FESTAC Town & Mile 2), Lagos State, Nigeria — living and working inside the constituency he seeks to represent.',
  url: SITE.siteUrl,
  email: SITE.email,
  address: { '@type': 'PostalAddress', streetAddress: SITE.hq, addressLocality: 'Amuwo-Odofin', addressRegion: 'Lagos', addressCountry: 'NG' },
  knowsLanguage: ['en', 'pcm', 'yo'],
  campaign: {
    '@type': 'Campaign',
    name: `${SITE.brandName} Campaign Organization`,
    party: SITE.party,
    electionScope: SITE.constituency,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      {/* Grammarly and similar extensions inject attributes into <body> before
          React hydrates. Suppress the false-positive mismatch on this element
          only; every child still hydrates normally. */}
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          // Static, developer-authored structured data — safe to inline.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <Header />
        <ScrollProgress />
        <main id="main-content">{children}</main>
        <Footer />
        {/* Rendered last: its spacer sits below the footer so the fixed bar
            never covers the footer's links on phones. */}
        <MobileActionBar />
        {/* The campaign desk's editing surface. Mounts nothing at all unless the
            session probe says an admin is looking, so a voter's page is byte-for-byte
            the site they have always been served. */}
        <LiveDesk />
      </body>
    </html>
  );
}