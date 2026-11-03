# Comrade Ayodele Adewale — APC House of Reps Aspirant (Lagos State Organising Secretary)

## Profile & strategic context
- **Office targeted:** Federal House of Representatives (aspirant in the APC race); serves as APC Lagos State Organising Secretary.
- **Base of power:** former Executive Chairman of Amuwo-Odofin LGA; student-activism and trade-union roots; extensive grassroots networks across Festac Town; very high media visibility (Daily Insight / Street Reporters contacts on file).
- **Operating style:** high-frequency press engagements, community rallies, direct voter outreach — a *movement* man whose digital layer is typically the weakest part of such campaigns.

## Matched packages
| Priority | Package | Rationale |
|---|---|---|
| P1 | **2 — Automated WhatsApp Canvassing Network** | His union/estate networks live in WhatsApp groups. Manifesto Q&A bot + scheduled broadcast engine for rally invites and press quotes, built low-bandwidth-first. |
| P2 | **4 — Social Listening & Rapid-Response Media Desk** | Ex-chairman + organising secretary = constant media narrative surface. Sentiment monitoring + fast rebuttal drafting protects his frontrunner positioning. |
| P3 | Press archive microsite | Every interview/statement indexed and searchable — turns media volume into a durable asset. |

## Tailored technical plan
- **WhatsApp assistant** (reuse the War Room `/api` + Meta Cloud API plumbing from `ola-western-web`): group-admin broadcast kits (Monday/Thursday asset pushes), keyword auto-replies (manifesto points in English/Pidgin/Yoruba), rally-RSVP capture into Supabase.
- **Media desk:** sentiment feed + threat triage dashboard (the `war-room-demo` UI, rebranded), weekly digest email auto-compiled from monitored coverage.
- Minimal public site: 4 pages (Home / Profile / Press / Join-a-ward) — he needs *distribution*, not brochure-ware.

## Contract phasing
1. Weeks 1–2: bot + broadcast network live with ward-group import.
2. Canvassing phase: listening desk on, asset pipeline weekly.
3. GOTV: broadcast switches to turnout reminders by ward.

## Risks/notes
- As party Organising Secretary he is *institutionally* sensitive: data captured must never look like party-membership surveillance. Keep supporter CRM strictly campaign-facing and NDPA-labeled.
