import type { Metadata } from 'next';
import Link from 'next/link';
import GalleryCarousel from '@/components/ui/GalleryCarousel';
import PhotoSlot from '@/components/ui/PhotoSlot';
import SocialLinksRow from '@/components/ui/SocialLinks';
import VideoShelf from '@/components/ui/VideoShelf';
import { MEDIA_SLOTS, SITE } from '@/lib/content';
import { listSocials } from '@/lib/store';
import { ratioFor, slots } from '@/lib/slots';

export const metadata: Metadata = {
  title: 'Gallery — Photos, Events & Media Kit',
  description:
    'Campaign photography and broadcast video from FESTAC Town and Mile 2 — town halls, street inspections, youth tournaments, market engagements — plus the press media kit for Amuwo-Odofin Constituency I.',
};

export const revalidate = 3600;

export default async function GalleryPage() {
  const [s, socials] = await Promise.all([slots(), listSocials()]);
  const photos = s.slides();
  const wall = photos;

  return (
    <>
      <section className="hero-gradient">
        <div className="container-site py-14 text-center">
          <p className="section-kicker !bg-white/10 !text-brand-green-light">On The Ground</p>
          <h1 className="hero-title">Campaign Gallery</h1>
          <p className="mx-auto mt-4 max-w-2xl text-brand-green-light">
            Town halls, street inspections, markets and youth tournaments across Festac I–III and Mile 2.
          </p>
        </div>
      </section>

      {/* ── CAROUSEL ─────────────────────────────────────────── */}
      <section className="container-site py-12">
        {wall.length ? <GalleryCarousel slides={wall} className="shadow-2xl" /> : null}
        <p className="mt-4 text-center text-xs text-gray-600">
          {photos.length} published photo{photos.length === 1 ? '' : 's'} from the campaign archive. Swipe,
          use the arrow keys, or tap the dots.
        </p>
      </section>

      {/* ── PHOTO GRID ───────────────────────────────────────── */}
      <section className="container-site pb-14">
        <h2 className="section-title text-2xl">From the ground</h2>
        <p className="mt-2 text-sm text-brand-gray">
          Campaign photography from events across Festac I–III and Mile 2, each frame matched to the shape of
          the space it fills. Press images are credited to the outlet that took them and link to the report they
          ran in. Every image published here is real campaign documentation — no AI-generated images of the
          candidate are used anywhere on this site.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {wall.map((g) => (
            <PhotoSlot
              key={g.id}
              src={g.src}
              alt={g.alt}
              slot={g.slot}
              caption={g.caption}
              credit={g.credit}
              href={g.href}
              ratio={ratioFor(g.slot)}
              // These tiles repeat the published photo set; they are not the site's
              // named frames. Tap edits this photo's own caption/credit row, and one
              // picture filling six tiles must not offer to rebind the frame twice.
              editable={false}
              mediaId={g.id}
            />
          ))}
        </div>
      </section>

      {/* ── BROADCAST VIDEO ──────────────────────────────────── */}
      <VideoShelf
        className="bg-brand-light py-14"
        heading="On the broadcast"
        sub="Television coverage of the campaign, played from the channel that filmed it. Nothing loads from Google until you press play."
      />

      {/* ── MEDIA / PRESS KIT ────────────────────────────────── */}
      <section className="py-14">
        <div className="container-site">
          <p className="section-kicker">For Journalists</p>
          <h2 className="section-title text-2xl">Press & media desk</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {MEDIA_SLOTS.map((m) => (
              <div key={m.title} className="card flex flex-col">
                <h3 className="font-display text-base font-bold text-brand-green">{m.title}</h3>
                <p className="mt-2 flex-1 text-sm text-brand-gray">{m.body}</p>
                <a href={m.href} className="mt-4 inline-block min-h-[44px] text-sm font-bold text-brand-blue underline">
                  {m.cta} →
                </a>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white px-6 py-5 ring-1 ring-gray-100">
            <div>
              <p className="font-display text-base font-bold">Follow the campaign daily</p>
              <p className="text-sm text-brand-gray">The campaign’s official channels, straight from 32 Road HQ.</p>
            </div>
            <SocialLinksRow socials={socials} />
          </div>
          <p className="mt-6 text-center text-sm text-brand-gray">
            Press enquiries: <a className="font-semibold text-brand-green underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>
            {' '}· <Link href="/truth-room" className="font-semibold text-brand-green">Ask Ola / verify a rumor</Link>
          </p>
        </div>
      </section>
    </>
  );
}
