'use client';

import { useMemo, useState } from 'react';
import { SITE } from '@/lib/content';
import { STREET_ACTIONS, WARD_BRIEFS } from '@/lib/hq';
import { ISSUE_CATEGORIES, WARDS, type IssueCategory, type Ward } from '@/types';

/**
 * The Street Brief: two taps turn a ward and a priority into a concrete
 * three-step plan a resident can act on, copy or send to the ward desk.
 *
 * It is deliberately a generator, not a promise machine. Every line comes from
 * the published agenda and the open Help Desk process.
 */
export default function StreetBrief() {
  const [ward, setWard] = useState<Ward>('Festac I');
  const [priority, setPriority] = useState<IssueCategory>(WARD_BRIEFS['Festac I'].priority);
  const [copied, setCopied] = useState(false);

  const brief = WARD_BRIEFS[ward];
  const actions = STREET_ACTIONS[priority];

  const briefText = useMemo(() => {
    const lines = [
      `STREET BRIEF — ${ward}`,
      `Priority: ${priority}`,
      brief.headline,
      '',
      'Next three steps:',
      ...actions.map((a, i) => `${i + 1}. ${a}`),
      '',
      `Open-door: ${brief.townHall}`,
      `Desk: ${SITE.campaignDeskPhone} · ${SITE.email}`,
      SITE.siteUrl,
    ];
    return lines.join('\n');
  }, [actions, brief, priority, ward]);

  function chooseWard(next: Ward) {
    setWard(next);
    setPriority(WARD_BRIEFS[next].priority);
    setCopied(false);
  }

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(briefText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard permissions vary; the WhatsApp button remains the fallback.
    }
  }

  const whatsappHref = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
    `Hello ward desk, I am sending my Street Brief.\n\n${briefText}`,
  )}`;

  return (
    <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] shadow-[0_24px_80px_rgba(3,7,18,0.45)] backdrop-blur-xl">
      <div className="border-b border-white/10 bg-white/[0.04] px-5 py-4 sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-brand-electric/40 bg-brand-electric/15">
              <span className="h-2 w-2 rounded-full bg-brand-electric shadow-[0_0_12px_rgba(255,87,34,0.9)]" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange-bright">Street Brief generator</p>
              <p className="text-sm font-semibold text-white">Two taps. One plan for your street.</p>
            </div>
          </div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">No data stored until you send it</p>
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <fieldset>
            <legend className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">1 · Your ward</legend>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {WARDS.map((w) => {
                const active = ward === w;
                return (
                  <button
                    key={w}
                    type="button"
                    aria-pressed={active}
                    onClick={() => chooseWard(w)}
                    className={`min-h-[44px] rounded-xl border px-3 py-2 text-left text-[12px] font-semibold leading-snug transition-all ${
                      active
                        ? 'border-brand-electric bg-brand-electric text-brand-navy shadow-[0_6px_20px_rgba(255,87,34,0.35)]'
                        : 'border-white/15 bg-white/[0.04] text-white/80 hover:border-brand-electric/50 hover:bg-white/[0.08]'
                    }`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-5">
            <legend className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">2 · Your priority</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {ISSUE_CATEGORIES.map((c) => {
                const active = priority === c;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setPriority(c);
                      setCopied(false);
                    }}
                    className={`min-h-[40px] rounded-full border px-3.5 py-1.5 text-[11px] font-bold transition-colors ${
                      active
                        ? 'border-brand-emerald bg-brand-emerald/20 text-emerald-100'
                        : 'border-white/15 bg-transparent text-white/70 hover:border-white/35 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <p className="mt-5 rounded-xl border border-white/10 bg-brand-navy-deep/60 px-4 py-3 text-[11px] leading-relaxed text-white/65">
            The brief only repeats what the campaign has already published. If an action is not
            funded or scheduled yet, the wording says so.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-brand-electric/10 blur-2xl" aria-hidden />
          <div className="relative rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.12] to-white/[0.04] p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-emerald">Live brief</p>
                <h3 className="mt-1 font-display text-xl font-extrabold leading-snug text-white">{brief.headline}</h3>
              </div>
              <span className="rounded-full border border-white/20 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/70">
                {priority}
              </span>
            </div>

            <ol className="mt-4 space-y-3">
              {actions.map((action, i) => (
                <li key={action} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-electric font-display text-[11px] font-extrabold text-brand-navy">
                    {i + 1}
                  </span>
                  <span className="text-[13px] leading-relaxed text-white/80">{action}</span>
                </li>
              ))}
            </ol>

            <div className="mt-5 grid gap-2 border-t border-white/10 pt-4 text-[11px] leading-relaxed text-white/65">
              <p><span className="font-bold text-white/85">On the ground: </span>{brief.onTheGround}</p>
              <p><span className="font-bold text-white/85">Open door: </span>{brief.townHall}</p>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn min-h-[46px] flex-1 rounded-xl bg-brand-electric px-4 text-[12px] font-extrabold uppercase tracking-[0.1em] text-brand-navy hover:bg-brand-electric-dark hover:text-white"
              >
                Send to ward desk
              </a>
              <button
                type="button"
                onClick={copyBrief}
                className="btn min-h-[46px] rounded-xl border border-white/25 px-4 text-[12px] font-bold uppercase tracking-[0.1em] text-white hover:bg-white/10"
              >
                {copied ? 'Copied' : 'Copy brief'}
              </button>
            </div>
            <p aria-live="polite" className="sr-only">
              {copied ? 'Street Brief copied to clipboard' : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
