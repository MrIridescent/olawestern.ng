import type { Metadata } from 'next';
import Link from 'next/link';
import SlotImage from '@/components/ui/SlotImage';
import { ENDORSEMENTS, SITE, TIMELINE } from '@/lib/content';
import { listProfileFacts } from '@/lib/store';
import { slots } from '@/lib/slots';

export const metadata: Metadata = {
  title: 'About Ola — The Person, The Journey, The Leader',
  description:
    'Biography, candidate profile, governance philosophy and party endorsements of Hon. Folorunsho Olaitan Segun (Ola Western), APC candidate for Amuwo-Odofin Constituency I.',
};

export const revalidate = 3600;

export default async function AboutPage() {
  const [s, profileFacts] = await Promise.all([slots(), listProfileFacts()]);
  return (
    <>
      <section className="hero-gradient">
        <div className="container-site py-16 text-center md:py-20">
          <p className="mx-auto mb-3 inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-green-light ring-1 ring-white/20">
            About {SITE.brandName}
          </p>
          <h1 className="hero-title">
            The Person. The Journey. The Leader.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-brand-green-light">
            Not a politician visiting the community — a neighbour who has lived it, invested in it,
            and been tested by it.
          </p>
        </div>
      </section>

      {/* ── CANDIDATE FILE ───────────────────────────────────── */}
      <section className="container-site py-16">
        <div className="grid items-start gap-10 lg:grid-cols-[380px_1fr]">
          <div>
            <SlotImage slots={s} slot="candidate-portrait" fallbackAlt={`Hon. ${SITE.brandName}`} priority />
          </div>
          <div>
            <p className="section-kicker">Public Record</p>
            <h2 className="section-title">The Candidate File</h2>
            <p className="mt-2 text-sm text-brand-gray">
              The standard public details voters are entitled to. Only what the campaign has
              confirmed in writing is published here.
            </p>
            <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {profileFacts.filter((f) => f.value).map((f) => (
                <div key={f.id} className="border-b border-gray-100 pb-3">
                  <dt className="text-[11px] font-bold uppercase tracking-widest text-brand-gray">{f.key}</dt>
                  <dd
                    className="mt-1 text-sm font-semibold text-brand-dark"
                    data-ow={`profile.${f.id}.value`}
                    data-ow-label={f.key}
                    data-ow-ctx={JSON.stringify({ id: f.id, key: f.key })}
                  >
                    {f.value}
                  </dd>
                  {f.note && <dd className="mt-0.5 text-xs text-gray-600">{f.note}</dd>}
                </div>
              ))}
              {/* Rows HQ has not confirmed in writing: invisible to a voter, a tap-target
                  for the desk (globals.css reveals them only while the editing layer is
                  armed), so "supply written confirmation" is something you do here. */}
              {profileFacts.filter((f) => !f.value).map((f) => (
                <dd
                  key={f.id}
                  data-ow-missing="1"
                  data-ow={`profile.${f.id}.value`}
                  data-ow-label={`${f.key} (unconfirmed)`}
                  data-ow-ctx={JSON.stringify({ id: f.id, key: f.key })}
                  data-ow-value=""
                  className="self-start text-[11px] font-bold"
                >
                  ＋ {f.key} — not confirmed
                </dd>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── TIMELINE ─────────────────────────────────────────── */}
      <section className="container-site py-16">
        <p className="section-kicker">The Journey</p>
        <h2 className="section-title">Rooted in FESTAC, proven by service</h2>
        <ol className="mt-10 space-y-0">
          {TIMELINE.map((t, i) => (
            <li key={t.title} className="relative grid gap-4 pb-10 pl-12 sm:grid-cols-[80px_1fr] sm:gap-8 sm:pl-16">
              {/* rail */}
              {i < TIMELINE.length - 1 && (
                <span className="absolute left-4 top-2 h-full w-0.5 bg-brand-green-light sm:left-[52px]" aria-hidden />
              )}
              <span className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand-green text-[10px] font-bold text-white sm:left-[40px]">
                {i + 1}
              </span>
              <p className="pt-0.5 text-xs font-bold uppercase tracking-widest text-brand-green-dark">{t.period}</p>
              <div>
                <h3 className="font-display text-xl font-bold">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-gray">{t.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── GOVERNANCE PHILOSOPHY ────────────────────────────── */}
      <section className="bg-brand-light py-16">
        <div className="container-site">
          <p className="section-kicker">Core Values</p>
          <h2 className="section-title">What &ldquo;Responsible Representation&rdquo; means in practice</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Accessibility',
                body: 'A legislator reachable by every constituent — he lives and works in FESTAC Town, the office at 32 Road stays open, ward town halls stay scheduled, and the WhatsApp desk stays answered.',
              },
              {
                title: 'Constituent Feedback',
                body: 'A permanent Department of Community Engagement — ward-level data on broken infrastructure and local priorities carried directly into legislative motions and oversight actions.',
              },
              {
                title: 'Legislative Transparency',
                body: 'Every bill, motion and oversight activity published in plain language — voters always know what their representative did with their mandate.',
              },
              {
                title: 'Engineering-led delivery',
                body: 'Private-sector technical capacity pointed at public problems: civil assessments behind six approved road rehabilitations, and youth programmes that teach skills — construction, clean energy, digital, logistics — instead of handing out short-term cash.',
              },
            ].map((v) => (
              <div key={v.title} className="card">
                <h3 className="font-display text-lg font-bold text-brand-green">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-gray">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ON THE GROUND ────────────────────────────────────── */}
      <section className="container-site py-16">
        <p className="section-kicker">On The Ground</p>
        <h2 className="section-title">FESTAC Town, in pictures</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {['rally-address', 'food-fest', 'primary-victory'].map((slot) => (
            <SlotImage key={slot} slots={s} slot={slot} reuse />
          ))}
        </div>
        <p className="mt-6 text-sm">
          <Link href="/gallery" className="font-bold text-brand-green underline underline-offset-2">
            Open the full gallery →
          </Link>
        </p>
      </section>

      {/* ── ENDORSEMENTS ─────────────────────────────────────── */}
      <section className="container-site py-16">
        <p className="section-kicker">Party Unity</p>
        <h2 className="section-title">Endorsed across APC leadership in Amuwo-Odofin</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {ENDORSEMENTS.map((e) => (
            <figure key={e.name} className="card">
              <blockquote className="text-sm italic leading-relaxed text-brand-dark">
                &ldquo;{e.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 border-t border-gray-100 pt-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green-light font-display text-sm font-bold text-brand-green float-left mr-3">
                  {e.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                </span>
                <p className="font-semibold text-brand-dark">{e.name}</p>
                <p className="text-xs text-brand-gray">{e.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-8 rounded-xl bg-brand-green-light px-5 py-4 text-sm text-brand-green">
          <strong>The mandate, twice:</strong> 12 of 20 accredited delegate votes in the May 2022 APC
          primary — and over 3,000 votes across the wards in May 2026, the widest consensus in the race.
          Both certified by the party&rsquo;s own structures and covered in the press (
          <Link href="/impact#sources" className="font-bold underline">see the sources</Link>).
        </p>
      </section>
    </>
  );
}
