import Link from 'next/link';
import SocialLinksRow from '@/components/ui/SocialLinks';
import { SITE } from '@/lib/content';
import { listSocials } from '@/lib/store';

export default async function Footer() {
  const socials = await listSocials();
  const websiteLabel = SITE.siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <footer className="bg-brand-navy-dark text-white">
      <div className="h-1 w-full bg-gradient-to-r from-brand-electric via-brand-electric-bright to-brand-electric" aria-hidden />

      <div className="container-site grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="font-display text-2xl font-extrabold tracking-tight">
            <span className="text-white">Ola</span><span className="text-brand-electric">Western</span>
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-white/50">
            Lagos State House of Assembly · Amuwo-Odofin Constituency I
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/65">
            {SITE.candidateName} — {SITE.party} flagbearer. A civil engineer, employer and neighbour
            standing for effective, accountable representation across Festac I–III and Mile 2.
          </p>
          <p className="mt-4 text-sm font-semibold italic text-brand-electric-bright">
            &ldquo;{SITE.slogan.replace(/^\.\.\.\s*/, '')}&rdquo;
          </p>
          <div className="mt-5">
            <SocialLinksRow socials={socials} dark />
          </div>
        </div>

        <div>
          <p className="mb-4 border-l-2 border-brand-electric pl-3 text-xs font-bold uppercase tracking-[0.18em] text-brand-electric-bright">
            Explore
          </p>
          <ul className="space-y-2.5 text-sm text-white/65">
            <li><Link className="transition-colors hover:text-white" href="/hq">Digital Campaign HQ</Link></li>
            <li><Link className="transition-colors hover:text-white" href="/about">About Ola Western</Link></li>
            <li><Link className="transition-colors hover:text-white" href="/impact">Track Record &amp; Impact</Link></li>
            <li><Link className="transition-colors hover:text-white" href="/blueprint">Legislative Agenda</Link></li>
            <li><Link className="transition-colors hover:text-white" href="/#ward-impact">Ward Projects</Link></li>
            <li><Link className="transition-colors hover:text-white" href="/help-desk">Constituent Help Desk</Link></li>
            <li><Link className="transition-colors hover:text-white" href="/truth-room">Truth Room</Link></li>
            <li><Link className="transition-colors hover:text-white" href="/news">Newsroom</Link></li>
            <li><Link className="transition-colors hover:text-white" href="/media-kit">Media Kit</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-4 border-l-2 border-brand-electric pl-3 text-xs font-bold uppercase tracking-[0.18em] text-brand-electric-bright">
            Campaign office
          </p>
          <address className="space-y-3 text-sm not-italic text-white/65">
            <p>{SITE.hq}<br />Amuwo-Odofin, Lagos State, Nigeria</p>
            <p>
              <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-white/65">Desk &amp; WhatsApp</span>
              <a className="transition-colors hover:text-white" href={SITE.whatsappLink} target="_blank" rel="noopener noreferrer">
                {SITE.campaignDeskPhone}
              </a>
            </p>
            <p>
              <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-white/65">Email</span>
              <a className="break-all transition-colors hover:text-white" href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </p>
            <p>
              <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-white/65">Website</span>
              <a className="transition-colors hover:text-white" href={SITE.siteUrl}>{websiteLabel}</a>
            </p>
          </address>
          <Link href="/join" className="btn mt-5 w-full rounded-full bg-brand-electric text-brand-navy shadow-[0_4px_14px_rgba(255,87,34,0.35)] hover:bg-brand-electric-dark hover:text-white">
            Join the Movement <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {/* Electoral compliance — the mandatory disclosure, kept visible rather than buried. */}
      <div className="container-site">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-center text-[11px] leading-relaxed text-white/70">
          <span className="mb-1 block font-bold uppercase tracking-[0.18em] text-brand-emerald">Electoral disclosure</span>
          Paid for by the Ola Western Campaign Committee. Approved by Folorunsho Olaitan Segun
          (&ldquo;Ola Western&rdquo;) for Lagos State House of Assembly, Amuwo-Odofin Constituency I.
          This website is maintained by the campaign&rsquo;s media and constituency teams.
        </div>
      </div>

      <div className="container-site border-t border-white/10 py-5">
        <div className="flex flex-col items-center justify-between gap-4 text-center text-xs text-white/70 sm:flex-row sm:items-start sm:text-left">
          <div className="space-y-1.5">
            <p>© {new Date().getFullYear()} Ola Western Campaign Organization · All rights reserved.</p>
            <p className="text-[11px]">
              Developer by{' '}
              <a
                href="https://linktr.ee/i2sltd.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-brand-electric-bright transition-colors hover:text-white"
              >
                @I2sltd.tech
              </a>
            </p>
            <a
              href="https://linktr.ee/i2sltd.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[11px] text-white/65 transition-colors hover:text-white"
            >
              linktr.ee/i2sltd.tech ↗
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-end">
            <Link className="transition-colors hover:text-white" href="/privacy">Privacy Policy</Link>
            <Link className="transition-colors hover:text-white" href="/terms">Terms of Use</Link>
            <a
              className="transition-colors hover:text-white"
              href="https://cvr.inecnigeria.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              INEC Voter Registration ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
