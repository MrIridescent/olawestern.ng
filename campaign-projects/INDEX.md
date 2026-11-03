# Amuwo-Odofin 2026/2027 — B2B Campaign Projects Directory

One folder per aspirant/stakeholder from the **Strategic Electoral Directory** file, each containing:
- `PROPOSAL.md` — who they are, the office in play, their specific pains, matched B2B package(s), tailored technical plan, contract phasing around electoral milestones, risks.
- `OUTREACH.md` — personalized email + WhatsApp copy (directory framework, Phase 1: contextual personalization), plus the Phase 2 live-demo hook.

All builds reuse the flagship reference stack: [`../ola-western-web/`](../ola-western-web/README.md) (Next.js/Supabase) and [`../war-room-demo/`](../war-room-demo/index.html) (simulation pitch tool).

## Portfolio matrix

| # | Folder | Principal | Office | Party/Role | Primary package fit | Deal temp |
|---|---|---|---|---|---|---|
| 00 | `00-ola-western-hoa01-apc` | Ola Western | State HoA C-01 | APC | 1 + War Room | **BUILT — flagship** |
| 01 | `01-moses-olanrewaju-mo-reps-apc` | Moses Olanrewaju (MO) | Fed Reps | APC nom. | **3 (scorecard/spreadsheet)** + 1 | 🔥 hottest — public software pledge |
| 02 | `02-ayodele-adewale-reps-apc` | Ayodele Adewale | Fed Reps | APC org. sec. | 2 + 4 | High (media surface) |
| 03 | `03-ramotalai-akinlola-hassan-reps-apc` | R. Akinlola-Hassan | Fed Reps | APC | 2 (voice-first) + 1 | High (largest gap-to-strength) |
| 04 | `04-george-adegeye-omogeye-reps-lp-incumbent` | Omogeye | Fed Reps (inc.) | LP/NDC | **PVT Situation Room** + 4 + record portal | High (election-day fear converts) |
| 05 | `05-ogheneluemu-egoh-reps-pdp` | Ogheneluemu Egoh | Fed Reps | PDP | Asset hub + CRM + legacy site | Medium |
| 06 | `06-stella-osafile-hoa01-lp-incumbent` | Stella Osafile | State HoA C-01 (inc.) | LP | Wealth-desk scorecard + 4 | High (C-01 war, symmetric to 00) |
| 07 | `07-rauf-age-sulaimon-hoa02-apc` | Wale Rauf | State HoA C-02 | APC inc. | **2 + offline-first stack** | High (cleanest tech fit) |
| 08 | `08-faith-ugbeshe-hoa01-adc` | Faith Ugbeshe | State HoA C-01 | ADC | Lean site + activation chain | Micro-budget entry |
| 09 | `09-gbenga-nathaniel-gna-community-youth` | Gbenga Nathaniel (GNA) | Community/LG aspirant | Initiative | Entry one-pager + volunteer kit | Micro-budget entry |
| 10 | `10-lanre-sanusi-amuwo-odofin-lgc-apc` | Prince Lanre Sanusi | LGA Exec Chair / kingmaker | APC | Party console + civic portal | Two-track (gov + party) |
| 11 | `11-rasaq-olojede-oriade-lcda-apc` | Rasaq Olojede | Oriade LCDA Chair | APC | Civic bot-portal + ward tools | Gov-track first |
| 12 | `12-elebute-abiodun-apc-lgac` | Elebute Abiodun | APC LGA Chairman | APC | **Machinery console** (choke-point sale) | Highest leverage |
| 13 | `13-badmus-moshood-oriade-stakeholder-apc` | Badmus Moshood | Strategist/broker | APC | White-label kit + referral channel | Channel deal |
| 14 | `14-valentine-buraimoh-apc-statesman` | Valentine Buraimoh | Elder/statesman | APC | Legacy archive + column | Retainer deal |

## Recommended pursuit order
1. **12 (party chairman)** — one deployment standardizes every APC-facing client below it.
2. **01 (MO)** — his public "working spreadsheet" pledge has a deadline pressure no one else has.
3. **00 flagship proof** is the door-opener for 03, 07 (already running on our stack family).
4. **04 / 06 (LP incumbents)** — pitch PVT + scorecards as *defense*; time these discreetly, they are opposition clients in an APC-strong field (separate teams, separate data namespaces — see conflicts rule below).
5. 02, 05, 10, 11, 13, 14 as capacity allows; 08/09 are quick low-cost wins that fill portfolio breadth.

## Standing compliance rules for every project (do not waive per-client)
- **Verify all contact data** in the source directory before any outreach; the listed `enquiries@lasiec.gov.ng` rows belong to the **electoral commission, not candidates** — never use as outreach addresses.
- **LASIEC is excluded from this directory deliberately:** it is the election authority, not an aspirant; pitching commercial campaign-tech to the regulator is a conflict and would poison every other deal.
- **Public-office firewall (10, 11, 06):** government-facing tools invoiced and branded to the administration; party/campaign tools never touch official resources or addresses.
- **NDPA 2023:** consent at every capture point, opt-out honoured on every broadcast channel, role-scoped data access, deletion on request.
- **Human-in-the-loop everywhere:** no autonomous posting in any product we ship; listening desks only *draft* responses for authorized humans. No astroturfing tooling, per platform policies — organic reach is volunteer-powered.
- **Client-conflict rule:** serving both camps (e.g., 00/12 APC-side and 04/06 opposition-side) requires physically separate infrastructure, separate account teams, and written non-cross-use assurances. Decide deliberately before accepting the second side.

## Files status
All 15 folders complete (00 + 01–14), each with `PROPOSAL.md` + `OUTREACH.md` (folder 00 is the built-project index).
Demo assets built: **MO Working-Spreadsheet tracker** ([`01-…/mo-tracker-prototype.html`](./01-moses-olanrewaju-mo-reps-apc/mo-tracker-prototype.html)) + pitch runbook in [`01-…/README.md`](./01-moses-olanrewaju-mo-reps-apc/README.md); AI War Room simulation ([`../war-room-demo/index.html`](../war-room-demo/index.html)).
