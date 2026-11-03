# Security and Compliance

**Document:** 10-SECURITY-AND-COMPLIANCE.md
**Version:** 1.0
**Written:** 3 November 2026
**Scope:** the campaign site, its CMS, its data stores and its third-party integrations.
**Position:** this is a small, high-consequence public asset owned by a political actor in an environment where the surrounding infrastructure has been hacked, impersonated and shut down within the last eight years. The threat model is written accordingly, and the compliance mapping is written against a statute with a live enforcement record.

> **Read the gaps column first.** Nothing here claims a security posture the evidence in `09-QA-AND-TEST-EVIDENCE.md` does not support. Where a control is described but not exercised on a production host, it says so.

---

## 1. Asset inventory — what we are protecting

| Asset | Why it matters | Loss impact |
|---|---|---|
| **Published content integrity** (record, rulings, copy, photos) | It is the campaign's authoritative statement. A sentence the campaign did not write is the worst outcome available | Existential for a reputation asset. Precedent: a Nigerian party's own site carried a document the party then disowned (APC, 12 Jan 2019) |
| **Volunteer and inquiry list** (names, phone numbers, ward, `consent_at`) | Personal data whose very existence expresses a political opinion | Legal exposure under NDPA 2023 s.30; human exposure to supporters if leaked |
| **Help Desk reports** | A resident describing a problem in their own words, with contact details | Retaliation risk against the resident; the most sensitive rows in the store |
| **Photo and video library** | Provenance is the claim: outlet credit + source link | A stand-in or AI image presented as documentary is a story about the campaign |
| **Availability during windows** (rumour, polling day) | An unavailable authoritative system is itself the news (INEC IReV, 25–28 Feb 2023) | The vacuum gets filled by whichever claim circulates first |
| **Domain and DNS** | Expiry or takeover redirects supporters to whoever holds the name | Permanent, and self-inflicted |
| **CMS credentials** | One password gates all of the above | Total, until rotated |

There is **no** payment data, no voter registration data, and no correspondence stored here — because those capabilities were deliberately excluded (PRD §12). That is the largest single reduction of attack surface in this project and it should be stated as a control, not as a scope note.

## 2. Authentication and session

| Property | Implementation | State |
|---|---|---|
| Scheme | Stateless signed cookie: base64url payload `{exp}` + HMAC-SHA256 signature over `ADMIN_SECRET` | deployed |
| Cookie | `ow_admin_session`, `httpOnly`, `sameSite: 'lax'`, `secure` when `NODE_ENV=production`, `path=/`, 12 h maxAge | deployed |
| Comparison | `crypto.timingSafeEqual`, with an explicit length check first because that function **throws** on unequal lengths | deployed — the length guard is a fixed bug, not original design |
| Password | `ADMIN_PASSWORD`, minimum 8 characters enforced in code | deployed |
| Fail-closed | In production with `ADMIN_PASSWORD` unset, `adminPassword()` returns `''` and **every login fails** | deployed (ADR-007) |
| Dev fallback | `ola-admin-2026` outside production, with a console warning | **present in the local environment — release-blocking** |
| Handler gating | Every `/api/admin/**` handler calls `isAdminRequest(req)` and returns `unauthorized()` | **reviewed, not asserted.** There is no middleware, so the check is per-route and forgettable. The gate script asserts it on a handful of handlers out of 27 |
| Authorisation roles | Single role — one shared credential for all editors | **by design, and a weakness.** No per-user identity, no attribution, no individual revocation |

**Known limits, stated because a reader will otherwise find them:**
1. A stolen session cookie is a legitimate session for up to 12 hours and cannot be individually revoked. Revocation = rotating `ADMIN_SECRET`, which ends every desk session.
2. No rate limiting on `/api/admin/login`, so the password is brute-forceable in principle. **Mitigation must be at the edge** (Cloudflare rule, Caddy `rate_limit`) since there is no app middleware — `DEPLOYMENT-GUIDE.md` §14 lists it; it is not yet configured anywhere, because there is no production host.
3. No CSRF token. `sameSite: 'lax'` blocks cross-site POSTs from top-level navigation, and the app has no GET-mutates-state handler — that pairing is what makes it safe rather than lucky. **Re-verify that pairing before adding any handler.**
4. No second factor. For a campaign CMS the realistic control is the shared-secret discipline in `05-OPERATIONS-RUNBOOK.md` §1 (one account per person, rotate on leaver, log issuance) plus edge IP allowlisting on `/admin`. A TOTP flow is a genuine option and is listed as a build candidate, not as present protection.

