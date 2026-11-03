import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileActionBar from '@/components/layout/MobileActionBar';
import LiveDesk from '@/components/livedesk/LiveDesk';
import { SITE } from '@/lib/content';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.siteUrl),
  title: {
    default: `${SITE.brandName} — ${SITE.slogan}`,
    template: `%s | ${SITE.brandName}`,
  },
  description:
    'Official campaign website of Hon. Folorunsho Olaitan Segun (Ola Western), APC candidate for the Lagos State House of Assembly, Amuwo-Odofin Constituency I — FESTAC Town and Mile 2.',
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
    title: `${SITE.brandName} — ${SITE.slogan}`,
    description: 'The accessible grassroots champion and tested unifier for Amuwo-Odofin Constituency I.',
    url: SITE.siteUrl,
    siteName: SITE.brandName,
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
    title: `${SITE.brandName} — ${SITE.slogan}`,
    description: 'The accessible grassroots champion and tested unifier for Amuwo-Odofin Constituency I.',
    images: ['/og.png'],
  },
  // Favicon: src/app/icon.svg is auto-detected by the App Router.
  robots: { index: true, follow: true },
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: SITE.candidateName,
  alternateName: SITE.brandName,
  jobTitle: 'Candidate, Lagos State House of Assembly',
  description:
    'Certified civil engineer and Chief Executive Officer of Western Concrete. APC candidate for Amuwo-Odofin Constituency I (FESTAC Town & Mile 2), Lagos State, Nigeria — living and working inside the constituency he seeks to represent.',
  url: SITE.siteUrl,
  email: SITE.email,
  worksFor: { '@type': 'Organization', name: 'Western Concrete', address: SITE.hq },
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
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          // Static, developer-authored structured data — safe to inline.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <Header />
        <main>{children}</main>
        <Footer />
        {/* Rendered last: its spacer sits below the footer so the fixed bar
            never covers the footer's links on phones. */}
        <MobileActionBar whatsappLink={SITE.whatsappLink} />
        {/* The campaign desk's editing surface. Mounts nothing at all unless the
            session probe says an admin is looking, so a voter's page is byte-for-byte
            the site they have always been served. */}
        <LiveDesk />
      </body>
    </html>
  );
}
