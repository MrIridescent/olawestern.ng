import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { listPress } from '@/lib/store';
import { SITE } from '@/lib/content';
import { SHARE_PACK, SHARE_PACK_ZIP } from '@/lib/share-pack';
import CopyValue from '@/components/media/CopyValue';

export const metadata: Metadata = {
  title: 'Media Kit — Logos, Press Kit & Official Assets',
  description:
    'Download the official OlaWestern 2027 media kit, logos, 22 shareable stickers and press contacts. Website olawestern.ng · press email ekabo@olawestern.ng.',
};

export const revalidate = 3600;

function fmtDate(iso: string | null): string {
  const d = new Date(iso ?? Date.now());
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}

const DOWNLOADS = [
  {
    title: 'Campaign Media Kit',
    format: 'PDF · 3 pages',
    href: '/downloads/ola-western-media-kit.pdf',
    description:
      'Approved biography, verified key facts, the record before office, the four agenda pillars and the press desk.',
    accent: 'orange',
    icon: 'document',
    note: 'Website and press email printed on every page.',
  },
  {
    title: 'Press Contact Card',
    format: 'VCF · one-tap contact',
    href: '/downloads/ola-western-contact.vcf',
    description:
      'Adds the campaign desk, WhatsApp line, press email, website and FESTAC HQ to any phone in one tap.',
    accent: 'emerald',
    icon: 'contact',
    note: 'For reporters, partners and ward organisers.',
  },
  {
    title: 'Approved Boilerplate',
    format: 'TXT · copy-ready',
    href: '/downloads/ola-western-boilerplate.txt',
    description:
      'Short and standard biographies, office sought, the four pillars and the approved electoral disclosure.',
    accent: 'navy',
    icon: 'text',
    note: 'Paste straight into a story or programme note.',
  },
] as const;

const LOGOS = [
  { name: 'Slogan lockup', file: '/images/logos/slogan.png', description: 'Primary campaign lockup with the slogan.' },
  { name: 'Pillars mark', file: '/images/logos/pillars.png', description: 'The four-pillar campaign mark.' },
  { name: 'Mandate card', file: '/images/logos/mandate.png', description: 'Primary mandate / flagbearer graphic.' },
];

const SOCIAL_GRAPHICS = [
  { name: 'Community First.', file: '/images/media_kit/community-first.jpg', alt: 'Ola Western community-first campaign graphic' },
  { name: 'A Leader You Can Trust.', file: '/images/media_kit/a-leader-you-can-trust.jpg', alt: 'Ola Western leadership campaign graphic' },
  { name: 'Proven Results.', file: '/images/media_kit/proven-results.jpg', alt: 'Ola Western proven-results campaign graphic' },
];

const ACCENT = {
  orange: { bar: 'bg-brand-electric', icon: 'bg-brand-electric text-white', chip: 'text-brand-electric-dark bg-brand-electric-light' },
  emerald: { bar: 'bg-brand-emerald', icon: 'bg-brand-emerald-dark text-white', chip: 'text-brand-emerald-dark bg-brand-emerald-light' },
  navy: { bar: 'bg-brand-navy', icon: 'bg-brand-navy text-white', chip: 'text-brand-navy bg-brand-navy-light' },
};

function DownloadIcon({ name }: { name: 'document' | 'contact' | 'text' }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  if (name === 'contact') {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2.2" />
        <path d="M5.8 17c.5-2 1.8-3 3.2-3s2.7 1 3.2 3M15 9h3M15 13h3" />
      </svg>
    );
  }
  if (name === 'text') {
    return (
      <svg {...common}>
        <path d="M5 4h11l3 3v13H5V4zM16 4v4h3M8 12h8M8 16h6" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M6 3h9l4 4v14H6V3zM15 3v5h4M9 13h6M9 17h6" />
    </svg>
  );
}

