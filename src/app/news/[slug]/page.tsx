import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SocialShare from '@/components/ui/SocialShare';
import { SITE } from '@/lib/content';
import { formatPressDate, PRESS_BADGE, readingTime } from '@/lib/press';
import { getPressBySlug, listPress } from '@/lib/store';

export const revalidate = 900;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const releases = await listPress({ publishedOnly: true });
  return releases.map((release) => ({ slug: release.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const release = await getPressBySlug(slug);
  if (!release) return { title: 'Release not found' };

  const path = `/news/${release.slug}`;
  return {
    title: release.title,
    description: release.summary,
    alternates: { canonical: path },
    openGraph: {
      title: release.title,
      description: release.summary,
      url: `${SITE.siteUrl}${path}`,
      type: 'article',
      publishedTime: release.published_at ?? undefined,
    },
  };
}

function isHttp(url: string | null | undefined): url is string {
  return !!url && /^https?:\/\//i.test(url);
}

export default async function PressReleasePage({ params }: PageProps) {
  const { slug } = await params;
  const [release, all] = await Promise.all([getPressBySlug(slug), listPress({ publishedOnly: true })]);

  if (!release) notFound();

  const badge = PRESS_BADGE[release.source] ?? PRESS_BADGE.campaign_hq;
  const paragraphs = release.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const more = all.filter((item) => item.slug !== release.slug).slice(0, 3);
  const pdf = isHttp(release.pdf_url) ? release.pdf_url : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: release.title,
    description: release.summary,
    datePublished: release.published_at,
    dateModified: release.published_at,
    mainEntityOfPage: `${SITE.siteUrl}/news/${release.slug}`,
    author: { '@type': 'Organization', name: `${SITE.brandName} Campaign Media Desk` },
    publisher: { '@type': 'Organization', name: SITE.brandName },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Serialised from typed fields; escaping the angle bracket keeps the
        // payload inert even if a CMS title ever contains markup.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <section className="hero-gradient">
        <div className="container-site py-12 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/news"
              className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white"
            >
              <span aria-hidden>←</span> The Newsroom
            </Link>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${badge.className}`}>
                {badge.label}
              </span>
              <time className="text-xs font-semibold text-white/60" dateTime={release.published_at ?? undefined}>
                {formatPressDate(release.published_at)}
              </time>
              <span className="text-xs font-semibold text-white/60">· {readingTime(release.body)}</span>
            </div>

            <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              {release.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">{release.summary}</p>
          </div>
        </div>
      </section>

      <section className="container-site py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <article className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-10">
            <div className="space-y-5 text-[15px] leading-[1.85] text-brand-dark sm:text-base">
              {paragraphs.map((paragraph, i) => (
                <p key={i} className="whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-gray">
                Filed by the {SITE.brandName} media desk · {SITE.hq}
              </p>
              {pdf && (
                <a
                  href={pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary min-h-[44px] !px-4 !py-2 text-xs"
                >
                  Download the release PDF
                </a>
              )}
            </div>
          </article>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-brand-light px-5 py-4">
            <SocialShare title={release.title} />
            <Link href="/news" className="text-sm font-bold text-brand-green underline underline-offset-2">
              All releases
            </Link>
          </div>

          {more.length > 0 && (
            <aside className="mt-12">
              <h2 className="font-display text-xl font-bold text-brand-navy">More from the newsroom</h2>
              <ul className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
                {more.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/news/${item.slug}`}
                      className="flex min-h-[64px] flex-wrap items-center justify-between gap-2 px-5 py-4 transition hover:bg-brand-light"
                    >
                      <span className="min-w-0 text-sm font-semibold text-brand-dark">{item.title}</span>
                      <span className="text-xs font-semibold text-brand-gray">{formatPressDate(item.published_at)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          <div className="mt-10 rounded-2xl bg-brand-navy p-6 text-center sm:p-8">
            <p className="text-sm text-white/70">
              Have a question about this release, or a community issue the record should answer?
            </p>
            <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/truth-room" className="btn-accent min-h-[44px] justify-center text-xs">
                Ask the Truth Room
              </Link>
              <a
                href={SITE.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary min-h-[44px] justify-center !border-white/30 text-xs !text-white hover:!bg-white/10"
              >
                WhatsApp the Desk
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
