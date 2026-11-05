import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import RecordLedger from '@/components/impact/RecordLedger';
import ReferenceLibrary from '@/components/impact/ReferenceLibrary';
import SlotImage from '@/components/ui/SlotImage';
import SocialShare from '@/components/ui/SocialShare';
import { listAccomplishments, listReferences } from '@/lib/store';
import { slots } from '@/lib/slots';


export const metadata: Metadata = {
  title: 'Track Record & Community Impact',
  description:
    'The verified record of service of Hon. Ola Western across Festac I, Festac II, Festac III and Mile 2 — years of work in the community before ever seeking office, with every achievement linked to its published press source.',
};

export const revalidate = 3600;

export default async function ImpactPage() {
  const [accomplishments, s, references] = await Promise.all([listAccomplishments(), slots(), listReferences()]);

  return (
    <>
      <section className="hero-gradient">
        <div className="container-site py-16 text-center">
          <p className="section-kicker !bg-white/10 !text-brand-green-light">Before He Sought Office</p>
          <h1 className="hero-title">The Record of Service</h1>
          <p className="mx-auto mt-4 max-w-2xl text-brand-green-light">
            Years of showing up in FESTAC Town and Mile 2 — roads, youth, security and quiet
            philanthropy — long before a ballot was printed. Every entry below is verifiable.
          </p>
        </div>
      </section>



      {/* ── THE WORK, IN PICTURES ────────────────────────────── */}
      <section className="container-site pb-14">
        <p className="section-kicker">Documented</p>
        <h2 className="section-title">The work, in pictures</h2>
        <p className="mt-2 max-w-2xl text-sm text-brand-gray">
          Press photographs of the projects above — credited to the outlet that published them.
        </p>
        <div className="mt-4">
          <SocialShare title="The Work, in Pictures" />
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {['drainage-work', 'boreholes-water', 'food-fest', 'form-pickup'].map((slot) => (
            <SlotImage key={slot} slots={s} slot={slot} reuse />
          ))}
        </div>
      </section>

      {/* ── SERVICE RECORD LEDGER (filterable) ───────────────── */}
      <section className="bg-brand-light py-14">
        <div className="container-site">
          <p className="section-kicker">Ledger of Service</p>
          <h2 className="section-title">Every contribution, categorized &amp; verifiable</h2>
          <div className="mt-4">
            <SocialShare title="Ledger of Service" />
          </div>
          <RecordLedger items={accomplishments} />
        </div>
      </section>

      {/* ── PRESS & PUBLIC SOURCES LIBRARY ───────────────────── */}
      <section id="sources" className="container-site py-14">
        <p className="section-kicker">Don&rsquo;t Take Our Word for It</p>
        <h2 className="section-title">The public record, source by source</h2>
        <ReferenceLibrary links={references} />
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="container-site py-14 text-center">
        <h2 className="section-title text-2xl sm:text-3xl">A record that speaks — now read the plan.</h2>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <Link href="/blueprint" className="btn-primary">The Legislative Blueprint</Link>
          <Link href="/join" className="btn-secondary">Join the Movement</Link>
        </div>
      </section>
    </>
  );
}