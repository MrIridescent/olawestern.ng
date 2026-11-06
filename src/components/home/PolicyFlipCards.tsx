'use client';

import { useState } from 'react';

type IconName = 'youth' | 'road' | 'market' | 'shield';

interface PolicyCard {
  id: string;
  tag: string;
  title: string;
  lead: string;
  icon: IconName;
  accent: 'orange' | 'emerald' | 'navy';
  commitments: string[];
  measure: string;
}

/** Four pillars drawn from the published legislative agenda. */
const CARDS: PolicyCard[] = [
  {
    id: 'youth',
    tag: 'Youth',
    title: 'Youth Empowerment & Tech Hubs',
    lead: 'Turn youth energy into employable, income-generating capability.',
    icon: 'youth',
    accent: 'orange',
    commitments: [
      'Digital-skill and creative-economy centres across the constituency.',
      'Sports facilities and a yearly youth opportunity register.',
      'Partnerships that connect trained residents to real jobs.',
    ],
    measure: 'One hub per ward · annual opportunity report',
  },
  {
    id: 'infrastructure',
    tag: 'Infrastructure',
    title: 'Roads, Drainage & 23 Road',
    lead: 'A legislative framework for roads that survive the rainy season.',
    icon: 'road',
    accent: 'emerald',
    commitments: [
      'FHA–state–LGA cooperation for FESTAC road maintenance.',
      'Full rehabilitation of 23 Road and canal desilting.',
      'Avenue street-lighting and published maintenance schedules.',
    ],
    measure: 'One maintenance framework · pre-rainy-season clearing',
  },
  {
    id: 'market',
    tag: 'Economy',
    title: 'Market Women & Trader Protection',
    lead: 'Keep livelihoods secure from arbitrary levies and disruption.',
    icon: 'market',
    accent: 'navy',
    commitments: [
      'Fair regulatory guidelines for LAWMA and municipal task forces.',
      'A written levy schedule traders can hold agencies to.',
      'Direct engagement at Agboju and Mile 2 markets.',
    ],
    measure: 'One trader-protection bill · published levy schedule',
  },
  {
    id: 'governance',
    tag: 'Governance',
    title: 'Public Safety & Open Representation',
    lead: 'Institutionalise what “responsible representation” actually means.',
    icon: 'shield',
    accent: 'orange',
    commitments: [
      'Quarterly town halls in Festac I–III and Mile 2.',
      'Published legislative activity and constituent feedback.',
      'A named ward desk for every request — no anonymous queue.',
    ],
    measure: 'Four ward town halls a year · 48-hour acknowledgement',
  },
];

const ACCENT: Record<PolicyCard['accent'], { chip: string; icon: string; rule: string }> = {
  orange: { chip: 'bg-brand-electric-light text-brand-electric-dark', icon: 'bg-brand-electric text-white', rule: 'bg-brand-electric' },
  emerald: { chip: 'bg-brand-emerald-light text-brand-emerald-dark', icon: 'bg-brand-emerald-dark text-white', rule: 'bg-brand-emerald' },
  navy: { chip: 'bg-brand-navy-light text-brand-navy', icon: 'bg-brand-navy text-white', rule: 'bg-brand-navy' },
};

function PolicyIcon({ name }: { name: IconName }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  if (name === 'road') {
    return (
      <svg {...common}>
        <path d="M4 21 8 3M20 21 16 3M12 5v3M12 12v3M12 19v2" />
      </svg>
    );
  }
  if (name === 'market') {
    return (
      <svg {...common}>
        <path d="M3 9h18l-1.5 11h-15L3 9zM3 9l2-5h14l2 5M9 13v3M15 13v3" />
      </svg>
    );
  }
  if (name === 'shield') {
    return (
      <svg {...common}>
        <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6h1M16 11h5M18.5 8.5v5" />
    </svg>
  );
}

export default function PolicyFlipCards() {
  const [flipped, setFlipped] = useState<string | null>(null);

  return (
    <section className="bg-brand-navy-light py-16 sm:py-20">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="section-kicker">The Legislative Agenda</p>
            <h2 className="section-title">Four commitments. Written to be checked.</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-brand-gray">
            Tap a card to flip it. Each back names the bill, the ward-level action and the measure
            the campaign expects to be judged by.
          </p>
        </div>

        <div className="mt-9 grid gap-5 sm:grid-cols-2">
          {CARDS.map((card) => {
            const isFlipped = flipped === card.id;
            const accent = ACCENT[card.accent];
            return (
              <div
                key={card.id}
                className={`flip-card group ${isFlipped ? 'is-flipped' : ''}`}
                role="button"
                tabIndex={0}
                aria-pressed={isFlipped}
                aria-label={`${card.title}. ${isFlipped ? 'Showing commitments' : 'Tap to show commitments'}`}
                onClick={() => setFlipped(isFlipped ? null : card.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setFlipped(isFlipped ? null : card.id);
                  }
                }}
              >
                <div className="flip-card-inner">
                  {/* Front */}
                  <div className="flip-face overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-shadow group-hover:shadow-xl group-hover:shadow-brand-navy/10 sm:p-7">
                    <span className={`absolute inset-x-0 top-0 h-1 ${accent.rule}`} aria-hidden />
                    <div className="flex items-start justify-between gap-4">
                      <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${accent.icon}`}>
                        <PolicyIcon name={card.icon} />
                      </span>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${accent.chip}`}>
                        {card.tag}
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-xl font-extrabold leading-snug text-brand-navy sm:text-2xl">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-brand-gray">{card.lead}</p>
                    <p className="mt-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-electric-dark">
                      Read the commitment
                      <span className="transition-transform group-hover:translate-x-1" aria-hidden>→</span>
                    </p>
                  </div>

                  {/* Back */}
                  <div className="flip-face flip-back overflow-hidden rounded-2xl border border-brand-navy bg-brand-navy p-6 text-white shadow-xl sm:p-7">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-electric-bright">
                        {card.tag} · Commitment
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75">Tap to close</span>
                    </div>
                    <h3 className="mt-3 font-display text-lg font-extrabold leading-snug sm:text-xl">{card.title}</h3>
                    <ul className="mt-3 space-y-2">
                      {card.commitments.map((c) => (
                        <li key={c} className="flex gap-2.5 text-[13px] leading-relaxed text-white/75">
                          <span className="mt-0.5 text-brand-emerald" aria-hidden>✓</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 border-t border-white/15 pt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-electric-bright">
                      Measure · {card.measure}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
