# Ola Western Campaign Site — Documentation Suite

**Document set version:** 1.0
**Compiled:** 3 November 2026
**Compiled by:** i2sltd.tech (engineering, documentation and operations owner)
**Subject system:** official campaign website for a 2027 Lagos State House of Assembly candidacy (Amuwo-Odofin Constituency I)
**Codebase this set describes:** `ola-western-web`, Next.js 14.2.15 (App Router), TypeScript 5.5, Tailwind 3.4, production build verified 3 November 2026

> **Naming convention used throughout.** These documents are written so they can be shown outside the campaign. The candidate, party and constituency are referred to by role ("the candidate", "the campaign", "the desk") rather than by name. Internal identifiers that appear in code (`ola-western`, `OlaWestern.ng`, media ids, seed names) are left as they are, because they are the actual artefacts an engineer or auditor would look at. A named version of the same documents exists in the project's own `README.md` and `DEPLOYMENT-GUIDE.md`, which are the authoritative internal copies.

---

## How this set is organised

The documents follow the real lifecycle of the project: what was understood before code, what was decided, what was built, what was verified, how it is run, and what it is for. Each file states its own date and its evidence base.

| # | Document | Stage | Answers | Read first if you are… |
|---|---|---|---|---|
| 00 | `00-DOCUMENT-INDEX.md` (this file) | — | What exists, what is authoritative, what is stale | Anyone |
| 01 | `01-PRD.md` | Pre-programming, maintained | What the product is for, requirements, acceptance and release criteria | Product, client, reviewer |
| 02 | `02-RESEARCH-AND-DISCOVERY.md` | Pre-programming | What was known, assumed and cited before building | Reviewer, future vendor |
| 03 | `03-ARCHITECTURE-DECISIONS.md` | Programming | Why the system is shaped this way (ADR log) | Engineer, architect |
| 04 | `04-TECHNICAL-MANUAL.md` | Programming | Step-by-step: setup, run, edit, deploy, troubleshoot | Engineer, desk trainee |
| 05 | `05-OPERATIONS-RUNBOOK.md` | Post-programming | How it is kept alive: monitoring, backups, incidents | Ops, on-call |
| 06 | `06-USE-CASES.md` | Both | Abstract, fictional and real-world reported scenarios vs actual behaviour | Client, journalist, reviewer |
| 07 | `07-USER-STORIES-AND-JOURNEYS.md` | Pre + post | Who uses it, what they need, what happens on the page | Design, QA, training |
| 08 | `08-DEVELOPER-WORKFLOW.md` | Programming | How work gets done in this repo: conventions, review, release | Engineer |
| 09 | `09-QA-AND-TEST-EVIDENCE.md` | Post-programming | What was tested, when, with what result, and what was not | QA, auditor |
| 10 | `10-SECURITY-AND-COMPLIANCE.md` | Post-programming | Threat model, NDPA mapping, consent, hardening state | Security, legal |
| 11 | `11-HARDWARE-AND-ENVIRONMENT-SPEC.md` | Post-programming | Exactly what machine/network/storage this needs and why | Ops, procurement |
| 12 | `12-PRE-POST-PROGRAMMING-CHECKLISTS.md` | Both | Gate lists: before code, before deploy, after launch | Everyone |
| — | `DEPLOYMENT-GUIDE.md` (repo root) | Post-programming | Hosting architecture, PaaS/serverless analysis, five deploy paths | Ops, engineer |
| — | `README.md` (repo root) | Programming | Named internal overview, Live Desk design, publish gate, guardrails | Engineer |
| — | `infographic.html` | Summary | One-page visual synthesis of all of the above | Anyone, 5 minutes |
| — | `../career-pack/README.md` | Outside the project | Consent and anonymisation rule, how to fill the placeholders, what this project proves | Owner |
| — | `../career-pack/PORTFOLIO-CASE-STUDY.md` | Outside the project | Anonymised case study of the whole build, for reviewers and prospective clients | Hiring manager, client |
| — | `../career-pack/RESUME.md`, `COVER-LETTERS.md` | Outside the project | Resume with clearly marked placeholders, four outreach letter variants | Owner |
| — | `../career-pack/PITCH-KIT.md` | Outside the project | Selling campaign technology to a political principal: scripts, meeting shape, scope, ethics line | Owner |
| — | `../career-pack/CHANNELS.md`, `PROJECT-ENTRIES-AND-INTERVIEW-PREP.md` | Outside the project | Dated channel list with check status, bullet bank, online copy, hostile interview questions | Owner |

The `career-pack/` set is derived from this one and is **not** part of the system specification. It is written for outside audiences, it is anonymised, and where it cites a number it cites the document above that measured it. Nothing in it overrides precedence 1–5.

