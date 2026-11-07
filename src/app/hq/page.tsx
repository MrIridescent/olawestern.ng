import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '@/components/hq/Reveal';
import SignalTicker from '@/components/hq/SignalTicker';
import PromiseLedger from '@/components/hq/PromiseLedger';
import StreetBrief from '@/components/hq/StreetBrief';
import LongGame from '@/components/hq/LongGame';
import { getSettings, listFactChecks, listPress, listPublicIssues } from '@/lib/store';
import { LONG_GAME, WARD_BRIEFS } from '@/lib/hq';
import { SITE } from '@/lib/content';
import { WARDS } from '@/types';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Digital Campaign HQ',
  description:
    'The public operating system of the Ola Western campaign: a promise ledger with receipts, a Street Brief generator, a ward room and a ten-year governing plan for Amuwo-Odofin Constituency I.',
  openGraph: {
    title: 'Digital Campaign HQ | Ola Western',
    description:
      'A campaign that publishes its promises before the election, logs every ward request and shows the receipts. Explore the Ola Western Digital Campaign HQ.',
    url: '/hq',
  },
};

const SIGNALS = [
  'Six boreholes across six wards — delivered',
  '1st Avenue rebuilt · 2023',
  '7th Avenue drainage desilting supported · 2018',
  '1,000+ households fed at the Food Fest · 2024',
  'APC primary won with over 3,000 votes · May 2026',
  'Open-door cycle running at 32 Road, FESTAC',
  'Every promise carries a receipt',
];

const MODULES = [
  {
    title: 'Promise ledger',
    body: 'Ten commitments, four already delivered, each with the evidence a resident can open.',
    href: '#ledger',
    tag: 'Accountability',
  },
  {
    title: 'Street Brief',
    body: 'Pick a ward and a priority. Get a three-step plan you can send to the ward desk.',
    href: '#street-brief',
    tag: 'Organising',
  },
  {
    title: 'Ward room',
    body: 'The commitments, the ground record and the town-hall cycle for each ward.',
    href: '#ward-room',
    tag: 'Constituency',
  },
  {
    title: 'The long game',
    body: 'A ten-year governing plan, from the first 100 days to an institution that outlasts a term.',
    href: '#long-game',
    tag: 'Strategy',
  },
  {
    title: 'Truth Room',
    body: 'Claims checked against the record. Rumours answered in public, not in a group chat.',
    href: '/truth-room',
    tag: 'Trust',
  },
  {
    title: 'Help Desk',
    body: 'Report a drain, a light, a pump or a market levy and watch the status move.',
    href: '/help-desk',
    tag: 'Service',
  },
];