**Session probe:** `GET /api/admin/login` returns `{success:true, authenticated:<bool>}` and is how the Live Desk decides whether to render anything. It leaks nothing — it does not disclose that a cookie exists, only whether it verifies.

## 3. Threat model

Likelihood is judged for a state-level Lagos campaign in the 2027 window; impact for a reputation asset.

| # | Threat | Likelihood | Impact | Controls in place | Residual |
|---|---|---|---|---|---|
| T1 | **Credential theft / shared-password abuse** | Medium-High | High | httpOnly+SameSite cookie, HMAC signature, 12 h TTL, rotate-to-revoke, fail-closed prod, all handlers guarded | **Medium.** No MFA, no per-user identity, no app-side rate limit |
| T2 | **Unauthorised content change (defacement)** | Medium | Very High | Session gate; publish gate refuses an unsourced claim even from a legitimate session; `noindex` on admin; deploy-from-artefact makes a diff meaningful; backup + tombstone integrity | **Medium.** No immutable audit trail, no CSP, no publish approval step |
| T3 | **An unsourced or false claim published by the campaign itself** | **High — this is the expected failure** | Very High | `EVIDENCE_RULE` server-side on POST; evidence replaceable, never emptyable on PATCH; takedown only via DELETE; integrity rail grades existing rows `block`; one sentence everywhere so nobody learns the wrong rule | **Low-Medium.** 4 lines currently sit in exactly that state, and the gate cannot retro-refuse them |
| T4 | **Stand-in or AI-generated imagery presented as documentary** | Medium | Very High | `exact` frames refuse library browsing and the orientation fallback; no AI imagery in the library (constraint); outlet credit + source link on every press photo; 34% crop gate; header probe refuses HEIC and walks WEBP honestly | **Low.** Nothing cryptographically proves provenance — no C2PA, no watermark |
| T5 | **Leak of volunteer / resident contact data** | Medium | Very High | `toPublic()` strips name, phone, consent server-side **and** RLS mirrors it (ADR-025); reporter contacts visible only behind the session; anon key for reads, service role for writes; CSV export audit-dated; no voter data exists | **Medium.** A signed data-processing agreement between vendor and campaign does **not** exist. That is the top compliance gap |
| T6 | **SQL injection / stored XSS** | Low | High | No ORM/raw SQL in the file store; Supabase client is parameterised by construction; every link validated as real `http(s)` — a `javascript:` URL is refused (asserted by script); server-rendered React escapes by default | **Low.** No CSP yet, so an escaping bug has no second layer |
| T7 | **Path traversal via upload** | Low | High | Extension sniffed from bytes, not filename; ≥40 px/side, ≤10 MB; `purgeUpload` behind `path.resolve` + prefix check so a crafted `src` cannot escape the upload folder; only desk uploads are ever deleted, never bundled artwork | **Low** |
| T8 | **Denial of service / traffic burst** | Medium | Medium-High | ISR on 8 content pages; CDN in front by design; 87–102 kB JS; Path D static snapshot as a pre-decided fallback | **Medium.** Unload-tested, and the snapshot cadence is not automated |
| T9 | **Data loss (store wiped on a redeploy)** | Medium if the wrong host is chosen | Very High | Atomic tmp+rename writes with `EPERM/EBUSY/EACCES` retry; `DATA_DIR`; tombstones; daily backup; `0001/0002` migrations for the Postgres path | **Low once a host is chosen.** **High on a serverless filesystem — the file store cannot survive there (A19)** |
| T10 | **Silent write loss from a second writer** | Low now, high if scaled wrongly | High | Documented: one writer until Postgres; `/admin` prints the store it is saving to | **Medium.** No inter-process lock (ADR-029) |
| T11 | **Third-party dependency compromise** | Low | Medium | 4 runtime packages, pinned-ish ranges, no native binaries, no build-time code from the network beyond npm | **Low.** No `npm audit` gate in the workflow yet |
| T12 | **Impersonation of the campaign site** | **Medium-High and rising** | High | Canonical `NEXT_PUBLIC_SITE_URL`, CMS-managed official channel list, no payment collection, `noindex` admin | **High.** Precedent: INEC disowned a fake voter-registration portal collecting personal data on 3 Oct 2026. A public "what we will never ask for" statement is recommended and **not yet built** |
| T13 | **Domain expiry / DNS takeover** | Low | Very High | Monthly renewal check in the runbook §4 | **Medium** until someone owns that calendar item |
| T14 | **Supply-chain attack through a harvesting script** | Low | Medium | Scripts write through `/api/admin/**` with a real session, never touching `db.json`; outbound is HTTPS GET to known outlets; no arbitrary eval of fetched content | **Low** |
| T15 | **A War Room draft published without review** | Low by design | Very High | `POST /api/truth-room/sync` needs `WAR_ROOM_SECRET_KEY`; writes land for desk review; **no route publishes on a timer or webhook alone** | **Low.** The secret's default `warroom-dev` must be rotated |

