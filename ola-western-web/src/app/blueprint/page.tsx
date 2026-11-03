import type { Metadata } from 'next';
import Link from 'next/link';
import { BLUEPRINT, SITE } from '@/lib/content';
import SlotImage from '@/components/ui/SlotImage';
import { slots } from '@/lib/slots';

export const metadata: Metadata = {
  title: 'Legislative Blueprint — The Manifesto',
  description:
    "Ola Western's actionable legislative agenda for the Lagos State House of Assembly: FHA infrastructure, SME protection, youth hubs and transparent representation.",
};

const TAG_COLOR: Record<string, string> = {
  Infrastructure: 'bg-brand-green text-white',
  Economy: 'bg-brand-blue text-white',
  Youth: 'bg-brand-gold text-white',
  Governance: 'bg-brand-dark text-white',
};

export default async function BlueprintPage() {
  const s = await slots();
  return (
    <>
      <section className="hero-gradient">
        <div className="container-site py-16 text-center">
          <p className="section-kicker !bg-white/10 !text-brand-green-light">The Manifesto</p>
          <h1 className="hero-title">
            The Legislative Blueprint
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-brand-green-light">
            Four concrete deliverables for the Lagos State House of Assembly — bills, motions and
            oversight, not vague promises.
          </p>
        </div>
      </section>

      {/* The blueprint is a promise about work already started — show the work. */}
      <section className="container-site pt-14">
        <div className="grid gap-6 sm:grid-cols-2">
          <SlotImage slots={s} slot="graphic" reuse />
          <SlotImage slots={s} slot="rally-address" reuse />
        </div>
      </section>

      <section className="container-site py-16">
        <div className="grid gap-8 md:grid-cols-2">
          {BLUEPRINT.map((b, i) => (
            <article key={b.title} className="card relative overflow-hidden">
              <span className="absolute -right-3 -top-4 font-display text-7xl font-bold text-brand-light" aria-hidden>
                0{i + 1}
              </span>
              <span className={`relative inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${TAG_COLOR[b.tag]}`}>
                {b.tag}
              </span>
              <h2 className="relative mt-4 font-display text-xl font-bold">{b.title}</h2>
              <p className="relative mt-3 text-sm leading-relaxed text-brand-gray">{b.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-brand-green-light p-8 text-center">
          <h3 className="font-display text-2xl font-bold text-brand-green">
            {SITE.slogan}
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-brand-dark">
            This blueprint is anchored in the everyday life of Amuwo-Odofin Constituency I:
            FHA-LGA infrastructure alignment, the rehabilitation of 23 Road, canal and drainage
            desilting, protection for market vendors at Agboju and Mile 2, and digital skill hubs
            for the youth of FESTAC.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link href="/impact" className="btn-primary">See the Proof of Work</Link>
            <Link href="/truth-room" className="btn-secondary">Verify the Facts</Link>
          </div>
        </div>
      </section>
    </>
  );
}
