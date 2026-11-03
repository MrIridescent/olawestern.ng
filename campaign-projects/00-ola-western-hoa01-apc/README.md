# Ola Western — Flagship Project (State House of Assembly, Constituency 01, APC)

**Status: ALREADY BUILT.** This folder is the pointer/index — the actual deliverables live one level up.

| Asset | Location |
|---|---|
| Full Next.js campaign website (6 pages, 4 API routes, Supabase schema, CI/CD) | [`../../ola-western-web/`](../ola-western-web/README.md) |
| AI War Room live-simulation demo (pitch-day tool) | [`../../war-room-demo/index.html`](../../war-room-demo/index.html) |
| Master strategy, pitch kit & technical specs | `../../` root `.txt` files |

## Matched B2B packages (from the directory framework)
- **Package 1 — Constituent CRM & Micro-Targeting:** implemented via `/join` volunteer capture → Supabase `volunteers` → War Room webhook.
- **War Room Rapid-Response Desk:** `/api/truth-room/sync` webhook + Truth Room ledger.

## Use as the template for every other aspirant
Clone `ola-western-web/` → adjust brand colors, party, ward tables and content seeds. Each other
`PROPOSAL.md` in this directory notes which sections of this codebase to reuse and which are missing
for that candidate's specific need (scorecard portals, voice broadcast, PVT, etc.).

## Outreach note
Relationship is **active/engaged** (proposal already delivered per the PITCH & workflow docs).
No cold outreach needed — treat this folder as the reference implementation for demos to others.
