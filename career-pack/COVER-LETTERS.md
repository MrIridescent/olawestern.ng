# Cover letters and outreach notes

**Compiled:** 3 November 2026 · Anonymised by default (`README.md` §1)
Fill `[[DOUBLE-BRACKETS]]`. Do not send a letter that still contains a bracket. Keep every number with its date. Length target for all of these: **under 320 words** — recruiters and campaign managers skim, and a long letter about a project they did not ask for is the fastest way to be skipped.

Four variants: A (campaign / civic-tech role), B (remote software-engineering role), C (short note for a job board or email), D (expression of interest against an NGO or donor vendor call).

---

## Letter A — campaign, civic-tech, election-integrity or political-communications technology

> **Subject:** Re: [[ROLE TITLE]] — I build the record layer campaigns forget they need
>
> Dear [[NAME / HIRING MANAGER]],
>
> I designed and built the campaign platform for a 2027 Lagos State House of Assembly candidacy in Amuwo-Odofin Constituency I. The brief I was given was "public relations and reputation management". What the information environment actually required was something narrower and harder: a public record that survives being asked *how do you know?*
>
> Two decisions shaped the system. Claims about the world — track-record entries and Truth Room rulings — cannot be created without an evidence link, enforced in the server rather than in a style guide, and an evidence link can be replaced but never emptied. And the site computes its own trust score against those rules, publishes the findings, and refuses to be shared until the score earns it. It currently reads **40 out of 100, with four published lines graded `block`**. I left those four unfilled rather than inventing plausible-looking sources, which is the part of the project I would defend hardest in an interview.
>
> The rest of it is ordinary engineering done carefully: Next.js 14 and TypeScript, 12 routes, 34 API handlers, dual storage backends, signed-cookie admin auth, 87.2 kB of shared first-load JavaScript on mobile-first pages, a CMS that is the public page itself (⌘E reveals 38 editable regions from a 25-field contract), a 13-document set including an incident runbook and an NDPA 2023 obligation mapping, and a hosting analysis that explains why full serverless does not work for this system.
>
> I am applying for [[ROLE]] at [[ORGANISATION]] because [[ONE SPECIFIC SENTENCE ABOUT THEIR ACTUAL WORK — name the project, the programme, the tender number]]. My background is [[[[YEARS]] years / freelance via i2sltd.tech / YOUR REAL FRAME]], and I work comfortably across [[CITY/LAGOS]] time zones with distributed teams.
>
> Could I send you the case study, or walk you through the failing audit findings in a call? The second is more useful than the first.
>
> Yours sincerely,
> [[FULL NAME]] · [[PHONE]] · [[EMAIL]] · [[PORTFOLIO URL]]

*(Word count ≈ 320. Cut the fourth paragraph for a first touch.)*

---

## Letter B — remote software-engineering role

> **Subject:** Re: [[ROLE TITLE]] — TypeScript/Next.js engineer, ships with the docs attached
>
> Dear [[NAME / TEAM]],
>
> I build full-stack TypeScript systems and I write the documentation that makes them operable by people who did not build them. Most recently I owned a Next.js 14 / React 18 / Tailwind campaign platform end to end: 12 page routes, 34 API route handlers, dual storage (atomic flat-file plus Supabase Postgres with migrations), stateless HMAC-SHA256 signed-cookie auth that fails closed when a secret is unset in production, and 87.2 kB of shared first-load JS across 8 ISR and 6 immutable prerendered routes — verified against `npx tsc --noEmit` (exit 0), a behavioural gate script (12/12) and a production build on 3 November 2026.
>
> Two things about how I work are worth naming.
>
> I look for the constraint worth designing into the system rather than writing down as policy. The client asked for "a CMS never conceived"; what shipped is the public page as the editing surface — a declarative 25-field contract drives annotation, in-place editing, validation and the admin fallback, and anonymous visitors receive zero editable DOM. The client asked for reputation management; what shipped is a server-side publish gate that refuses an unattested claim and an integrity rail that grades the site's own trustworthiness.
>
> And I report the state of the thing accurately, including where it is worse than I claimed. That project has no version control, unrotated development secrets, no CSP, an endpoint that can hang because a fire-and-forget promise has no timeout, and a self-audit score of 40/100. All of it is in the risk register with owners and severities, and two of my own documentation errors — a wrong prerender claim and an invalid browser-cache verification — are recorded as findings rather than quietly replaced.
>
> I am interested in [[ROLE]] at [[COMPANY]] because [[SPECIFIC REASON: the stack, the problem, one thing they shipped]]. I am at [[CITY]] ([[TIMEZONE]]) and [[AVAILABLE FROM / NOTICE PERIOD]].
>
> Happy to take a code exercise or walk through the architecture decisions (32 ADRs) — whichever is more useful to you.
>
> Best regards,
> [[FULL NAME]] · [[PHONE]] · [[EMAIL]] · [[GITHUB]] · [[PORTFOLIO URL]]

