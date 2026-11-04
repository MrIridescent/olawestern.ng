import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import StatTicker from '@/components/ui/StatTicker';
import SlotImage from '@/components/ui/SlotImage';
import GalleryCarousel from '@/components/ui/GalleryCarousel';
import SocialLinksRow from '@/components/ui/SocialLinks';
import VideoShelf from '@/components/ui/VideoShelf';
import { getSettings, listFactChecks, listPress, listSocials } from '@/lib/store';
import { slots } from '@/lib/slots';
import { MEDIA_OUTLETS, PILLARS, SITE } from '@/lib/content';
import type { FactCheck, PressItem } from '@/types';

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
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="container-site grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          import AnimatedText from '@/components/ui/AnimatedText';

// ... (rest of the file)

<AnimatedText>
  <h1 className="font-display text-[1.85rem] font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
    <span data-ow="settings.hero_title" data-ow-label="Headline">{settings.hero_title}</span>
    <span
      className="mt-3 block text-xl font-semibold italic text-brand-green-light sm:text-3xl"
      data-ow="settings.hero_slogan"
      data-ow-label="Slogan"
    >
      {settings.hero_slogan}
    </span>
  </h1>
</AnimatedText>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-200" data-ow="settings.hero_body" data-ow-label="Hero paragraph">
              {settings.hero_body}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link href="/impact" className="btn-primary">See the proven record</Link>
              <Link href="/join" className="btn-secondary !border-white !text-white hover:!bg-white hover:!text-brand-dark">
                Join the Movement
              </Link>
            </div>
          </div>

          {/* Portrait panel — the CMS photo filed under `candidate-portrait`. */}
          <div className="mx-auto w-full max-w-sm md:max-w-md">
            <SlotImage slots={s} slot="candidate-portrait" priority className="ring-1 ring-white/20" />
          </div>
        </div>

        {/* Ticker */}
        <div className="container-site pb-16">
          <StatTicker stats={settings.stats} />
        </div>
      </section>

      {/* ── WHY OLA — the three attestations ─────────────────── */}
      <section className="container-site py-16">
        <p className="section-kicker">Why FESTAC chose him</p>
        <h2 className="section-title">Three things this constituency can attest to</h2>
        import GlassCard from '@/components/ui/GlassCard';
import { motion } from 'framer-motion';

// ... (rest of the file)

<div className="mt-8 grid gap-6 md:grid-cols-3">
  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }} viewport={{ once: true }}>
    <GlassCard>
      <div className="card">
        <span className="mb-4 inline-flex rounded-xl bg-brand-green-light p-3 text-brand-green">
          <Icon name="shield" />
        </span>
        <h3 className="font-display text-lg font-bold">Always here, always accessible</h3>
        <p className="mt-2 text-sm leading-relaxed text-brand-gray">
          His home, his company (Western Concrete) and his campaign office at 32 Road all stand inside
          FESTAC Town. The door residents knock on for a blocked drain or a hospital bill is the same
          door that opens onto the Assembly.
        </p>
      </div>
    </GlassCard>
  </motion.div>
  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }} viewport={{ once: true }}>
    <GlassCard>
      <div className="card">
        <span className="mb-4 inline-flex rounded-xl bg-brand-green-light p-3 text-brand-green">
          <Icon name="road" />
        </span>
        <h3 className="font-display text-lg font-bold">Delivering before office</h3>
        <p className="mt-2 text-sm leading-relaxed text-brand-gray">
          Six-ward borehole drive and the 7th Avenue drainage desilting (2018). State approval for six
          FESTAC roads — 1st Avenue rebuilt (2023). 1,000+ households fed at the Food Fest (2024) —
          each entry linked to its press report.
        </p>
      </div>
    </GlassCard>
  </motion.div>
  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }} viewport={{ once: true }}>
    <GlassCard>
      <div className="card">
        <span className="mb-4 inline-flex rounded-xl bg-brand-green-light p-3 text-brand-green">
          <Icon name="youth" />
        </span>
        <h3 className="font-display text-lg font-bold">Representing our shared reality</h3>
        <p className="mt-2 text-sm leading-relaxed text-brand-gray">
          A civil engineer who rides the same potholed roads, breathes the same flood season and pays
          the same generator bill as every voter in Festac I–III and Mile 2 — then went to the Governor
          with the engineering assessments to fix them.
        </p>
      </div>
    </GlassCard>
  </motion.div>
</div>

        {/* As seen in — press credibility strip */}
        <div className="mt-10 rounded-2xl border border-gray-100 bg-white px-5 py-6 shadow-sm">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-brand-gray">The record, as covered by</p>
          <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {MEDIA_OUTLETS.map((o) => (
              <li key={o} className="font-display text-sm font-bold text-brand-dark/70 sm:text-base">{o}</li>
            ))}
          </ul>
          <p className="mt-4 text-center text-sm">
            <Link href="/impact#sources" className="font-bold text-brand-green underline underline-offset-2">
              Open the full library of 21 published sources →
            </Link>
          </p>
        </div>
      </section>

      {/* ── PILLARS ──────────────────────────────────────────── */}
      <section className="bg-brand-light py-16">
        <div className="container-site">
          <p className="section-kicker">Key Pillars</p>
          <h2 className="section-title">What responsible representation delivers</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p) => (
              <div key={p.title} className="card">
                <span className="mb-4 inline-flex rounded-xl bg-brand-green-light p-3 text-brand-green">
                  <Icon name={p.icon as 'road'} />
                </span>
                <h3 className="font-display text-lg font-bold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-gray">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE DESK IS OPEN ───────────────────────────────────── */}
      <section className="container-site py-16">
        <div className="rounded-3xl bg-brand-light p-6 sm:p-10">
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
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-green font-display text-sm font-bold text-white">{i + 1}</span>
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
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {news.map((n) => (
              <article key={n.id} className="card">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue-dark">
                  {n.source === 'campaign_hq' ? 'Campaign HQ · 32 Road' : n.source === 'festaconline' ? 'Community Press' : 'Partner Statement'}
                  {' — '}
                  {new Date(n.published_at ?? n.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <h3 className="mt-2 font-display text-lg font-bold leading-snug" data-ow={`press.${n.id}.title`} data-ow-label="Release headline">{n.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-brand-gray" data-ow={`press.${n.id}.summary`} data-ow-label="Standfirst">{n.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ─────────────────────────────────────────── */}
      <section className="bg-brand-green">
        <div className="container-site flex flex-col items-center gap-6 py-14 text-center">
          <h2 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl" data-ow="settings.cta_title" data-ow-label="Closing band title">
            {settings.cta_title}
          </h2>
          <p className="max-w-2xl text-brand-green-light" data-ow="settings.cta_body" data-ow-label="Closing band paragraph">{settings.cta_body}</p>
          <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-4">
            <Link href="/join" className="btn-secondary w-full !border-white !text-white hover:!bg-white hover:!text-brand-green sm:w-auto">
              Volunteer Now
            </Link>
            <a href={SITE.whatsappLink} target="_blank" rel="noopener noreferrer" className="btn w-full bg-white text-brand-green hover:bg-brand-green-light sm:w-auto">
              Chat on WhatsApp
            </a>
          </div>
          <div className="mt-2">
            <SocialLinksRow socials={socials} dark />
          </div>
        </div>
      </section>
    </>
  );
}