export default async function HqPage() {
  const [issues, facts, press, settings] = await Promise.all([
    listPublicIssues(),
    listFactChecks(),
    listPress({ publishedOnly: true }),
    getSettings(),
  ]);

  const resolved = issues.filter((i) => i.status === 'resolved').length;
  const open = issues.filter((i) => i.status !== 'resolved').length;
  const updated = issues.filter((i) => Boolean(i.update_note)).length;
  const publishedCount = issues.length;

  const pulse = [
    { value: String(publishedCount), label: 'Public requests' },
    { value: String(resolved), label: 'Resolved' },
    { value: String(facts.length), label: 'Facts checked' },
    { value: String(press.length), label: 'Press notes' },
  ];

  return (
    <>
      {/* ── COMMAND HERO ─────────────────────────────────────── */}
      <section className="hq-hero relative overflow-hidden border-b-4 border-brand-electric">
        <div className="hq-grid" aria-hidden />
        <div className="container-site relative grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.12fr_0.88fr] lg:gap-14 lg:py-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-emerald/35 bg-brand-emerald/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-emerald opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-emerald" />
              </span>
              Public record active
            </p>

            <h1 className="mt-5 font-display text-[2.35rem] font-extrabold leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-[4.4rem]">
              The Digital
              <br />
              Campaign <span className="hq-gradient-text">HQ</span>
            </h1>

            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/70 sm:text-base">
              Not a poster with a menu. This is the campaign&rsquo;s public operating system:
              every promise written down before the vote, every ward request logged, every
              claim checked, and a ten-year plan the constituency can hold to account.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href="#ledger" className="btn-primary w-full sm:w-auto">
                Open the promise ledger <span aria-hidden>↓</span>
              </a>
              <Link
                href="/help-desk"
                className="btn w-full border border-white/25 text-white hover:bg-white/10 sm:w-auto"
              >
                Report a ward issue
              </Link>
            </div>

            <dl className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
              {pulse.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/12 bg-white/[0.06] px-3 py-3 backdrop-blur-md"
                >
                  <dt className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/55">{item.label}</dt>
                  <dd className="mt-1 font-display text-2xl font-extrabold leading-none text-white">{item.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-white/45">
              Counts read from the live public dashboard · {open} open {open === 1 ? 'request' : 'requests'} · {updated} with a public update
            </p>
          </div>

          {/* Radar / signal panel */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-6 rounded-[2.2rem] bg-brand-electric/15 blur-3xl" aria-hidden />
            <div className="hq-glass relative overflow-hidden rounded-[1.8rem] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange-bright">Constituency signal</p>
                  <p className="mt-1 text-sm font-semibold text-white">Amuwo-Odofin Constituency I</p>
                </div>
                <span className="rounded-full border border-white/20 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/65">
                  Live
                </span>
              </div>

              <div className="relative mx-auto mt-5 aspect-square w-full max-w-[19rem]">
                <div className="hq-radar" aria-hidden>
                  <span className="hq-radar-ring hq-radar-ring-1" />
                  <span className="hq-radar-ring hq-radar-ring-2" />
                  <span className="hq-radar-ring hq-radar-ring-3" />
                  <span className="hq-radar-sweep" />
                  <span className="hq-radar-blip hq-radar-blip-1" />
                  <span className="hq-radar-blip hq-radar-blip-2" />
                  <span className="hq-radar-blip hq-radar-blip-3" />
                  <span className="hq-radar-core" />
                </div>
                <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/15 bg-brand-navy-deep/85 shadow-[0_0_30px_rgba(3,7,18,0.55)] backdrop-blur">
                  <span className="font-display text-2xl font-extrabold leading-none text-white">4</span>
                  <span className="mt-1 text-[8px] font-bold uppercase tracking-[0.18em] text-white/60">wards</span>
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                {WARDS.map((ward) => (
                  <a
                    key={ward}
                    href="#ward-room"
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-semibold leading-snug text-white/70 transition-colors hover:border-brand-electric/50 hover:text-white"
                  >
                    {ward}
                  </a>
                ))}
              </div>

              <p className="mt-4 text-[10px] leading-relaxed text-white/45">
                Signal panel is a visual index, not a live GPS feed. Ward briefs are maintained by the
                campaign desk.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SignalTicker items={SIGNALS} />

      {/* ── SYSTEM MODULES ───────────────────────────────────── */}
      <section className="bg-brand-navy-deep py-14 sm:py-16">
        <div className="container-site">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-orange-bright">
                  The operating system
                </p>
                <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Six public modules. One campaign.
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-white/60">
                Each module does a job a slogan cannot: it records, routes, verifies or publishes.
              </p>
            </div>
          </Reveal>

          <Reveal selector="[data-module]" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((module) => (
              <Link
                key={module.title}
                href={module.href}
                data-module
                className="group relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.05] p-5 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-brand-electric/45 hover:bg-white/[0.08]"
              >
                <span className="absolute right-3 top-3 text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">
                  {module.tag}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-electric/15 font-display text-sm font-extrabold text-brand-orange-bright ring-1 ring-brand-electric/30">
                  {module.title.slice(0, 1)}
                </span>
                <h3 className="mt-4 font-display text-lg font-extrabold text-white">{module.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/65">{module.body}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-orange-bright">
                  Open module <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── PROMISE LEDGER ───────────────────────────────────── */}
      <section id="ledger" className="relative bg-brand-light py-14 sm:py-20">
        <div className="container-site">
          <Reveal>
            <PromiseLedger />
          </Reveal>
        </div>
      </section>

      {/* ── STREET BRIEF + WARD ROOM ─────────────────────────── */}
      <section id="street-brief" className="hq-ops relative overflow-hidden border-y border-white/10 py-14 sm:py-20">
        <div className="hq-grid" aria-hidden />
        <div className="container-site relative">
          <Reveal>
            <div className="max-w-3xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-orange-bright">
                Organising desk
              </p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Turn a complaint into a plan.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/65 sm:text-base">
                Most campaigns collect grievances and disappear. This desk converts a ward and a
                priority into three specific next steps, then routes the brief to the ward desk on
                WhatsApp. The resident keeps the receipt.
              </p>
            </div>
          </Reveal>

          <Reveal className="mt-8">
            <StreetBrief />
          </Reveal>

          <div id="ward-room" className="mt-14 scroll-mt-28">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-emerald">
                    Ward room
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                    Four wards. Four different jobs.
                  </h2>
                </div>
                <Link
                  href="/#ward-impact"
                  className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-orange-bright hover:text-white"
                >
                  See the ward locator <span aria-hidden>→</span>
                </Link>
              </div>
            </Reveal>

            <Reveal selector="[data-ward]" className="mt-7 grid gap-4 md:grid-cols-2">
              {WARDS.map((ward) => {
                const brief = WARD_BRIEFS[ward];
                return (
                  <article
                    key={ward}
                    data-ward
                    className="group rounded-2xl border border-white/12 bg-white/[0.05] p-5 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-brand-emerald/40 hover:bg-white/[0.07]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display text-lg font-extrabold text-white">{ward}</h3>
                      <span className="rounded-full border border-white/15 bg-white/[0.05] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/60">
                        Priority · {brief.priority}
                      </span>
                    </div>
                    <p className="mt-2 font-display text-sm font-bold leading-snug text-brand-orange-bright">
                      {brief.headline}
                    </p>
                    <ul className="mt-3 space-y-2">
                      {brief.commitments.map((commitment) => (
                        <li key={commitment} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-white/70">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-emerald" aria-hidden />
                          {commitment}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 space-y-1 border-t border-white/10 pt-3 text-[10.5px] leading-relaxed text-white/50">
                      <p><span className="font-bold text-white/70">Ground record: </span>{brief.onTheGround}</p>
                      <p><span className="font-bold text-white/70">Open door: </span>{brief.townHall}</p>
                    </div>
                  </article>
                );
              })}
            </Reveal>
            <p className="mt-5 max-w-3xl text-[11px] leading-relaxed text-white/45">
              Town-hall slots are confirmed by each ward desk through the open-door cycle. No date is
              published here until the ward desk has confirmed it.
            </p>
          </div>
        </div>
      </section>

      {/* ── LONG GAME ────────────────────────────────────────── */}
      <section id="long-game" className="hq-longgame relative overflow-hidden py-14 sm:py-20">
        <div className="container-site relative">
          <Reveal>
            <div className="max-w-3xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-orange-bright">
                Strategy, not season
              </p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                The long game, in public.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/65 sm:text-base">
                {LONG_GAME.length} chapters across a decade. The point is not to sound ambitious; it
                is to make every stage checkable. If a chapter is not delivered, the ledger will say so.
              </p>
            </div>
          </Reveal>

          <Reveal className="mt-10">
            <LongGame />
          </Reveal>
        </div>
      </section>

      {/* ── BUILT BY ─────────────────────────────────────────── */}
      <section className="bg-brand-light py-14 sm:py-20">
        <div className="container-site">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-brand-navy/10 bg-white p-6 shadow-xl shadow-brand-navy/5 sm:p-10">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-electric/10 blur-3xl" aria-hidden />
              <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-orange-dark">
                    The engineering behind the HQ
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl">
                    Built by <span className="text-brand-electric-dark">I2SLTD</span>.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brand-gray sm:text-base">
                    This is not a template with a candidate&rsquo;s photo dropped into it. It is a
                    purpose-built campaign platform: server-rendered Next.js, a Supabase-ready data
                    layer with a local fallback, motion that respects reduced-motion settings, and
                    public pages audited for accessibility.
                  </p>

                  <dl className="mt-6 grid gap-3 sm:grid-cols-3">
                    {[
                      { t: 'Next.js + TypeScript', b: 'App Router, server-rendered public data, typed end to end.' },
                      { t: 'GSAP + restrained motion', b: 'Scroll-triggered reveals and timelines with reduced-motion fallbacks.' },
                      { t: 'Public-by-design', b: 'Reporter identity stripped before data reaches the browser.' },
                    ].map((item) => (
                      <div key={item.t} className="rounded-xl border border-brand-navy/10 bg-brand-navy-light/50 p-4">
                        <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-navy">{item.t}</dt>
                        <dd className="mt-1 text-[11.5px] leading-relaxed text-brand-gray">{item.b}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <a
                      href="https://linktr.ee/i2sltd.tech"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      See the developer&rsquo;s work <span aria-hidden>↗</span>
                    </a>
                    <span className="text-[11px] text-brand-gray">
                      Design &amp; engineering · <span className="font-bold text-brand-navy">@I2sltd.tech</span>
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-brand-navy/10 bg-brand-navy p-5 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange-bright">System notes</p>
                  <ul className="mt-3 space-y-3 text-[12px] leading-relaxed text-white/70">
                    <li className="flex gap-2"><span className="text-brand-emerald" aria-hidden>✓</span> Ten public commitments, each with evidence or an honest status.</li>
                    <li className="flex gap-2"><span className="text-brand-emerald" aria-hidden>✓</span> Ward requests published without reporter names or phone numbers.</li>
                    <li className="flex gap-2"><span className="text-brand-emerald" aria-hidden>✓</span> Motion degrades to static content when a visitor asks for less.</li>
                    <li className="flex gap-2"><span className="text-brand-emerald" aria-hidden>✓</span> Home and media kit return zero automated axe violations.</li>
                    <li className="flex gap-2"><span className="text-brand-emerald" aria-hidden>✓</span> Every downloadable asset carries the official site and email.</li>
                  </ul>
                  <p className="mt-5 border-t border-white/10 pt-3 text-[10px] leading-relaxed text-white/45">
                    Accessibility and performance are maintained, not claimed once. Re-audit after
                    content or component changes.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CLOSING ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-navy">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-deep via-brand-navy to-brand-navy-deep" aria-hidden />
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-electric/25 blur-3xl" aria-hidden />
        <div className="container-site relative flex flex-col items-center gap-5 py-14 text-center">
          <span className="h-1 w-16 rounded-full bg-brand-electric" aria-hidden />
          <h2 className="font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
            {settings.cta_title}
          </h2>
          <p className="max-w-2xl text-white/70" data-ow="settings.cta_body" data-ow-label="Closing band paragraph">
            {settings.cta_body}
          </p>
          <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <Link href="/join" className="btn-primary w-full sm:w-auto">
              Volunteer now <span aria-hidden>→</span>
            </Link>
            <a
              href={SITE.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn w-full border-2 border-white/30 text-white hover:bg-white/10 sm:w-auto"
            >
              WhatsApp the desk
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
