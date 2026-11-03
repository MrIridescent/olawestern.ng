# Olanrewaju Ismail Sanusi (Prince Lanre Sanusi / PLS) — Executive Chairman, Amuwo-Odofin LGA (APC)

## Profile & strategic context
- **Current role:** elected LGA Executive Chairman, primaries winner; **commands central APC municipal mobilization** (directory). Endorsement-giver in the Ola Western race — a kingmaker node, not a first-time buyer.
- **Dual-sale opportunity:** (a) **administration governance tools** (public service delivery portal), (b) **party-machinery coordination** he controls as chairman — the latter sells upward to every candidate he backs.
- **Critical compliance wall:** council resources ≠ campaign resources. Sell the *administration portal* on public-value grounds (brand it to the council's service desk), and the *party tools* through his APC chairman capacity, never on government letterhead.

## Matched packages
| Priority | Package | Rationale |
|---|---|---|
| P1 | **Ward coordination dashboard (party-machinery variant of Package 1)** | Ward executives, PU monitors, membership tracking, precinct broadcast trees — "streamline ward manager coordination" is literally the directory's stated B2B need for this tier. |
| P2 | **LGA civic request & town-hall portal (admin-facing)** | Constituent complaints → ward → status; dashboard of open issues per ward; makes his first term auditable (incumbency asset regardless of next office he seeks). |
| P3 | Referral architecture | Demo the Ola Western stack to him *as endorser*: every candidate he backs is downstream revenue for us. |

## Tailored technical plan
- Party dashboard: RBAC roles (chairman / secretary / ward exec / PU monitor); `ward_execs`, `pu_monitors`, `meetings`, `broadcast_logs`; all NDPA-scoped, member consent recorded.
- Civic portal: `civic_requests` (category, ward, status SLA), photo evidence, weekly auto-generated performance digest PDF for his press team.
- Both clone `ola-western-web` infra (Supabase + Next.js + role-based routes).

## Contract phasing
1. Civic portal (public-good framing, fastest approval path).
2. Party dashboard after conferences/ward-map refresh.
3. Election ops module (PU monitors → collation support) in the GOTV window.

## Risks/notes
- Government procurement optics: transparent pricing, formal proposal, no "political software on public salary" narrative. Anything campaign-side is invoiced to party/campaign structures explicitly.
