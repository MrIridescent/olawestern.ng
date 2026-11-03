import type { FactCheck } from '@/types';

const VERDICT_STYLE: Record<FactCheck['verdict'], string> = {
  'VERIFIED FACT': 'verdict-verified',
  'FALSE CLAIM': 'verdict-false',
  MISLEADING: 'verdict-misleading',
};

export default function FactCard({ fact }: { fact: FactCheck }) {
  return (
    <article className="card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${VERDICT_STYLE[fact.verdict]}`}
          data-ow={`fact.${fact.id}.verdict`}
          data-ow-label="Verdict"
          /* The badge reads "FALSE CLAIM — DEBUNKED"; the stored verdict does not. */
          data-ow-value={fact.verdict}
        >
          {fact.verdict === 'FALSE CLAIM' ? 'FALSE CLAIM — DEBUNKED' : fact.verdict}
        </span>
        {fact.is_featured && (
          <span className="rounded-full border border-brand-gold/60 px-3 py-1 text-[11px] font-bold uppercase text-brand-gold">
            Featured
          </span>
        )}
      </div>
      <h3 className="font-display text-lg font-bold leading-snug" data-ow={`fact.${fact.id}.claim_summary`} data-ow-label="The claim">
        {fact.claim_summary}
      </h3>
      <p className="text-sm leading-relaxed text-brand-gray" data-ow={`fact.${fact.id}.detailed_explanation`} data-ow-label="The evidence">
        {fact.detailed_explanation}
      </p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-2 text-xs text-gray-600">
        <time dateTime={fact.created_at}>
          {new Date(fact.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
        </time>
        <a
          href={fact.official_document_url ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          data-ow={`fact.${fact.id}.official_document_url`}
          data-ow-label="Document that proves it"
          data-ow-value={fact.official_document_url ?? ''}
          {...(fact.official_document_url ? {} : { 'data-ow-missing': '1' })}
          className="font-semibold text-brand-blue underline"
        >
          {fact.official_document_url ? 'Read official document →' : 'Attach the document'}
        </a>
      </div>
    </article>
  );
}