## 4. Hardening applied, and what a production deployment must add

**Already in the build:**
- Six response headers on every path via `next.config.mjs`: HSTS `max-age=63072000; includeSubDomains; preload`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`, `X-DNS-Prefetch-Control: on`. Plus `poweredByHeader: false` and `reactStrictMode: true`.
- `images.remotePatterns` limited to `**.supabase.co` and `res.cloudinary.com` — the optimiser will not be pointed at an arbitrary host (ADR-020).
- Upload ceiling 10 MB, magic-byte type check, minimum dimensions.
- The remaining dev-secret literal `ola-western-cms-dev-secret` is a last-resort fallback in `secret()`. It is the reason `ADMIN_SECRET` is mandatory in production rather than recommended.

**Must be added at the edge, because the app has no middleware:**
1. Rate limiting on `/api/admin/login` and on `/api/volunteer`, `/api/inquiry`, `/api/issues` (abusable forms).
2. IP allowlist on `/admin` and `/api/admin/**` during quiet periods.
3. WAF managed rules; on Cloudflare this is a plan decision, not a code change.
4. A **Content-Security-Policy**, starting `default-src 'self'`, with `img-src` extended to the image hosts and `frame-src https://www.youtube-nocookie.com` for the video facade. Ship it reporting-only first — `next/image` and the iframe injection are the two likely breakers. Deferred by ADR-032, due before the site is publicly named.
5. Header verification after every deploy: `curl -sI` and grep for `strict-transport-security`. A proxy can strip them silently, and the static export carries none at all (ADR-030).

**Not yet done anywhere:** secrets rotation (the three dev values are live locally), a restore drill, `npm audit` in CI, an auth assertion for all 27 admin handlers, and any production-host test.

## 5. Data protection — NDPA 2023 mapping

**Why this is the most important section of this file for a political site.** NDPA 2023 **s.30 lists political opinions as sensitive personal data**. Every form on this site collects information whose submission *is* a political expression. That is not a footnote; it sets the standard the whole capture layer has to meet.

| Obligation | Where the Act puts it | How this product meets it | Gap / action |
|---|---|---|---|
| Lawful basis | s.25(1) — consent, contract, legal obligation, vital interests, public interest, legitimate interests | Consent for volunteers (`/join`, required checkbox) and for Help Desk reports (explicit consent on the form); no other basis claimed | The basis must be **stated in `/privacy` in the words the campaign's lawyer approves** |
| Consent quality | s.26 — burden on the controller; silence/inactivity is **not** consent; withdrawal must be as easy as giving it | Explicit unticked checkbox with a purpose statement; consent timestamp stored (`volunteers.consent_at`) | **No self-service withdrawal path.** A supporter withdraws by messaging a human. Acceptable for v1; must be written into the notice |
| Transparency / notice | s.27 | NDPA disclosure on every capture form; `/privacy` page; `/contact` names the campaign | **`/privacy` has not been read by a lawyer.** Release-blocking item |
| Data minimisation | s.24 principles | Name/number **optional** on a Help Desk report; only ward+category+detail are required; reporter PII stripped from every public response server-side; no voter data collected at all; no payment data | none known |
| Purpose limitation / retention | s.24, s.29-era practice | The runbook §9 forces the post-election decision (hand over / archive / delete) with a date | **Undecided.** Retention beyond purpose is live exposure |
| Security of processing | s.29 / GAID | Session-gated access; separate read and write credentials; HTTPS + HSTS; no anonymous write path; the service-role key is never a `NEXT_PUBLIC_*` value | **No signed data-processing agreement between vendor and campaign.** The vendor holds controller data on the campaign's behalf without written terms — the top legal gap, above the CSP |
| Data-subject rights | s.34 — confirmation, access, copy, rectification, **erasure**, restriction; objection s.36; automated decisions s.37 | Manual fulfilment path documented in runbook §7.10: locate, act through the CMS so cache and tombstones stay correct, purge the orphaned upload, record the date | No self-service DSR endpoint; **no automated decision-making exists to object to**, which is the comfortable answer to s.37 |
| DPIA | s.28 | Not performed. A political campaign collecting sensitive-category data at volunteer-drive scale is the paradigm case for one | **Action: a two-page DPIA before any national reuse** |
| Regulator | s.4 — Nigeria Data Protection Commission | — | Enforcement is real: ₦555.8m on Fidelity Bank (22 Aug 2024), ₦766m on MultiChoice Nigeria (7 Jul 2025), compliance notices plus a 1,368-organisation defaulter list (Aug 2025), and a settled/annulled ₦32.8m-equivalent action against Meta (Oct 2025). Sources in `02-…DISCOVERY.md` §3.3 |

Operationalising instrument: the **NDPA General Application and Implementation Directive (GAID), issued 20 March 2025** — read it before the national reuse, not before this launch.

**European exposure, recorded rather than dismissed.** The site is readable from anywhere and `/join` will be filled by diaspora supporters. Under GDPR, political opinions are Art. 9(1) special-category data; **Recital 56 expressly contemplates parties compiling such data in electoral activities for reasons of public interest, subject to suitable safeguards**. This product does not claim GDPR compliance; it records that a national or diaspora-facing campaign needs one, and the safeguards are not exotic — purpose notice, minimisation, stored consent, an erasure path, and no transfers nobody can describe.

## 6. Political-advertising and platform rules that touch this site

The site's main distribution channel is a forwarded link, so platform policy is part of its operating environment. **Meta** requires political/social-issue advertisers to verify identity and carry a "paid for by" disclaimer, and requires disclosure where such ads use AI to create or alter photorealistic image, video or realistic audio (announced 28 Nov 2023, in force from Jan 2024; organic AI labelling from May 2024; **automated AI-detection labelling of ad media reportedly begins 1 Jun 2026 — [unverified, re-read in a browser before relying on it]**). Meta's Coordinated/Inauthentic Behaviour standard (enforcement category since 6 Dec 2018) prohibits misrepresenting ownership or control. The **EU AI Act Art. 50** deepfake-disclosure duties have applied since 2 Aug 2026 with **no campaign carve-out**.

**Product consequences, already satisfied:** no AI-generated imagery of the candidate anywhere; outlet credit and source URL on every press photo; no bot, bulk-messaging, or automated-posting capability that could be read as misrepresentation; the campaign never initiates a WhatsApp message except to a person who volunteered, and that send is a template to a consenting number. **Consequence not satisfied:** if the campaign later buys political advertising, identity verification and the "paid for by" disclaimer are HQ's obligations, not the site's, and nobody has been told that yet. Add it to the go-live briefing.

## 7. Content-integrity controls (the part that is unusual about this file)

A campaign site's likeliest security incident is not a break-in; it is **its own team publishing something it cannot defend**. The controls that address that are treated here as security controls, deliberately:

- **Evidence on creation, server-side.** `POST /api/admin/record` and `/api/admin/fact-checks` refuse a row without its report link. Asserted by script (E2), twice.
- **Evidence cannot be emptied.** `PATCH` may replace; `DELETE` is the only takedown. Asserted. This closes the "soften the claim in place" path, which is the path a panicked desk takes at 22:00.
- **Pre-gate rows are graded, not grandfathered.** Four published lines are `block`. They stay visible and stay blocking.
- **A frame that asserts a fact refuses a stand-in.** `exact` slots take uploads only. Four frames are consequently empty on a live campaign site, which is the correct output of an honest system.
- **Withdrawal is durable.** Tombstones stop a content bundle from resurrecting a retracted citation.
- **The rail is a measurement of content, not of tool usage**, so it cannot be farmed by editing more, and its capped-weight formula means deleting the worst line buys no score.
- **Nothing generates text.** ⌘K parses; no model in the editing layer; the War Room writes only what a human approved. A fabricated sentence about a real person is the one input this system refuses at the architecture level.
- **Captions state only what the report states.** The harvesters refuse to describe a photo as showing the candidate unless the article puts him in it.

## 8. Accessibility and inclusion posture

There is **no binding web-accessibility statute in Nigeria reaching a campaign website**. The nearest instruments are the Discrimination Against Persons with Disabilities (Prohibition) Act 2018 with the NCPWD Accessibility Regulations 2023 (implementation nascent) and NITDA's *Standards and Guidelines for Government Websites* v3.2.1 §5.3.3.1, which tells government agencies to adopt WCAG — guidance, for government sites, pre-dating WCAG 2.2. The NCC Consumer Code of Practice Regulations 2024 covers complaint channels, not websites.

**Therefore the posture is: build to WCAG 2.2 as a voluntary standard, and describe the audit state accurately.** Met today: 2.5.8 exceeded (44–48 px against a 24 px floor), 1.4.3 body-text AA with the gradient/pattern exclusion stated, `prefers-reduced-motion` honoured, 3.3.8-class authentication (a password, no cognitive test), labels and hints on forms, no colour-only status meaning in the ledger chips. **Not met or unknown:** 2.2.2 Pause, Stop, Hide needs an explicit pause/stop control on the auto-advancing carousel and the animated stat strip — an **A**-level criterion and the clearest finding of the standards research; 2.4.11 Focus Not Obscured is untested under the sticky header and thumb bar; keyboard-only and screen-reader paths are unaudited. **Claiming "fully accessible" would itself be an unsourced published claim**, which is the one thing this product is designed to refuse.

## 9. Compliance and security backlog, ranked

| # | Item | Why this rank | Effort |
|---|---|---|---|
| 1 | Sign a data-processing agreement between vendor and campaign; decide retention | Sensitive-category data held without written terms, by a regulator that is actively fining | Days, and it is paperwork not code |
| 2 | Rotate all three dev secrets before any public deployment | Release-blocking; the fallbacks are known strings | Minutes |
| 3 | Legal review of `/privacy`; state the lawful basis and the withdrawal path | s.27 and s.26 obligations | A lawyer's hour |
| 4 | Add auth assertions for all 27 admin handlers to the gate script | The per-route guard is forgettable and only a sample is asserted | Half a day |
| 5 | Rate limiting + `/admin` allowlist at the edge | Login has no app-side throttle | Config, once a host exists |
| 6 | Content-Security-Policy, reporting-only then enforce | Only layer against an escaping bug | A day, plus breakage testing |
| 7 | Timeout on `/api/volunteer`'s outbound calls | A known defect at the campaign's most valuable moment | An hour |
| 8 | Explicit pause/stop control on carousel and stat ticker (WCAG 2.2 **2.2.2**) | An A-level criterion, cheap, and found by research rather than by a user | A morning |
| 9 | Publish a "what we will never ask for" statement | Current impersonation risk in Nigeria; no code required | An afternoon of copy |
| 10 | Two-page DPIA before any national or multi-campaign reuse | s.28, and reuse is where scale meets sensitivity | A day |
| 11 | Full WCAG 2.2 audit (keyboard + assistive tech) | Currently unmeasured; the honest gap in every claim | A week, or a consultant |
| 12 | Backup restore drill, timed, on a scratch box | Recovery time is currently arithmetic, not measured | Two hours |

### Change log

| Date | Change | By |
|---|---|---|
| 3 Nov 2026 | v1.0: asset inventory, session/security analysis with its four stated limits, 15-threat model, hardening applied vs edge-required, NDPA obligation-by-obligation mapping, platform and AI-transparency rules, content-integrity-as-security section, accessibility posture, 12-item ranked backlog | i2sltd.tech |
