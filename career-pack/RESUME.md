# Resume — master file

**Compiled:** 3 November 2026 · **Anonymised by default** (see `README.md` §1)
**Every `[[DOUBLE-BRACKET]]` is a placeholder you must fill from your own records.** Nothing here was invented for you. Metrics about business outcomes are deliberately absent because they belong to the client and were never measured — add only what you can prove.

Formatting notes for the version you send: plain text or a single-column PDF, no tables, no graphics, no photo, no columns an ATS cannot parse. Use §5 as the sendable one-page skeleton.

---

## 1. Header block

```
[[FULL NAME]]
[[CITY, COUNTRY]] · [[PHONE]] · [[EMAIL]]
[[GITHUB]] · [[LINKEDIN]] · [[PORTFOLIO URL]]
```

Optional one-line positioning, choose per application:

- `Full-stack engineer (TypeScript, Next.js) — product design and technical documentation for high-scrutiny public-facing systems`
- `Campaign and civic technology — builds public record systems that can be audited`
- `[[TARGET ROLE]]`

---

## 2. Summary (three lines, edit to truth)

`[[YEARS]]` years building software in `[[PRIMARY LANGUAGES]]`. Ships working systems and the documents that make them operable by other people: architecture decision records, runbooks, QA evidence with commands and observed output, environment specs with the arithmetic shown. Comfortable owning a project end to end — discovery, product decisions, implementation, verification, deployment analysis, and training the non-technical people who will use it. Works in constrained environments: modest hardware, no CI maturity, real-world regulatory obligations (NDPA 2023, WCAG 2.2), users on mid-range Android phones over unreliable connections.

---

## 3. Selected project (leads if you have limited formal employment history)

**Campaign platform for a 2027 Lagos State House of Assembly candidacy** — product design, architecture, full-stack implementation, documentation *(anonymised; named on request with client consent)* · 2026

- Designed and built a Next.js 14 / TypeScript application: 12 page routes, 34 API route handlers, dual storage backends (atomic flat-file store and Supabase Postgres with migrations), stateless HMAC-SHA256 signed-cookie auth, fail-closed configuration in production.
- Invented the CMS model the client asked for but had no name for: **the public page is the editing surface**. ⌘E reveals 38 annotated regions driven by a 25-field declarative contract across 5 field kinds; ⌘K command deck parses intent into existing endpoints; ⌘Z undo; anonymous visitors receive zero editable DOM, so the feature costs them nothing.
- Enforced integrity in the server, not the style guide: a publish gate refuses creation of any claim-bearing record without an evidence link, permits replacement but never emptying, and makes deletion the only takedown. The site computes its own trust score (currently 40/100 with 4 published lines graded `block`) and gates shareability on it — evidence was left missing rather than fabricated.
- Built the media pipeline without adding dependencies: a byte-level image header probe (WEBP RIFF chunk walking, HEIC refused), aspect-ratio gating at 34% crop loss across 20 declared frames, oEmbed verification for video, provenance-preserving press image binding.
- Held the payload to 87.2 kB shared first-load JS with 8 ISR routes and 6 immutable prerenders; mobile-first layouts, reduced-motion support, tap targets to WCAG 2.2 SC 2.5.8, contrast measured against a deliberately low-glare palette.
- Authored a 13-document dated suite: PRD (34 functional + 15 non-functional requirements with enforcement, code location and honest status), 32 ADRs, technical manual, operations runbook with 10 incident playbooks, use-case dossier mapping 28 cited real-world information-integrity events to implemented behaviour, security/compliance document mapping NDPA 2023 obligation by obligation, hardware and environment spec with a shown traffic model, pre/post-programming gate checklists, and QA evidence recording commands, timestamps and verbatim output.
- Analysed hosting end to end against a verified build: five deployment paths, with the serverless verdict reasoned from the actual constraints (disk-writing upload route pinned to Node runtime, no CDN purge API, cookie sessions).

*Verification statement you can say out loud in an interview:* "`npx tsc --noEmit` exits 0; `node scripts/check-cms-gates.mjs` reports 12/12 gates with an integrity score of 40; `npm run build` produces 14 prerender entries. All run on 3 November 2026. I can walk you through the failing findings if you like — four of them are unfilled evidence links I refused to invent."

---

## 4. Experience

```
[[EMPLOYER 1]] — [[ROLE 1]]        [[START]] – [[END / PRESENT]]
[[ONE-LINE CONTEXT: what the company does, team size, your remit]]
- [[WHAT YOU BUILT OR OWNED, with a number]]
- [[WHAT YOU IMPROVED, with before/after]]
- [[WHAT YOU LED OR TAUGHT]]

[[EMPLOYER 2]] — [[ROLE 2]]        [[START]] – [[END]]
[[CONTEXT]]
- [[…]]
- [[…]]

[[EMPLOYER 3 / FREELANCE / i2sltd.tech CLIENT WORK]] — [[ROLE 3]]   [[START]] – [[END]]
[[CONTEXT]]
- [[…]]
```

If `i2sltd.tech` is a registered or operating business of yours, give it its own entry with its real date range and its real clients (named, if consent allows). Otherwise list it under a header like `Independent engineering — [[YEAR]]` and put the §3 project beneath it.

---

## 5. One-page skeleton (send this form)