---

## Note C — short form (job boards, LinkedIn, referral emails)

> [[ROLE]] at [[COMPANY]] — I think I'm the unusual fit.
>
> I own full-stack TypeScript/Next.js systems end to end and document them to a standard an auditor could use. Latest: a public record system for a 2027 Lagos State legislative campaign — 12 routes, 34 API handlers, dual storage backends, signed-cookie auth, 87.2 kB shared JS, mobile-first, a CMS that *is* the public page, and a publish gate that refuses to create an unattested claim. 13 dated documents, 32 ADRs, a 10-playbook incident runbook.
>
> It also self-reports a trust score of 40/100 and won't let itself be shared until that changes. I built the honesty machinery and then refused to game it.
>
> [[ONE LINE: your real availability / relevant past role]]. Portfolio: [[PORTFOLIO URL]] — worth five minutes.

---

## Note D — expression of interest against a vendor call or framework

Use for the channels in `CHANNELS.md` §3 (NGO / donor / electoral-body vendor lists). Formal, evidence-forward, no adjectives.

> **Re: [[CALL TITLE AND REFERENCE NUMBER]]**, published [[PUBLICATION DATE]] by [[ORGANISATION]].
>
> I am submitting interest in [[LOT / SCOPE AREA]] as [[SOLE PROVIDER / UNDER i2sltd.tech — REGISTRATION NUMBER IF ANY]].
>
> Relevant delivered work: design, implementation and documentation of a public campaign information platform for a 2027 Lagos State House of Assembly candidacy. Scope covered: requirements definition (34 functional and 15 non-functional requirements with enforcement and acceptance criteria); architecture and implementation (Next.js/TypeScript, 12 routes, 34 API handlers, two storage backends, session-gated administration); accessibility and performance work to WCAG 2.2 and Core Web Vitals thresholds; data-protection mapping against the Nigeria Data Protection Act 2023, including section 30 treatment of political opinions as sensitive data; an operations runbook with ten incident playbooks; QA evidence recording commands, dates and observed output; and a hosting and hardware specification with a traffic model.
>
> Verification available on request: clean TypeScript type-check, 12 of 12 behavioural gate assertions, production build manifest, and the full 13-document set.
>
> Limits I will state rather than let you discover: the system is not yet deployed to production (no host assigned); a full WCAG 2.2 audit has not been performed; the privacy text has not been reviewed by a lawyer; the project has no version-control history. Each is recorded in the release checklist as a gate before go-live.
>
> Available: [[DATES]]. Team: [[WHO DOES WHAT]]. References: [[REFERRAL CONTACT, WITH PERMISSION]].
>
> [[FULL NAME]], [[TITLE]], i2sltd.tech · [[PHONE]] · [[EMAIL]] · [[PORTFOLIO URL]]

**Do not submit Note D until you have read the eligibility and registration requirements of the specific call.** Several donor and electoral-body vendor processes require a registered legal entity, tax identification, audited accounts, or a specific country registration; I could not verify those requirements for any individual call as at 3 November 2026, and submitting an expression of interest that fails on paperwork costs you nothing but attention you will want later.

---

## Rules that apply to all four

1. **Name the recipient's actual work in one specific sentence.** Generic letters to campaign-tech organisations get deleted; the ones that reference a named programme, tender or shipped product get a reply.
2. **Lead with the decision, not the stack.** The publish gate and the Live Desk are the hook; TypeScript is the assumption.
3. **Include the 40/100.** It has never cost an applicant an interview and it has never not been remembered.
4. **Never name the client** unless written consent exists (`README.md` §1). "A 2027 Lagos State House of Assembly candidacy (Amuwo-Odofin Constituency I)" is complete and verifiable enough.
5. **No metric you cannot show the source of.** Business outcomes — traffic, sign-ups, votes, fees — belong to the client and are not in this pack.
6. **Keep the refusals.** "Refused to fabricate four evidence links" is a stronger seniority signal than any framework name in the list.

## Change log

| Date | Change | By |
|---|---|---|
| 3 Nov 2026 | Four letter variants created from the measured project record in `docs/09` | i2sltd.tech |
