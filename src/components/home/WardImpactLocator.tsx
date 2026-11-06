'use client';

import { useMemo, useState } from 'react';
import { WARDS, type Ward } from '@/types';
import { WARD_BRIEFS } from '@/lib/hq';

export default function WardImpactLocator({ whatsappNumber }: { whatsappNumber: string }) {
  const [ward, setWard] = useState<Ward>('Festac I');
  const brief = useMemo(() => WARD_BRIEFS[ward], [ward]);

  const waHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hello OlaWestern campaign. I live in ${ward} and want to speak with my ward coordinator.`,
  )}`;

  return (
    <section id="ward-impact" className="scroll-mt-24 bg-white py-16 sm:py-20">
      <div className="container-site">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="section-kicker">Ward Impact &amp; Issues Locator</p>
            <h2 className="section-title !text-brand-navy">Your neighbourhood, your legislative agenda</h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-brand-gray sm:text-base">
              Representation is geographic. Pick your ward to see the commitments that matter on your
              street, the work already on the ground, and the direct line to your ward coordinator.
            </p>

            <label htmlFor="ward-select" className="mt-7 block text-xs font-bold uppercase tracking-[0.18em] text-brand-navy">
              Select your ward
            </label>
            <div className="relative mt-2">
              <select
                id="ward-select"
                value={ward}
                onChange={(e) => setWard(e.target.value as Ward)}
                className="min-h-[56px] w-full appearance-none rounded-lg border-2 border-brand-navy/15 bg-brand-navy-light px-4 py-3 pr-12 text-base font-bold text-brand-navy outline-none transition-colors focus:border-brand-electric focus:ring-2 focus:ring-brand-electric/25"
              >
                {WARDS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-navy"
                viewBox="0 0 20 20" fill="currentColor" aria-hidden
              >
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clipRule="evenodd" />
              </svg>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {WARDS.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWard(w)}
                  aria-pressed={ward === w}
                  className={`min-h-[48px] rounded-lg border px-3 py-2 text-left text-xs font-bold transition-colors ${
                    ward === w
                      ? 'border-brand-electric bg-brand-electric text-brand-navy shadow-[0_4px_14px_rgba(255,87,34,0.25)]'
                      : 'border-[#E2E8F0] bg-white text-brand-navy hover:border-brand-electric/50'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-brand-navy/10 bg-white shadow-[0_24px_60px_rgba(11,37,69,0.10)]">
            <div className="border-b border-brand-navy/10 bg-brand-navy px-6 py-5 text-white">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-electric-bright">Ward brief</p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-emerald/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-emerald">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-emerald" aria-hidden />
                  Desk active
                </span>
              </div>
              <h3 className="mt-2 font-display text-2xl font-extrabold tracking-tight">{ward}</h3>
              <p className="mt-1 text-sm text-white/80">{brief.headline}</p>
            </div>

            <div className="p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-electric-dark">
                What he will take to the Assembly
              </p>
              <ul className="mt-3 space-y-3">
                {brief.commitments.map((c) => (
                  <li key={c} className="flex gap-3 text-sm leading-relaxed text-brand-gray">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-electric-light text-[11px] font-extrabold text-brand-electric-dark" aria-hidden>
                      ✓
                    </span>
                    {c}
                  </li>
                ))}
              </ul>

              <div className="mt-5 rounded-xl border border-[#E2E8F0] bg-brand-navy-light/60 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-navy/75">Already on the ground</p>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-brand-navy">{brief.onTheGround}</p>
              </div>

              <div className="mt-4 flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-navy text-white" aria-hidden>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                    <rect x="3" y="4" width="18" height="17" rx="2" />
                    <path d="M8 2v4M16 2v4M3 9h18" />
                  </svg>
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-navy/75">Town hall</p>
                  <p className="mt-0.5 font-semibold leading-snug text-brand-navy">{brief.townHall}</p>
                </div>
              </div>

              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn mt-5 w-full rounded-lg bg-brand-electric text-brand-navy shadow-[0_4px_14px_rgba(255,87,34,0.3)] hover:bg-brand-electric-dark hover:text-white"
              >
                WhatsApp my ward coordinator <span aria-hidden>→</span>
              </a>
              <p className="mt-2 text-center text-[10px] text-brand-gray">
                All ward desks route through the central campaign desk and identify themselves by ward.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