export default async function MediaKitPage() {
  const items = await listPress({ publishedOnly: true });
  const websiteLabel = SITE.siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="hero-gradient">
        <div className="container-site py-14 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="section-kicker">Official Assets · 2027</p>
            <h1 className="hero-title">The Media Kit</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
              Approved biographies, the record, the agenda, logos and 22 share-ready stickers for
              newsrooms, partners and supporters. Official contact details are printed on the core kit.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#downloads" className="btn-primary w-full sm:w-auto">
                Download the kit <span aria-hidden>→</span>
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="btn w-full border-2 border-white/30 text-white hover:bg-white/10 sm:w-auto"
              >
                {SITE.email}
              </a>
            </div>
            <a href="#share-pack" className="mt-3 inline-block text-xs font-semibold text-white/70 underline decoration-white/30 underline-offset-4 hover:text-brand-electric-bright">
              or jump to the 22-piece share pack ↓
            </a>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl gap-2 sm:grid-cols-3">
            <CopyValue value={SITE.siteUrl} label="Website" />
            <CopyValue value={SITE.email} label="Press email" />
            <a
              href={SITE.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition-colors hover:border-brand-electric/60 hover:bg-white/10"
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/70">WhatsApp &amp; desk</span>
              <span className="font-mono text-[12px]">{SITE.campaignDeskPhone}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-electric-bright">Chat</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── CORE DOWNLOADS ───────────────────────────────────── */}
      <section id="downloads" className="scroll-mt-24 bg-white py-14 sm:py-16">
        <div className="container-site">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-kicker">Download centre</p>
              <h2 className="section-title">Start with the approved kit</h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-brand-gray">
              One PDF for the full story, one card for the phone, one text file for the desk.
              No request form, no email gate.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {DOWNLOADS.map((d) => {
              const accent = ACCENT[d.accent];
              return (
                <a
                  key={d.title}
                  href={d.href}
                  download
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-electric/40 hover:shadow-xl hover:shadow-brand-navy/10"
                >
                  <span className={`absolute inset-x-0 top-0 h-1 ${accent.bar}`} aria-hidden />
                  <div className="flex items-start justify-between gap-3">
                    <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${accent.icon}`}>
                      <DownloadIcon name={d.icon} />
                    </span>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${accent.chip}`}>
                      {d.format}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-extrabold text-brand-navy">{d.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-gray">{d.description}</p>
                  <p className="mt-4 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-emerald-dark">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-emerald" aria-hidden />
                    {d.note}
                  </p>
                  <span className="mt-5 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-brand-navy px-4 text-sm font-bold text-white transition-colors group-hover:bg-brand-electric">
                    Download {d.format.split(' · ')[0]}
                    <span aria-hidden>↓</span>
                  </span>
                  <span className="mt-3 border-t border-[#E2E8F0] pt-3 text-[10px] font-medium tracking-wide text-brand-gray">
                    {websiteLabel} · {SITE.email}
                  </span>
                </a>
              );
            })}
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl bg-brand-navy p-5 text-white sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-electric font-display text-lg font-extrabold text-brand-navy">
                  22
                </span>
                <div>
                  <p className="font-display text-lg font-bold">The share pack: 22 ready-to-post designs</p>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/70">
                    Stickers and badges for WhatsApp, Instagram, X and ward groups. Take them one at a
                    time or grab the whole ZIP — no email gate.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <a
                  href="#share-pack"
                  className="inline-flex min-h-[46px] items-center justify-center rounded-lg border border-white/25 px-4 text-xs font-bold text-white transition-colors hover:bg-white/10"
                >
                  Browse all 22
                </a>
                <a href={SHARE_PACK_ZIP} download className="btn-primary min-h-[46px] !px-4 text-xs">
                  Download ZIP <span aria-hidden>↓</span>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-brand-electric/20 bg-brand-electric-light p-5 sm:flex-row sm:items-center">
            <div>
              <p className="font-display text-base font-bold text-brand-navy">Need a bespoke quote, a high-res portrait or a comment?</p>
              <p className="mt-1 text-sm text-brand-gray">
                The press desk answers media requests directly. Include your outlet and deadline.
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
              <a href={`mailto:${SITE.email}`} className="btn-primary min-h-[46px] !px-4 text-xs">Email the press desk</a>
              <a href="tel:+2348034005708" className="btn-secondary min-h-[46px] !px-4 text-xs">Call the desk</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGOS ────────────────────────────────────────────── */}
      <section className="bg-brand-navy-light py-14 sm:py-16">
        <div className="container-site">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-kicker">Brand marks</p>
              <h2 className="section-title">Logos &amp; campaign lockups</h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-brand-gray">
              Use the marks unaltered. Keep clear space around the lockup and never stretch, recolour
              or crop the candidate&apos;s likeness.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl bg-black shadow-[0_24px_60px_rgba(3,7,18,0.28)] lg:grid lg:grid-cols-[1.2fr_0.8fr]">
            <div className="flex min-h-[240px] items-center justify-center p-6 sm:p-8">
              <Image
                src="/images/logos/ola-western-monogram-orange.webp"
                alt="Ola Western metallic OW monogram with a green, blue and electric-orange light accent"
                width={1200}
                height={800}
                sizes="(max-width: 1024px) 100vw, 640px"
                className="h-auto w-full max-w-[560px] object-contain"
              />
            </div>
            <div className="border-t border-white/10 p-6 sm:p-8 lg:border-l lg:border-t-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-electric-bright">The monogram</p>
              <h3 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white">
                OW, lit in campaign colours
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Brushed silver with neon green and electric blue, finished with the campaign&apos;s
                orange accent. Built for dark title cards, social avatars and event screens.
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-xs">
                <div>
                  <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/50">Format</dt>
                  <dd className="mt-0.5 font-semibold text-white">PNG</dd>
                </div>
                <div>
                  <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/50">Canvas</dt>
                  <dd className="mt-0.5 font-semibold text-white">1536 × 1024</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/50">Best on</dt>
                  <dd className="mt-0.5 font-semibold text-white">Dark backgrounds · keep clear space</dd>
                </div>
              </dl>
              <a
                href="/images/logos/ola-western-monogram-orange.png"
                download
                className="btn-primary mt-5 w-full min-h-[46px] text-xs"
              >
                Download the monogram <span aria-hidden>↓</span>
              </a>
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LOGOS.map((logo) => (
              <div key={logo.file} className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
                <div className="flex aspect-square items-center justify-center bg-white p-6">
                  <Image
                    src={logo.file}
                    alt={`${logo.name} — OlaWestern campaign`}
                    width={1024}
                    height={1024}
                    sizes="(max-width: 768px) 100vw, 360px"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="border-t border-[#E2E8F0] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-base font-bold text-brand-navy">{logo.name}</h3>
                    <span className="rounded-full bg-brand-navy-light px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-brand-navy">
                      PNG · 1024
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-brand-gray">{logo.description}</p>
                  <a
                    href={logo.file}
                    download
                    className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border-2 border-brand-navy px-3 text-xs font-bold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
                  >
                    Download logo <span aria-hidden>↓</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL GRAPHICS ──────────────────────────────────── */}
      <section className="bg-white py-14 sm:py-16">
        <div className="container-site">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-kicker">Shareable media</p>
              <h2 className="section-title">Graphics for the timeline</h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-brand-gray">
              Download and share. Pair each graphic with the campaign website so every repost leads
              back to the record.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SOCIAL_GRAPHICS.map((graphic) => (
              <div key={graphic.file} className="group overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
                <div className="relative aspect-[4/5] overflow-hidden bg-brand-navy-light">
                  <Image
                    src={graphic.file}
                    alt={graphic.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 380px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-base font-bold text-brand-navy">{graphic.name}</h3>
                  <p className="mt-1 text-xs text-brand-gray">JPG · share to WhatsApp, Instagram or X.</p>
                  <div className="mt-4 flex gap-2">
                    <a
                      href={graphic.file}
                      download
                      className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-brand-electric px-3 text-xs font-bold text-brand-navy shadow-[0_4px_14px_rgba(255,87,34,0.25)] hover:bg-brand-electric-dark hover:text-white"
                    >
                      Download <span aria-hidden>↓</span>
                    </a>
                    <span className="inline-flex min-h-[44px] items-center rounded-lg bg-brand-navy-light px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-navy">
                      {websiteLabel}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHARE PACK ───────────────────────────────────────── */}
      <section id="share-pack" className="scroll-mt-24 bg-brand-navy py-14 text-white sm:py-16">
        <div className="container-site">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-kicker">Share pack · 22 designs</p>
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Take the message everywhere.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
                Stickers and badges for WhatsApp status, Instagram, X and ward groups. Tap any design
                to download the full-resolution PNG, or take the complete pack in one ZIP.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
                22 PNG · ZIP 4.8 MB
              </span>
              <a href={SHARE_PACK_ZIP} download className="btn-primary min-h-[46px] text-xs">
                Download all 22 <span aria-hidden>↓</span>
              </a>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {SHARE_PACK.map((asset) => (
              <a
                key={asset.id}
                href={asset.file}
                download
                aria-label={`Download ${asset.title} — ${asset.kind} PNG`}
                className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white shadow-[0_10px_30px_rgba(3,7,18,0.22)] transition-all hover:-translate-y-0.5 hover:border-brand-electric/70 hover:shadow-[0_18px_40px_rgba(3,7,18,0.35)]"
              >
                <div className="flex h-36 shrink-0 items-center justify-center overflow-hidden bg-white p-2.5 sm:h-40 sm:p-3 lg:h-44">
                  <Image
                    src={asset.thumb}
                    alt={`${asset.title} — Ola Western campaign ${asset.kind.toLowerCase()}`}
                    width={asset.width}
                    height={asset.height}
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 280px"
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#E2E8F0] px-3 py-2.5 sm:px-4 sm:py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand-navy">
                      {asset.title}
                    </p>
                    <p className="mt-0.5 text-[10px] text-brand-gray">
                      PNG · {asset.width}×{asset.height}
                    </p>
                  </div>
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-electric text-sm font-bold text-brand-navy transition-colors group-hover:bg-brand-navy group-hover:text-white"
                    aria-hidden
                  >
                    ↓
                  </span>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:flex-row sm:items-center">
            <p className="max-w-2xl text-xs leading-relaxed text-white/70">
              Keep the marks intact, credit <span className="font-semibold text-white">OlaWestern Campaign Organization</span>{' '}
              and pair every repost with{' '}
              <a href={SITE.siteUrl} className="font-semibold text-brand-electric-bright underline underline-offset-2">
                {websiteLabel}
              </a>
              . No invented endorsement.
            </p>
            <a href={SHARE_PACK_ZIP} download className="btn-primary min-h-[46px] shrink-0 text-xs">
              Get the ZIP <span aria-hidden>↓</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── PRESS RELEASES ───────────────────────────────────── */}
      <section className="bg-brand-navy-light py-14 sm:py-16">
        <div className="container-site">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-kicker">Newsroom</p>
              <h2 className="section-title">Official statements</h2>
            </div>
            <Link href="/news" className="btn-secondary min-h-[46px] !px-5 text-xs">Open the newsroom</Link>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
            {items.length === 0 ? (
              <p className="p-6 text-sm text-brand-gray">
                Statements are being prepared. For an immediate comment, email {SITE.email}.
              </p>
            ) : (
              <ul className="divide-y divide-[#E2E8F0]">
                {items.map((item) => (
                  <li key={item.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-electric-dark">
                        {fmtDate(item.published_at)}
                      </p>
                      <h3 className="mt-1 font-display text-base font-bold leading-snug text-brand-navy">{item.title}</h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-brand-gray">{item.summary}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {item.pdf_url ? (
                        <a href={item.pdf_url} download className="btn-primary min-h-[44px] !px-4 text-xs">PDF ↓</a>
                      ) : null}
                      <Link href="/news" className="inline-flex min-h-[44px] items-center rounded-lg border border-[#E2E8F0] px-4 text-xs font-bold text-brand-navy hover:border-brand-electric hover:text-brand-electric-dark">
                        Read release <span aria-hidden className="ml-1">→</span>
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="mt-3 text-xs text-brand-gray">
            Print-ready PDF bundles are available on request from{' '}
            <a className="font-semibold text-brand-electric-dark underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </p>
        </div>
      </section>

      {/* ── USAGE RULES / PRESS CONTACT ──────────────────────── */}
      <section className="bg-brand-navy py-14 text-white sm:py-16">
        <div className="container-site grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div>
            <p className="section-kicker">Use of assets</p>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Credit the campaign. Keep the record intact.
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { t: 'Credit the source', b: `Use “OlaWestern Campaign Organization” and link to ${websiteLabel}.` },
                { t: 'Do not alter marks', b: 'No recolouring, cropping or editing the candidate’s likeness.' },
                { t: 'No invented endorsement', b: 'Do not imply endorsement by an outlet, agency or person.' },
              ].map((r, i) => (
                <div key={r.t} className="rounded-xl border border-white/10 bg-white/[0.05] p-4">
                  <span className="font-display text-xs font-extrabold text-brand-electric-bright">0{i + 1}</span>
                  <p className="mt-1 text-sm font-bold text-white">{r.t}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/75">{r.b}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-brand-electric/40 bg-brand-navy-deep p-6 shadow-[0_24px_60px_rgba(3,7,18,0.35)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-emerald">Press desk</p>
            <p className="mt-2 font-display text-xl font-extrabold">Media &amp; partnerships</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/65">Email</dt>
                <dd><a className="break-all font-semibold text-white hover:text-brand-electric-bright" href={`mailto:${SITE.email}`}>{SITE.email}</a></dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/65">Website</dt>
                <dd><a className="font-semibold text-white hover:text-brand-electric-bright" href={SITE.siteUrl}>{websiteLabel}</a></dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/65">Desk</dt>
                <dd><a className="font-semibold text-white hover:text-brand-electric-bright" href="tel:+2348034005708">{SITE.campaignDeskPhone}</a></dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/65">HQ</dt>
                <dd className="leading-relaxed text-white/70">{SITE.hq}</dd>
              </div>
            </dl>
            <a
              href={`mailto:${SITE.email}?subject=Media%20request%20—%20OlaWestern%202027`}
              className="btn-primary mt-5 w-full"
            >
              Email the press desk <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
