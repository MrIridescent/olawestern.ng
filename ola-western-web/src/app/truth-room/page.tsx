import type { Metadata } from 'next';
import AskOlaForm from '@/components/forms/AskOlaForm';
import FactCard from '@/components/truth/FactCard';
import TruthLedger from '@/components/truth/TruthLedger';
import { listFactChecks } from '@/lib/store';
import SlotImage from '@/components/ui/SlotImage';
import { slots } from '@/lib/slots';

export const metadata: Metadata = {
  title: 'Truth Room — Fact Check & Reputation Defense',
  description:
    'The official fact-checking desk of the Ola Western campaign: verified facts, debunked claims, press releases, and the Ask Ola submission channel.',
};

export const revalidate = 900;

export default async function TruthRoomPage() {
  const [facts, media] = await Promise.all([listFactChecks(), slots()]);
  const featured = facts.filter((f) => f.is_featured);

  return (
    <>
      <section className="hero-gradient">
        <div className="container-site py-16 text-center">
          <p className="section-kicker !bg-white/10 !text-brand-green-light">Reputation Defense Desk</p>
          <h1 className="hero-title">The Truth Room</h1>
          <p className="mx-auto mt-4 max-w-2xl text-brand-green-light">
            Every claim checked. Every rumor answered with evidence. Press releases and official
            statements from the campaign office at 32 Road, FESTAC Town.
          </p>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="container-site pt-14">
          <h2 className="section-title text-2xl">Featured rulings</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {featured.map((f) => <FactCard key={f.id} fact={f} />)}
          </div>
        </section>
      )}

      <section className="container-site py-14">
        <h2 className="section-title text-2xl">The fact-check ledger</h2>
        <p className="mt-2 text-sm text-brand-gray">
          Search every ruling by keyword or verdict. Entries are published by the media desk from
          the campaign CMS and the AI War Room sync — always after executive approval.
        </p>
        <TruthLedger facts={facts} />
      </section>

      {/* What the record looks like when it is photographed and published. */}
      <section className="container-site pb-14">
        <p className="section-kicker">Evidence</p>
        <h2 className="section-title text-2xl">Documented, dated and credited</h2>
        <p className="mt-2 max-w-2xl text-sm text-brand-gray">
          Press photographs of the events the campaign stands on — each one carries the outlet that took it
          and the report it ran in, so a claim can be checked instead of argued about.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <SlotImage slots={media} slot="consensus" reuse />
          <SlotImage slots={media} slot="primary-night" reuse />
        </div>
      </section>

      <section className="bg-brand-light py-14">
        <div className="container-site grid gap-8 lg:grid-cols-2">
          <div>
            <p className="section-kicker">Ask Ola</p>
            <h2 className="section-title text-2xl">Submit a question or report a rumor</h2>
            <p className="mt-3 text-sm text-brand-gray">
              Heard something circulating on WhatsApp or Nairaland? Send it to the campaign media
              team — every submission is reviewed and, when significant, published here with sources.
            </p>
            <div className="card mt-6 space-y-3">
              <h3 className="font-display text-base font-bold text-brand-green">Official documents</h3>
              <p className="text-sm text-brand-gray">
                Press releases and executive statements issued from 32 Road HQ are attached to their
                rulings in the ledger above.
              </p>
              <ul className="space-y-2">
                {facts
                  .filter((f) => f.official_document_url)
                  .slice(0, 4)
                  .map((f) => (
                    <li key={f.id}>
                      <a href={f.official_document_url!} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand-blue underline">
                        {f.claim_summary}
                      </a>
                    </li>
                  ))}
                {!facts.some((f) => f.official_document_url) && (
                  <li className="text-sm text-gray-600">Documents appear here as the media desk attaches them.</li>
                )}
              </ul>
            </div>
          </div>
          <AskOlaForm />
        </div>
      </section>
    </>
  );
}
