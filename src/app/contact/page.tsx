import type { Metadata } from 'next';
import Link from 'next/link';
import SlotImage from '@/components/ui/SlotImage';
import SocialLinksRow from '@/components/ui/SocialLinks';
import { SITE } from '@/lib/content';
import { listSocials } from '@/lib/store';
import { slots } from '@/lib/slots';

export const metadata: Metadata = {
  title: 'Contact — Campaign Office, WhatsApp & Socials',
  description:
    'Reach the Ola Western campaign: HQ at 32 Road by 3rd Avenue FESTAC Town, the campaign desk phone line, WhatsApp desk, email and official social media handles.',
};

export const revalidate = 3600;

const WARDS_LIST = ['Festac I', 'Festac II', 'Festac III', 'Mile 2 / Housing Estate'] as const;

export default async function ContactPage() {
  const [s, socials] = await Promise.all([slots(), listSocials()]);
  return (
    <>
      <section className="hero-gradient">
        <div className="container-site py-14 text-center">
          <p className="section-kicker !bg-white/10 !text-white/70">Reach The Campaign</p>
          <h1 className="hero-title">Contact Ola Western HQ</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            Responsible representation starts with an open door. Call, write, message on WhatsApp — or walk in.
          </p>
        </div>
      </section>

      <section className="container-site py-14">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Direct lines */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="font-display text-lg font-bold text-brand-green">Campaign Headquarters</h2>
              <address className="mt-2 not-italic leading-relaxed text-brand-gray">
                {SITE.hq}
                <br />
                Amuwo-Odofin, Lagos State, Nigeria
              </address>
              <p className="mt-3 text-sm text-brand-gray">
                The door is open — call the campaign desk before you visit and your ward team will
                be expecting you.
              </p>
            </div>

            <div className="card">
              <h2 className="font-display text-lg font-bold text-brand-green">Direct Lines</h2>
              <ul className="mt-3 space-y-2 text-sm text-brand-gray">
                <li>
                  <span className="font-semibold text-brand-dark">Campaign Desk:</span>{' '}
                  <a className="underline hover:text-brand-green" href="tel:+2348034005708">{SITE.campaignDeskPhone}</a>
                </li>
                <li>
                  <span className="font-semibold text-brand-dark">WhatsApp desk:</span>{' '}
                  <a className="underline hover:text-brand-green" href={SITE.whatsappLink} target="_blank" rel="noopener noreferrer">{SITE.campaignDeskPhone}</a>
                </li>
                <li>
                  <span className="font-semibold text-brand-dark">Email:</span>{' '}
                  <a className="underline hover:text-brand-green" href={`mailto:${SITE.email}`}>{SITE.email}</a>
                </li>
              </ul>
            </div>

            <div className="card">
              <h2 className="font-display text-lg font-bold text-brand-green">Follow Every Channel</h2>
              <p className="mb-4 mt-1 text-sm text-brand-gray">
                The official channels of the campaign — everything else is noise.
              </p>
              <SocialLinksRow socials={socials} />
            </div>
          </div>

          {/* Map / photo slot + ward desks */}
          <div className="space-y-6">
            {/* HQ frame — the media desk files an office photo under this slot.
                exact: a picture of some other event must never stand in for the
                campaign office, so this frame keeps the brand panel until then. */}
            <SlotImage
              slots={s}
              slot="hq-office"
              exact
              fallbackAlt="Campaign HQ location — 32 Road by 3rd Avenue, FESTAC Town"
              className="ring-1 ring-gray-100"
            />

            <div className="card">
              <h2 className="font-display text-lg font-bold text-brand-green">Ward Campaign Desks</h2>
              <p className="mt-1 text-sm text-brand-gray">
                Every constituent reaches a named team. Call the central desk and ask for your ward —
                the line routes straight to your ward captain.
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {WARDS_LIST.map((w) => (
                  <li key={w} className="rounded-xl bg-brand-light px-4 py-3">
                    <p className="text-sm font-bold text-brand-dark">{w}</p>
                    <a
                      href="tel:+2348034005708"
                      className="mt-0.5 inline-block text-xs font-semibold text-brand-blue underline"
                    >
                      Reach this desk · {SITE.campaignDeskPhone}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-brand-green p-6 text-center">
              <p className="font-display text-lg font-bold text-white">Prefer to talk to a human?</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-white/70">
                Register as a volunteer and your ward team calls you back — or message the WhatsApp desk.
              </p>
              <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/join" className="btn-secondary w-full !border-white !text-white hover:!bg-white hover:!text-brand-green sm:w-auto">Volunteer</Link>
                <a href={SITE.whatsappLink} target="_blank" rel="noopener noreferrer" className="btn w-full bg-white text-brand-green hover:bg-brand-green-light sm:w-auto">WhatsApp</a>
                <a href="tel:+2348034005708" className="btn w-full border-2 border-white/40 text-white hover:bg-white/10 sm:w-auto">Call the desk</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
