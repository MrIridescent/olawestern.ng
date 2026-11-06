import AnimatedText from '@/components/ui/AnimatedText';
import StaggeredCardAnimation from '@/components/ui/StaggeredCardAnimation';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import StatTicker from '@/components/ui/StatTicker';
import SlotImage from '@/components/ui/SlotImage';
import GalleryCarousel from '@/components/ui/GalleryCarousel';
import SocialLinksRow from '@/components/ui/SocialLinks';
import VideoShelf from '@/components/ui/VideoShelf';
import { getSettings, listFactChecks, listPress, listSocials } from '@/lib/store';
import { slots } from '@/lib/slots';
import { SITE } from '@/lib/content';
import type { FactCheck, PressItem } from '@/types';

import VisitorCounter from '@/components/ui/VisitorCounter';
import NewsCarousel from '@/components/ui/NewsCarousel';
import JoinMovementForm from '@/components/forms/JoinMovementForm';
import WardImpactLocator from '@/components/home/WardImpactLocator';
import PolicyFlipCards from '@/components/home/PolicyFlipCards';
import Reveal from '@/components/hq/Reveal';

export const revalidate = 3600;

async function getFeaturedFacts(): Promise<FactCheck[]> {
  return (await listFactChecks()).slice(0, 2);
}

async function getLatestNews(): Promise<PressItem[]> {
  return (await listPress({ publishedOnly: true })).slice(0, 2);
}

