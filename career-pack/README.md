# Career Pack — Ola Western campaign platform

**Compiled:** 3 November 2026
**Owner:** David Akpoviroro Oke / i2sltd.tech
**Purpose:** turn one shipped project — the campaign website and documentation suite in `../ola-western-web` — into job-search and business-development material: a portfolio case study, a resume, cover letters, a pitch kit for selling to political principals, and a dated list of channels worth applying through.

> **Everything in this folder is a draft for a human to edit before it goes out.** Nothing here has been reviewed by the campaign, and no claim in it should be sent externally until the consent rule below is satisfied.

---

## 1. The consent and anonymisation rule (read before using anything here)

The campaign is a real client. Client confidentiality is the default expectation in political communications work, and in Nigeria the professional codes that practitioners are held to (NIPR's code of practice for public-relations practitioners, and the ANRP professional standards) require a practitioner not to disclose client information without consent. Treat that as binding regardless of whether it is legally enforceable in a given case.

Therefore:

1. **Externally-facing material is anonymised by default.** Say "a 2027 Lagos State House of Assembly candidacy (Amuwo-Odofin Constituency I)", "the candidate", "the party", "the campaign", "the desk". Never name the candidate, the party, or a principal in a resume, cover letter, portfolio page, GitHub README, LinkedIn post or cold email.
2. **Named disclosure requires written consent from the campaign.** If that consent is obtained, the anonymised file gets replaced by a named version, not edited in place, so the anonymised original survives as evidence of the default posture. The internal named record already exists in the project itself (`../ola-western-web/README.md` and `../ola-western-web/DEPLOYMENT-GUIDE.md`) and is the authoritative copy of who the client is.
3. **Do not publish the client's code, data or media.** `public/` holds 83 harvested press photographs with source credits belonging to third-party publishers, and `data/db.json` holds real people's names and contact details. Neither leaves the machine. Screenshots used in a portfolio must be of pages containing no personal data, or must be taken from the blueprint/privacy pages.
4. **Never present the honesty apparatus as marketing polish.** The self-audit score (40/100, "not ready to share"), the four `block` findings, the `[gap]` tags and the standing refusals are the most credible thing in this pack. A reviewer who catches you sanding them off stops trusting everything else.
5. **No synthetic imagery of the real candidate, anywhere, ever** — not in the portfolio, not in a mock-up, not "as an example of what we could do". That refusal is itself a portfolio item (see `PORTFOLIO-CASE-STUDY.md` §7).

---

## 2. Files in this pack

| File | What it is | Who reads it |
|---|---|---|
| `README.md` | This file: consent rule, file map, how to fill the placeholders | You |
| `PORTFOLIO-CASE-STUDY.md` | Long anonymised write-up of the project; the thing a hiring manager or a prospective client actually reads | Reviewers, clients |
| `RESUME.md` | Master resume with clearly marked placeholders, plus a per-role tailoring table | Recruiters, ATS |
| `COVER-LETTERS.md` | Two letters — political/campaign-tech role and remote software-engineering role — plus a short-form note | Recruiters |
| `PITCH-KIT.md` | Selling to a political principal: one-pager, WhatsApp and email scripts, discovery questions, objections, scope and pricing, delivery model, ethics line | Politicians, party officials |
| `CHANNELS.md` | Dated list of where this profile actually gets a response: vendor calls, job boards, freelance marketplaces, community channels, and the dead ends | You |
| `PROJECT-ENTRIES-AND-INTERVIEW-PREP.md` | Resume bullet bank, three project write-ups at different lengths, skills matrix with evidence, LinkedIn/GitHub copy, and the hard interview questions with answers | You, interviewers |

`infographic.html` (in `../ola-western-web/docs/`) is part of this pack's output even though it lives with the project: it is the single artefact you can attach to an application or a pitch and have it understood in five minutes.

---

## 3. How to fill the placeholders

Placeholders appear as `[[LIKE THIS]]` and are all in `RESUME.md` and `COVER-LETTERS.md`. They are there because the user directed that work history be left as clearly marked placeholders rather than invented. Do not let anyone — including an AI assistant — fill them by guesswork.

Before sending anything, replace or delete:

- `[[FULL NAME]]`, `[[PHONE]]`, `[[EMAIL]]`, `[[CITY]]`, `[[LINKEDIN]]`, `[[GITHUB]]`, `[[PORTFOLIO URL]]`
- `[[EMPLOYER 1 / ROLE / DATES / CONTEXT / OUTCOME]]` and the same for 2 and 3
- `[[EDUCATION]]`, `[[CERTIFICATIONS]]`, `[[LANGUAGES]]`
- Every `[[METRIC]]` — this pack deliberately does **not** state business outcomes (traffic, votes, contract value, delivery dates paid) because those belong to the client and were never measured in this session. Add only what you can prove.

Numbers that *are* safe are the ones measured against the codebase on 3 November 2026 and recorded in `../ola-western-web/docs/09-QA-AND-TEST-EVIDENCE.md`: 11,932 lines in `src/`, 34 API route handlers, 87.2 kB shared first-load JavaScript, 12 of 12 CMS gates passing, a self-audit score of 40 out of 100, 27 published photographs across 16 of 20 declared frames, 7 oEmbed-verified clips, 21 cited press references. Quote those with the date attached.

---

## 4. What this project actually proves about the maker

Stated as claims a reviewer could test:

1. **Can take an ambiguous brief to a shipped, built system.** Twelve public and admin routes, 34 endpoints, two storage backends, a production build verified locally.
2. **Can design something that is not a template.** The Live Desk (the public page is the CMS: ⌘E reveals 38 annotated sites, 25 field specs, 5 field kinds, ⌘K command deck, ⌘Z undo) is not a feature you copy out of a boilerplate.
3. **Writes constraints down and obeys them.** The publish gate refuses a record without an evidence link at the server, and the same rule that protects the campaign also blocks the person who built it from taking the easy way out — four evidence lines were left failing rather than filled with plausible links.
4. **Documents to a standard an auditor can use.** Thirteen dated documents, an ADR log, a QA evidence file that records commands and observed output rather than conclusions, a runbook with ten incident playbooks, a hardware and environment spec with its arithmetic shown.
5. **Knows what is not finished.** No version control, dev secrets unrotated, no CSP, no WCAG 2.2 audit, no lawyer review of the privacy wording, one endpoint that can hang — all of it written in the open, with owners and severities.
6. **Can work the regulatory environment.** NDPA 2023 mapped obligation by obligation, including s.30 (political opinions as sensitive data), with enforcement precedent dated; EU AI Act Art. 50 and platform political-ad rules reflected in the product's own policy.

That combination — builder, designer, documenter, and someone who will not lie about the state of the thing — is the pitch. It is worth more than the feature list.

---

## 5. Suggested order of use

1. Fill the placeholders in `RESUME.md`, then cut the role-specific one-page version.
2. Read `PORTFOLIO-CASE-STUDY.md` end to end and delete any sentence you cannot defend in an interview.
3. Pick two roles per week from `CHANNELS.md` §2/§3, send `COVER-LETTERS.md` letter A or B accordingly.
4. For political principals, use `PITCH-KIT.md` §2 (the 4-line WhatsApp) and carry the infographic as the attachment.
5. Keep a log of who was sent what, with dates — `CHANNELS.md` §7 has the format. Political-technology procurement moves through people who remember who emailed them.

---

## 6. Change log

| Date | Change | By |
|---|---|---|
| 3 Nov 2026 | Pack created: this index, anonymised case study, master resume with placeholders, two cover letters, pitch kit, dated channel list, bullet bank and interview prep | i2sltd.tech |

*Next review: when the campaign grants or refuses written permission to be named, and again before any application is submitted.*
