import type { Metadata } from 'next';
import Link from 'next/link';
import { listPress } from '@/lib/store';
import VideoShelf from '@/components/ui/VideoShelf';
import SocialShare from '@/components/ui/SocialShare';
import { SITE } from '@/lib/content';
import { formatPressDate, PRESS_BADGE, pressExcerpt, readingTime } from '@/lib/press';

export const metadata: Metadata = {
  title: 'Newsroom — Live Community Newsfeed',
  description:
    'Official press releases, community coverage and rapid-response statements from the Ola Western campaign — FESTAC Town, Mile 2 and Amuwo-Odofin Constituency I.',
  alternates: { canonical: '/news' },
};

export const revalidate = 900;

function isHttp(url: string | null | undefined): url is string {
  return !!url && /^https?:\/\//i.test(url);
}

export default async function NewsPage() {
  // Offline releases stay in the CMS but must not appear on the public newsfeed.
  const items = await listPress({ publishedOnly: true });

  return (
    <>
      <section className="hero-gradient">
        <div className="container-site py-16 text-center">
          <p className="section-kicker !bg-white/10 !text-white/70">Live Community Newsfeed</p>
          <h1 className="hero-title">The Newsroom</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            Every official statement from {SITE.hq}, curated community coverage of Constituency I,
            and rapid-response notes — published only after executive review.
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-white/50">
            {items.length} {items.length === 1 ? 'release' : 'releases'} on the record
          </p>
        </div>
      </section>

      <section className="container-site py-14">
        <div className="space-y-6">
          {items.map((item) => {
            const badge = PRESS_BADGE[item.source] ?? PRESS_BADGE.campaign_hq;
            const excerpt = pressExcerpt(item.body);
            const pdf = isHttp(item.pdf_url) ? item.pdf_url : null;
            const showBody = excerpt.text && excerpt.text !== item.summary.trim();

            return (
              <article key={item.id} className="card !p-0 overflow-hidden">
                <div className="p-6 sm:p-7">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${badge.className}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs font-semibold text-gray-600">
                      <time dateTime={item.published_at ?? undefined}>{formatPressDate(item.published_at)}</time>
                      {' · '}
                      <span className="text-gray-500">{readingTime(item.body)}</span>
                    </span>
                  </div>

                  <h2 className="font-display text-xl font-bold leading-snug text-brand-dark sm:text-2xl">
                    <Link
                      href={`/news/${item.slug}`}
                      className="transition-colors hover:text-brand-green"
                      data-ow={`press.${item.id}.title`}
                      data-ow-label="Release headline"
                    >
                      {item.title}
                    </Link>
                  </h2>

                  <p
                    className="mt-2 text-sm leading-relaxed text-brand-gray"
                    data-ow={`press.${item.id}.summary`}
                    data-ow-label="Standfirst"
                  >
                    {item.summary}
                  </p>

                  {showBody && (
                    <p
                      className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600"
                      data-ow={`press.${item.id}.body`}
                      data-ow-label="Release body"
                    >
                      {excerpt.text}
                      {excerpt.truncated ? (
                        <Link
                          href={`/news/${item.slug}`}
                          className="ml-1 font-semibold text-brand-green underline underline-offset-2"
                        >
                          Read the full release →
                        </Link>
                      ) : null}
                    </p>
                  )}

                  <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="opacity-90">
                      <SocialShare title={item.title} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {pdf && (
                        <a
                          href={pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-ow={`press.${item.id}.pdf_url`}
                          data-ow-label="Release PDF link"
                          data-ow-value={item.pdf_url ?? ''}
                          className="btn-secondary min-h-[44px] !px-4 !py-2 text-xs"
                        >
                          Download PDF
                        </a>
                      )}
                      <Link href={`/news/${item.slug}`} className="btn-primary min-h-[44px] !px-5 !py-2 text-xs">
                        Read the full release →
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {items.length === 0 && (
          <p className="rounded-2xl bg-white px-5 py-12 text-center text-sm text-brand-gray shadow-sm">
            No releases are live yet. Approved statements will appear here.
          </p>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-brand-light px-6 py-5">
          <p className="text-sm text-brand-gray">
            Want a statement covered here? Send a tip or a question to the campaign media desk.
            {' '}
            <Link href="/impact#sources" className="font-bold text-brand-green underline underline-offset-2">
              Browse every source in the evidence library
            </Link>
            .
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
