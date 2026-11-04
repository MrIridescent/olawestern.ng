/**
 * VideoShelf — the broadcast section.
 *
 * Reads the published video library straight from the store, so a clip added in
 * the CMS appears on the homepage and in the newsroom without a redeploy. The
 * first featured clip plays large; the rest sit in a grid, each with a direct
 * YouTube link as well for visitors whose connection cannot load an embed.
 */
import { listVideos } from '@/lib/store';
import VideoEmbed from './VideoEmbed';

interface Props {
  heading?: string;
  sub?: string;
  limit?: number;
  /** Hide the section entirely when the library is empty. */
  hideWhenEmpty?: boolean;
  className?: string;
}

export default async function VideoShelf({
  heading = 'Watch the campaign',
  sub = 'Broadcast coverage of Ola Western — played from the channels that filmed it.',
  limit = 7,
  hideWhenEmpty = true,
  className = '',
}: Props) {
  const videos = await listVideos({ publishedOnly: true });
  if (!videos.length && hideWhenEmpty) return null;
  const shown = videos.slice(0, limit);
  const [lead, ...rest] = shown;

  return (
    <section id="videos" className={`scroll-mt-24 ${className}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-brand-green-dark sm:text-3xl">{heading}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-brand-gray">{sub}</p>
          </div>
          <p className="text-xs text-gray-600">{shown.length} clip{shown.length === 1 ? '' : 's'}</p>
        </div>

        {lead ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <VideoEmbed youtubeId={lead.youtube_id} title={lead.title} outlet={lead.outlet} priority />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1">
                <p className="text-xs text-brand-gray">{lead.outlet ?? 'Campaign video'}</p>
                <a
                  href={`https://www.youtube.com/watch?v=${lead.youtube_id}`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="min-h-[40px] text-[11px] font-semibold uppercase tracking-wider text-brand-blue underline underline-offset-4"
                >
                  Watch on YouTube
                </a>
              </div>
            </div>
            {rest.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:col-span-1">
                {rest.slice(0, 2).map((v) => (
                  <div key={v.id}>
                    <VideoEmbed youtubeId={v.youtube_id} title={v.title} outlet={v.outlet} />
                    <div className="mt-2 px-1">
                      <p className="text-xs text-brand-gray">{v.outlet ?? 'Campaign video'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {shown.length > 3 && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.slice(3).map((v) => (
              <div key={v.id}>
                <VideoEmbed youtubeId={v.youtube_id} title={v.title} outlet={v.outlet} />
                <div className="mt-2 px-1">
                  <p className="text-xs text-brand-gray">{v.outlet ?? 'Campaign video'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