---

## Authority and precedence

Where two documents disagree, this is the order of truth:

1. **The code and the running build** — `src/`, `next.config.mjs`, and what `npm run build` produces.
2. **`scripts/check-cms-gates.mjs` and `/api/admin/health`** — executable assertions about behaviour. A claim contradicted by these two is a documentation bug.
3. **`DEPLOYMENT-GUIDE.md`** — the hosting and infrastructure analysis, written against a verified build.
4. **This document set** — interpretation, rationale, and the record of decisions.
5. **`infographic.html`** — a summary of 1–4. It is a communication artefact, not a specification.

External claims (standards, statutes, reported events) are cited inline with a date and a URL, and every one of them was checked during compilation on 3 November 2026. Where a claim could not be verified as current, it is marked **[unverified]** rather than softened.

---

## Status of the system described

| Aspect | State as at 3 Nov 2026 |
|---|---|
| Pages | 11 routes (home, about, impact, gallery, news, truth-room, help-desk, contact, join, privacy, blueprint) + admin CMS |
| API surface | 34 route handlers, all `force-dynamic`; every `/api/admin/**` handler session-gated |
| Data backends | File store (live, default) and Supabase Postgres (configured path, migrations `0001` + `0002`) |
| Content in library | 27 published photographs across 16 of 20 declared frames; 7 verified video clips; 21 cited press references |
| Editing | Live Desk in-place overlay (⌘E reveal, tap-to-edit, ⌘K command deck, ⌘Z undo) + tabbed CMS at `/admin` |
| Self-audit | Integrity score **40 / not ready to share**, 6 findings, **4 published lines graded `block`** for missing evidence |
| Publish gate | Server-side: no track-record entry or Truth Room ruling can be created without its evidence link; the link may be replaced, never emptied |
| Deployment | Verified locally as SSR (`npm run build` + `next start`); no production host assigned yet |
| Secrets | Dev fallback values still present locally — **must be rotated before any public deployment** |
| Accessibility | Reduced-motion respected in carousel; `prefers-reduced-motion` verified in code; full WCAG 2.2 audit not yet performed **[gap]** |
| Legal | `/privacy` present; NDPA wording not yet reviewed by a lawyer **[gap]** |

---

## Reading paths

**A reviewer with 15 minutes:** `01-PRD.md` §1–§3 → `infographic.html` → `09-QA-AND-TEST-EVIDENCE.md` §results.

**An engineer taking over:** `08-DEVELOPER-WORKFLOW.md` → `04-TECHNICAL-MANUAL.md` → `03-ARCHITECTURE-DECISIONS.md` → `DEPLOYMENT-GUIDE.md` §6.

**The campaign desk:** `04-TECHNICAL-MANUAL.md` §editing → `07-USER-STORIES-AND-JOURNEYS.md` journeys → `05-OPERATIONS-RUNBOOK.md` §playbooks.

**A prospective client (politically):** `06-USE-CASES.md` → `infographic.html` → the anonymised case study in `career-pack/PORTFOLIO-CASE-STUDY.md`.

---

## Document maintenance rules

1. A document in this set is **dated at the top and at every substantive edit**. An undated edit is treated as unverified.
2. Any change to a requirement, an architecture decision, or a release criterion is recorded in `03-ARCHITECTURE-DECISIONS.md` as a new numbered ADR — decisions are never silently overwritten.
3. Test evidence in `09-QA-AND-TEST-EVIDENCE.md` records the **command run, the date, and the observed output**, not a conclusion.
4. Known gaps stay visible. A gap closed gets a date and the evidence that closed it; it is not deleted.
5. External citations are re-checked when a document is used for an outside audience (a job application, a pitch, an audit), because a 2026 citation may be stale by the time it is read.

---

## Change log for this set

| Date | Change | By |
|---|---|---|
| 3 Nov 2026 | Set created: index, PRD, discovery, ADR log, technical manual, operations runbook, use-case dossier, user stories and journeys, developer workflow, QA evidence, security & compliance, hardware & environment spec, pre/post-programming checklists, infographic, and the anonymised career pack | i2sltd.tech |
| 3 Nov 2026 | `DEPLOYMENT-GUIDE.md` corrected: eight content pages carry timed ISR (300–3600 s) rather than all fourteen routes being immutable, which changes the staleness argument in §6.4 | i2sltd.tech |
| 3 Nov 2026 | `infographic.html` built (self-contained, no images, no network requests, print CSS) and the anonymised `../career-pack/` set created: case study, resume with placeholders, four letter variants, pitch kit, dated channel list, interview prep | i2sltd.tech |

*Next scheduled review: at the point a production host is assigned, and again 7 days before any public launch.*
