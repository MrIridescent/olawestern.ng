import Link from 'next/link';
import SocialLinksRow from '@/components/ui/SocialLinks';
import { SITE } from '@/lib/content';
import { listSocials } from '@/lib/store';

export default async function Footer() {
  const socials = await listSocials();
  return (
    <footer className="mt-20 bg-brand-dark text-white">
      <div className="container-site grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-xl font-bold">Hon. Folorunsho Olaitan Segun</p>
          <p className="mt-1 text-sm text-gray-400">
            {SITE.party} candidate for the Lagos State House of Assembly, {SITE.constituency}.
          </p>
          <p className="mt-4 text-sm italic text-brand-green-light">&ldquo;... towards responsible representation&rdquo;</p>
          <p className="mt-4 text-sm text-gray-400">
            Campaign HQ: {SITE.hq}
            <br />
            Desk: <a className="underline hover:text-white" href="tel:+2348034005708">{SITE.campaignDeskPhone}</a>
            {' · '}Email: <a className="underline hover:text-white" href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </p>
          <div className="mt-5">
            <SocialLinksRow socials={socials} dark />
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Explore</p>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-brand-blue" href="/about">About Ola</Link></li>
            <li><Link className="hover:text-brand-blue" href="/impact">Track Record &amp; Impact</Link></li>
            <li><Link className="hover:text-brand-blue" href="/blueprint">Legislative Blueprint</Link></li>
            <li><Link className="hover:text-brand-blue" href="/help-desk">Constituent Help Desk</Link></li>
            <li><Link className="hover:text-brand-blue" href="/truth-room">Truth Room</Link></li>
            <li><Link className="hover:text-brand-blue" href="/news">Newsroom</Link></li>
            <li><Link className="hover:text-brand-blue" href="/gallery">Gallery</Link></li>
            <li><Link className="hover:text-brand-blue" href="/contact">Contact HQ</Link></li>
            <li><Link className="hover:text-brand-blue" href="/join">Volunteer / Join</Link></li>
            <li><Link className="hover:text-brand-blue" href="/privacy">Privacy Policy (NDPA)</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Get Involved</p>
          <a href={SITE.whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-blue w-full">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M17.5 14.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07a8.2 8.2 0 0 1-2.4-1.48 9.05 9.05 0 0 1-1.66-2.07c-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2-1.41.25-.7.25-1.3.18-1.42-.07-.12-.27-.2-.57-.35z"/><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.46-4.4-1.3l-.32-.2-2.96.77.79-2.88-.2-.33A8.2 8.2 0 1 1 12 20.2z"/></svg>
            AI Campaign Assistant
          </a>
          <p className="mt-3 text-xs text-gray-400">
            Voter data captured through this site is handled under the Nigeria Data Protection Act (NDPA) 2023.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Ola Western Campaign Organization · {SITE.constituency} · All rights reserved.
        <br />
        Developed by{' '}
        <a
          href="https://linktr.ee/i2sltd.tech"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand-green-light underline transition-colors hover:text-white"
        >
          @i2sltd.tech
        </a>
      </div>
    </footer>
  );
}
