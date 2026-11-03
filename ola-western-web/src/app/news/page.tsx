import type { Metadata } from 'next';
import Link from 'next/link';
import { listPress } from '@/lib/store';
import VideoShelf from '@/components/ui/VideoShelf';
import { SITE } from '@/lib/content';
import type { PressItem, PressSource } from '@/types';

export const metadata: Metadata = {
  title: 'Newsroom — Live Community Newsfeed',
  description:
    'Official press releases, community coverage and rapid-response statements from the Ola Western campaign — FESTAC Town, Mile 2 and Amuwo-Odofin Constituency I.',
};

export const revalidate = 900;

const SOURCE_BADGE: Record<PressSource, { label: string; className: string }> = {
  campaign_hq: { label: 'Campaign HQ · 32 Road', className: 'bg-brand-green-light text-brand-green' },
  festaconline: { label: 'Community Press', className: 'bg-brand-blue/10 text-brand-blue-dark' },
  partner_press: { label: 'Partner Statement', className: 'bg-brand-gold/15 text-amber-700' },
};

function fmtDate(iso: string | null): string {
  const d = new Date(iso ?? Date.now());
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function NewsPage() {
  // Offline releases stay in the CMS but must not appear on the public newsfeed.
  const items = await listPress({ publishedOnly: true });

  return (
    <>
      <section className="hero-gradient">
        <div className="container-site py-16 text-center">
          <p className="section-kicker !bg-white/10 !text-brand-green-light">Live Community Newsfeed</p>
          <h1 className="hero-title">The Newsroom</h1>
          <p className="mx-auto mt-4 max-w-2xl text-brand-green-light">
            Every official statement from {SITE.hq}, curated community coverage of Constituency I,
            and rapid-response notes — published only after executive review.
          </p>
        </div>
      </section>

      <section className="container-site py-14">
        <div className="space-y-6">
          {items.map((item) => {
            const badge = SOURCE_BADGE[item.source] ?? SOURCE_BADGE.campaign_hq;
            return (
              <article key={item.id} className="card !p-0 overflow-hidden">
                <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${badge.className}`}>
                        {badge.label}
                      </span>
                      <time className="text-xs font-semibold text-gray-600" dateTime={item.published_at ?? undefined}>
                        {fmtDate(item.published_at)}
                      </time>
                    </div>
                    <h2 className="font-display text-xl font-bold leading-snug text-brand-dark" data-ow={`press.${item.id}.title`} data-ow-label="Release headline">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-brand-gray" data-ow={`press.${item.id}.summary`} data-ow-label="Standfirst">{item.summary}</p>
                    <p className="mt-3 line-clamp-2 text-sm text-gray-500" data-ow={`press.${item.id}.body`} data-ow-label="Release body">{item.body}</p>
                  </div>
                  <a
                    href={item.pdf_url ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-ow={`press.${item.id}.pdf_url`}
                    data-ow-label="Release PDF link"
                    data-ow-value={item.pdf_url ?? ''}
                    {...(item.pdf_url ? {} : { 'data-ow-missing': '1' })}
                    className={`btn-secondary shrink-0 !px-4 !py-2 text-xs ${item.pdf_url ? '' : '!text-white !border-transparent'}`}
                  >
                    {item.pdf_url ? 'Download PDF' : 'Attach the release PDF'}
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-brand-light px-6 py-5">
          <p className="text-sm text-brand-gray">
            Want a statement covered here? Send a tip or a question to the campaign media desk.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link href="/truth-room" className="btn-secondary !px-4 min-h-[44px] text-xs">Ask Ola</Link>
            <a href={SITE.whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-primary !px-4 min-h-[44px] text-xs">
              WhatsApp the Desk
            </a>
          </div>
        </div>
      </section>

      <VideoShelf
        className="bg-brand-light py-14"
        heading="Newsroom video"
        sub="Broadcast items the campaign has cleared for publication. The clip loads from the channel only when you press play."
      />
    </>
  );
}
