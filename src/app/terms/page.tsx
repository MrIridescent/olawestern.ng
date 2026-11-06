import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'Terms governing the use of the official OlaWestern campaign website, media assets and constituent tools.',
};

const SECTIONS = [
  {
    title: 'Campaign information',
    body: 'This website is the official online headquarters of the Ola Western Campaign Organization. Content is published by the campaign media team for information, organising and constituent service. It is not an official publication of the Lagos State House of Assembly or the Independent National Electoral Commission (INEC).',
  },
  {
    title: 'Media assets and downloads',
    body: 'Logos, photographs, graphics and press materials in the Media Kit are cleared for editorial and supporter use in connection with this campaign. Do not alter the candidate’s likeness, invent quotations, or imply endorsement by an outlet, agency or person who has not endorsed the campaign. Press photography remains credited to its originating outlet.',
  },
  {
    title: 'Constituent submissions',
    body: 'Information you submit through the Help Desk, volunteer form or WhatsApp channels is handled under our Privacy Policy and the Nigeria Data Protection Act 2023. Please submit accurate contact details so your ward team can respond. Do not submit another person’s private information without their consent.',
  },
  {
    title: 'Donations and contributions',
    body: 'Any contribution channel published here is operated by or on behalf of the Ola Western Campaign Committee. Contributions are voluntary and are not tax-deductible unless expressly stated. The campaign does not request cash transfers through unofficial accounts or personal messages.',
  },
  {
    title: 'Accuracy and corrections',
    body: 'We work from published reporting, campaign records and documents supplied by the candidate. If you believe a claim, photograph or attribution is wrong, write to us with the source and we will review it. Corrections are published on the page concerned.',
  },
  {
    title: 'Limitation of liability',
    body: 'The site is provided on an “as is” basis. To the extent permitted by law, the campaign is not liable for interruptions, third-party links, or losses arising from reliance on information that has since changed. Election dates, venues and requirements should always be confirmed with INEC.',
  },
];

export default function TermsPage() {
  return (
    <>
      <section className="hero-gradient">
        <div className="container-site py-16 text-center">
          <p className="section-kicker">Site Governance</p>
          <h1 className="hero-title">Terms of Use</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            The rules that govern this website, its media downloads and the constituent tools it hosts.
          </p>
        </div>
      </section>

      <section className="container-site py-14">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-electric-dark">
            Last updated · November 2026
          </p>
          <div className="mt-6 space-y-6">
            {SECTIONS.map((section, i) => (
              <article key={section.title} className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                <h2 className="flex items-baseline gap-3 font-display text-lg font-bold text-brand-navy">
                  <span className="font-display text-sm font-extrabold text-brand-electric">{String(i + 1).padStart(2, '0')}</span>
                  {section.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-brand-gray">{section.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-brand-electric/20 bg-brand-electric-light p-6">
            <p className="font-display text-lg font-bold text-brand-navy">Questions about these terms?</p>
            <p className="mt-2 text-sm leading-relaxed text-brand-gray">
              Write to <a className="font-semibold text-brand-electric-dark underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>{' '}
              or visit the campaign HQ at {SITE.hq}. For privacy requests, see our{' '}
              <Link className="font-semibold text-brand-electric-dark underline" href="/privacy">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