export default async function HomePage() {
  const [facts, news, settings, s, socials] = await Promise.all([
    getFeaturedFacts(),
    getLatestNews(),
    getSettings(),
    slots(),
    listSocials(),
  ]);

  return (
    <>
      {/* ── HERO COMMAND CENTRE ──────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="container-site grid items-center gap-10 py-12 md:grid-cols-[1.08fr_0.92fr] md:gap-12 md:py-20">
          <div>
            <span className="verified-pill">
              <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0z" clipRule="evenodd" />
              </svg>
              <span data-ow="settings.hero_kicker" data-ow-label="Hero kicker">{settings.hero_kicker}</span>
            </span>

            <p
              className="mt-5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/75"
              data-ow="settings.hero_title"
              data-ow-label="Candidate name"
            >
              {settings.hero_title}
            </p>

            <AnimatedText>
              <h1 className="mt-2 font-display text-[2rem] font-extrabold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
                Effective Legislative Representation for{' '}
                <span className="text-brand-electric-bright">Amuwo-Odofin 1</span>
              </h1>
            </AnimatedText>

            <p
              className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/70 sm:text-base"
              data-ow="settings.hero_body"
              data-ow-label="Hero paragraph"
            >
              {settings.hero_body}
            </p>

            <div className="mt-7 max-w-xl">
              <JoinMovementForm whatsappNumber={SITE.whatsappNumber} />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
              <Link
                href="/impact"
                className="font-bold text-white underline decoration-brand-electric decoration-2 underline-offset-4 transition-colors hover:text-brand-electric-bright"
              >
                See the proven record <span aria-hidden>→</span>
              </Link>
              <a
                href={SITE.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-white/75 transition-colors hover:text-white"
              >
                or message the desk directly
              </a>
            </div>
          </div>

          {/* Portrait panel — the CMS photo filed under `candidate-portrait`. */}
          <div className="relative mx-auto w-full max-w-[21rem] sm:max-w-sm md:max-w-md">
            <div className="absolute -inset-2.5 rounded-[1.6rem] border border-brand-electric/35" aria-hidden />
            <div className="relative">
              <span className="absolute left-3 top-3 z-10 rounded-full border border-white/20 bg-brand-navy/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
                APC · 2027
              </span>
              <SlotImage
                slots={s}
                slot="candidate-portrait"
                priority
                className="relative ring-1 ring-white/20 [&_figcaption_a]:text-brand-electric-bright [&_figcaption_p]:text-white/65"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CONSTITUENT IMPACT METRICS ───────────────────────── */}
      <section className="border-y-4 border-brand-electric bg-brand-navy-deep py-7">
        <div className="container-site">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-electric-bright">
              The record, in numbers
            </p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/70">
              Constituency I · Amuwo-Odofin
            </p>
          </div>
          <StatTicker stats={settings.stats} />
        </div>
      </section>

      {/* ── WARD LOCATOR + POLICY CARDS ──────────────────────── */}
      <WardImpactLocator whatsappNumber={SITE.whatsappNumber} />
      <PolicyFlipCards />

      {/* ── DIGITAL CAMPAIGN HQ TEASER ──────────────────────── */}
      <section className="relative overflow-hidden border-y-4 border-brand-electric bg-brand-navy py-14 sm:py-16">
        <div className="hq-grid" aria-hidden />
        <div className="container-site relative">
          <Reveal>
            <div className="grid items-center gap-9 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
              <div>
                <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-orange-bright">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-emerald" aria-hidden />
                  The Digital Campaign HQ
                </p>
                <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
                  Promises written down.
                  <br />
                  Receipts published.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                  The campaign runs in public: a promise ledger with evidence, a Street Brief for every
                  ward, and a ten-year plan the constituency can measure. No fake polls. No vanishing
                  manifesto.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link href="/hq" className="btn-primary w-full sm:w-auto">
                    Enter the HQ <span aria-hidden>→</span>
                  </Link>
                  <Link
                    href="/hq#ledger"
                    className="btn w-full border border-white/25 text-white hover:bg-white/10 sm:w-auto"
                  >
                    Read the ledger
                  </Link>
                </div>
              </div>

              <div className="hq-glass rounded-2xl p-3 sm:p-4">
                <ul className="divide-y divide-white/10">
                  {[
                    { n: '01', t: 'Promise ledger', b: 'Ten commitments. Four already delivered with evidence.' },
                    { n: '02', t: 'Street Brief', b: 'Pick a ward and a priority. Get a three-step plan.' },
                    { n: '03', t: 'The long game', b: 'Six chapters, from the first 100 days to 2035.' },
                  ].map((row) => (
                    <li key={row.n}>
                      <Link
                        href={row.n === '01' ? '/hq#ledger' : row.n === '02' ? '/hq#street-brief' : '/hq#long-game'}
                        className="group flex items-center gap-4 rounded-xl px-3 py-4 transition-colors hover:bg-white/[0.06]"
                      >
                        <span className="font-display text-xs font-extrabold tabular-nums text-brand-orange-bright">{row.n}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-base font-extrabold text-white">{row.t}</span>
                          <span className="mt-0.5 block text-[11.5px] leading-relaxed text-white/60">{row.b}</span>
                        </span>
                        <span aria-hidden className="text-white/45 transition-transform group-hover:translate-x-1">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="border-t border-white/10 px-3 pb-1 pt-3 text-[9.5px] uppercase tracking-[0.16em] text-white/40">
                  Public by design · Built by I2SLTD
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── WHY OLA — the three attestations ─────────────────── */}
      <section className="container-site py-16">
        <p className="section-kicker">Why FESTAC chose him</p>
        <h2 className="section-title">Three things this constituency can attest to</h2>
        <StaggeredCardAnimation>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="card border-t-2 border-t-brand-orange/30">
              <span className="mb-4 inline-flex rounded-xl bg-brand-orange-light p-3 text-brand-orange">
                <Icon name="shield" />
              </span>
              <h3 className="font-display text-lg font-bold">Always here, always accessible</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-gray">
                His home, his company (Western Concrete) and his campaign office at 32 Road all stand inside
                FESTAC Town. The door residents knock on for a blocked drain or a hospital bill is the same
                door that opens onto the Assembly.
              </p>
            </div>
            <div className="card border-t-2 border-t-brand-orange/30">
              <span className="mb-4 inline-flex rounded-xl bg-brand-orange-light p-3 text-brand-orange">
                <Icon name="road" />
              </span>
              <h3 className="font-display text-lg font-bold">Delivering before office</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-gray">
                Six-ward borehole drive and the 7th Avenue drainage desilting (2018). State approval for six
                FESTAC roads — 1st Avenue rebuilt (2023). 1,000+ households fed at the Food Fest (2024) —
                each entry linked to its press report.
              </p>
            </div>
            <div className="card border-t-2 border-t-brand-orange/30">
              <span className="mb-4 inline-flex rounded-xl bg-brand-orange-light p-3 text-brand-orange">
                <Icon name="youth" />
              </span>
              <h3 className="font-display text-lg font-bold">Representing our shared reality</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-gray">
                A civil engineer who rides the same potholed roads, breathes the same flood season and pays
                the same generator bill as every voter in Festac I–III and Mile 2 — then went to the Governor
                with the engineering assessments to fix them.
              </p>
            </div>
          </div>
        </StaggeredCardAnimation>


      </section>



      {/* ── THE DESK IS OPEN ───────────────────────────────────── */}
      <section className="container-site py-16">
        <div className="rounded-3xl border border-brand-orange/20 bg-brand-orange-light p-6 shadow-sm sm:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="section-kicker">Always Here, Always Accessible</p>
              <h2 className="section-title">The desk is open — and it is public</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brand-gray sm:text-base">
                Residents of Festac I–III and Mile 2 can report a blocked drain, a dead street light, a
                failed borehole or a market problem and watch it move through a published progress
                dashboard — received, under review, action scheduled, resolved. Constituents, youth
                groups and business owners can also book a seat at the open-door hours at 32 Road.
                This is the &ldquo;Department of Community Engagement&rdquo; promise, already running.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/help-desk" className="btn-primary">Open the Help Desk</Link>
                <Link href="/help-desk#open-door" className="btn-secondary">Book open-door hours</Link>
              </div>
            </div>
            <ul className="space-y-3">
              {[
                { t: 'Report in 60 seconds', b: 'Ward, category, one line about your street. Your number is never published.' },
                { t: 'Watch the status move', b: 'A public dashboard the campaign can edit but you can hold it to.' },
                { t: 'Sit down with the team', b: 'Physical or WhatsApp open-door slots, confirmed by your ward desk.' },
              ].map((f, i) => (
                <li key={f.t} className="card flex items-start gap-4 !p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-orange font-display text-sm font-bold text-white">{i + 1}</span>
                  <span>
                    <span className="block text-sm font-bold text-brand-dark">{f.t}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-brand-gray">{f.b}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── GALLERY CAROUSEL ─────────────────────────────────── */}
      <section className="container-site py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-kicker">On The Ground</p>
            <h2 className="section-title">From FESTAC streets to Mile 2 markets</h2>
          </div>
          <Link href="/gallery" className="btn-secondary">Open Full Gallery</Link>
        </div>
        <div className="mt-8">
          <GalleryCarousel slides={s.slides(6)} />
        </div>
      </section>

      {/* ── BROADCAST VIDEOS ─────────────────────────────────── */}
      <VideoShelf className="bg-brand-light py-16" />

      {/* ── TRUTH ROOM PREVIEW ───────────────────────────────── */}
      <section className="container-site py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Truth Room</p>
            <h2 className="section-title">Facts, verified. Rumors, debunked.</h2>
          </div>
          <Link href="/truth-room" className="btn-secondary">Visit the Truth Room</Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {facts.map((f) => (
            <div key={f.id} className="card">
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${f.verdict === 'VERIFIED FACT' ? 'verdict-verified' : 'verdict-false'}`}>
                {f.verdict === 'FALSE CLAIM' ? 'FALSE CLAIM — DEBUNKED' : f.verdict}
              </span>
              <h3 className="mt-3 font-display text-lg font-bold leading-snug" data-ow={`fact.${f.id}.claim_summary`} data-ow-label="The claim">{f.claim_summary}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-brand-gray" data-ow={`fact.${f.id}.detailed_explanation`} data-ow-label="The evidence">{f.detailed_explanation}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── NEWSFEED PREVIEW ─────────────────────────────────── */}
      <section className="bg-brand-light py-16">
        <div className="container-site">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-kicker">Newsroom</p>
              <h2 className="section-title">Latest from the campaign trail</h2>
            </div>
            <Link href="/news" className="btn-secondary">Full Community Newsfeed</Link>
          </div>
          <div className="mt-8">
            <NewsCarousel news={news} />
          </div>
        </div>
      </section>

      {/* ── CTA BAND ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-navy">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-deep via-brand-navy to-brand-navy-deep" aria-hidden />
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-electric/30 blur-3xl" aria-hidden />
        <div className="container-site relative flex flex-col items-center gap-6 py-14 text-center">
          <span className="h-1 w-16 rounded-full bg-brand-electric" aria-hidden />
          <h2 className="font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl" data-ow="settings.cta_title" data-ow-label="Closing band title">
            {settings.cta_title}
          </h2>
          <p className="max-w-2xl text-white/70" data-ow="settings.cta_body" data-ow-label="Closing band paragraph">{settings.cta_body}</p>
          <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-4">
            <Link href="/join" className="btn-primary w-full sm:w-auto">
              Volunteer Now <span aria-hidden>→</span>
            </Link>
            <a
              href={SITE.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn w-full border-2 border-white/30 text-white hover:bg-white/10 sm:w-auto"
            >
              Chat on WhatsApp
            </a>
          </div>
          <div className="mt-4">
            <VisitorCounter />
          </div>
          <div className="mt-2">
            <SocialLinksRow socials={socials} dark />
          </div>
        </div>
      </section>
    </>
  );
}