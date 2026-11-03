# Faith Ugbeshe — ADC State House of Assembly Aspirant, Constituency 01

## Profile & strategic context
- **Office:** State Assembly Constituency 01 (Festac Town), ADC.
- **Mission (from directory):** capture **non-aligned urban voters** — the middle-class estate bloc that historically skips elections and distrusts the APC-vs-LP binary.
- **Constraint:** third-party budget. Everything must be lean, organic-first, and turnout-focused (non-aligned voters don't just need persuasion — they need *activation*).

## Matched packages (scaled to micro-budget)
| Priority | Package | Rationale |
|---|---|---|
| P1 | **Lean recognition site** (Pathway 3 lite) | One strong page-set: Why ADC / The Plan / Endorsements / Join — SEO for "Festac new candidate", fast share cards. |
| P1 | **Non-voter activation engine** | "Pledge + remind" flow: supporters register with PU, get a 3-touch GOTV reminder chain (WhatsApp → voice → SMS) designed for low-propensity voters. |
| P2 | WhatsApp asset vault | Status cards/graphics volunteers forward into estate groups; DP generator for identity-building. |
| P3 | Lightweight listening digest | Weekly (not 24/7) sentiment email — cheaper tier, same early-warning value for a small team. |

## Tailored technical plan
- Static-first `ola-western-web` derivative, ADC palette, 4 routes; `supporters` table with `voter_propensity` field; reminder-chain state machine in Edge Functions/cron (all sends consented + opt-out).
- Asset vault = CDN folder + one-page gallery, zero CMS cost.
- Budget guardrail: everything on free tiers (Supabase, Vercel, Cloudflare) until activation data proves ROI.

## Contract phasing
1. Site + vault in 10 days (fixed micro-fee).
2. Activation engine before the voter-register window closes.
3. GOTV chain in election fortnight.

## Risks/notes
- Third-party aspirants get squeezed by narrative dominance from the two big machines; velocity + distinct visual identity matter more than volume. Verify her public biography and endorsements before seeding site content.