```
[[FULL NAME]]
[[CITY]] · [[PHONE]] · [[EMAIL]] · [[GITHUB]] · [[LINKEDIN]] · [[PORTFOLIO URL]]

SUMMARY
[[2–3 lines from §2]]

SELECTED PROJECT
Campaign platform, 2027 Lagos State House of Assembly candidacy (anonymised)
- [[three bullets from §3: the CMS idea, the publish gate, the measured system]]
- [[one bullet: the 13-document suite]]
- [[one bullet: hosting analysis]]

EXPERIENCE
[[EMPLOYER]] — [[ROLE]]  [[DATES]]
- [[bullets]]
[[EMPLOYER]] — [[ROLE]]  [[DATES]]
- [[bullets]]

SKILLS
Languages: TypeScript, JavaScript, SQL, [[OTHERS]]
Frameworks: Next.js (App Router), React, Tailwind CSS, [[OTHERS]]
Data & backend: Postgres (Supabase), REST route handlers, flat-file/atomic storage patterns
Practice: architecture decision records, threat modelling, WCAG 2.2 accessibility,
          NDPA 2023 / GDPR-adjacent data-protection mapping, incident runbooks
Tooling: Node 20 LTS, npm, Git, [[CI]], [[OS/EDITOR/DEPLOY TOOLING]]

EDUCATION & CERTIFICATIONS
[[EDUCATION]]
[[CERTIFICATIONS]]

LANGUAGES
[[LANGUAGES]]
```

---

## 6. Skills with evidence (never list a skill you cannot point at)

| Skill | Evidence in this project |
|---|---|
| TypeScript / React / Next.js App Router | 11,932 LOC in `src/` (app 3,192 · lib 2,979 · components 5,540 · types 221), 34 route handlers, ISR + immutable prerender split, `tsc --noEmit` clean |
| Product design under an ambiguous brief | "a method of CMS never conceived" → the Live Desk contract + overlay + command deck |
| Security engineering | Stateless HMAC-SHA256 signed cookie, 12 h TTL, `httpOnly`/`sameSite=lax`/`secure`, `timingSafeEqual` behind a length check, fail-closed on unset secrets, session probe renders no DOM anonymously, T1–T15 threat model with four *stated limitations* |
| Data protection / compliance | NDPA 2023 mapped s.24–s.37 including s.30 (political opinions as sensitive data), GAID 2025, `toPublic()` PII stripping mirrored in Postgres RLS, EU AI Act Art. 50 posture |
| Accessibility | WCAG 2.2 SC 2.5.8 targets, reduced-motion honoured, measured contrast on a low-glare palette — and an open `[gap]` for the full audit |
| Performance | 87.2 kB shared JS, per-page 87–102 kB, byte-level image probe instead of `sharp`, aspect-ratio crop-loss gate |
| Operations design | Runbook with 10 playbooks, cadences, monitoring matrix incl. West African vantage, L0–L3 escalation, handover procedure |
| Technical writing | 13 dated documents; QA evidence recording commands and verbatim output rather than conclusions |
| Infrastructure judgement | Five deployment paths with a reasoned serverless rejection; three hardware tiers; peak-day traffic model with assumptions labelled |
| Honesty as an engineering practice | Refused to fabricate 4 evidence links; left 4 media frames empty; recorded my own invalid browser-cache verification and my own prerender-manifest error as findings |

---

## 7. Tailoring table

| Target | Lead with | Emphasise | Downplay | Cut |
|---|---|---|---|---|
| Full-stack / product engineer (product company) | §3 bullets 1–2 | Live Desk contract, payload discipline, dependency restraint | political context | the runbook detail |
| Platform / backend engineer | §3 bullet 1 | dual backends, atomic writes with EPERM/EBUSY retries, RLS + `toPublic()` mirroring, caching manifest | UI | gallery/video bullets |
| Frontend engineer | Live Desk overlay, media pipeline | `getBoundingClientRect` ring dedup, contract-driven fields, mobile-first, reduced motion | Postgres | traffic model |
| **Campaign / civic tech, election-observation NGOs** | §1 of the case study | information environment, publish gate, NDPA mapping, incident playbooks, HITL, refusals | nothing | — |
| Technical writing / DX | §6 of the case study | 13-document set, ADR log, recipes, landmines, precedence ladder | code | perf bullets |
| Contract / freelance proposal | §3 + §5 | what the client gets: build, docs, runbook, training plan, deploy analysis | theory | ATS formatting |
| Political principal (a candidate or party) | `PITCH-KIT.md`, not this file | risk removed, cost, timeline, who does the work | TypeScript | — |

---

## 8. Before you send

1. Replace every `[[PLACEHOLDER]]`, or delete the line. A bracket surviving into a sent resume is worse than an empty section.
2. Check every number against `../ola-western-web/docs/09-QA-AND-TEST-EVIDENCE.md` and keep the date attached.
3. Confirm the client has not asked you to stop. If you have written consent to name them, swap §3's first line for the named version and keep this one.
4. Cut to one page for recruiter-facing roles, two at most for engineering roles that ask for depth.
5. Read the summary out loud. If it sounds like everyone else's, rewrite it to describe what you actually do.
6. Say the score out loud in the interview: 40 out of 100, not ready to share. It is the most distinguishing sentence you have.

## 9. Change log

| Date | Change | By |
|---|---|---|
| 3 Nov 2026 | Master resume created with placeholders; project section written from measurements recorded in `docs/09` | i2sltd.tech |
