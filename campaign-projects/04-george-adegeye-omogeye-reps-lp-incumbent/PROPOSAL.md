# Hon. George Adegeye Olawande (Omogeye) — Incumbent Rep, Labour Party / NDC, Amuwo-Odofin Federal

## Profile & strategic context
- **Role:** **Sitting** Member, House of Representatives, defending the seat against APC resurgence.
- **Power map:** structural support in middle-class estates and commercial trading demographics; opposition-side challenge per the directory = matching APC's ward machinery.
- **Existential need:** this is a *defensive incumbency* campaign. Two weapons matter most: (a) a legislative record portal proving delivery, (b) election-day protection (PVT) because a close federal race will be contested at collation.

## Matched packages
| Priority | Package | Rationale |
|---|---|---|
| P1 | **4 — Social Listening & Rapid-Response Desk** | Incumbent = target. Continuous sentiment + misinformation alerts with human-approved rebuttals. |
| P1 | **Pathway 4 — PU Situation Room / Parallel Vote Tabulation** | Accredited agent portal: EC8A photo upload, OCR digitisation, offline-first for weak-signal PUs, incident reporting. |
| P2 | Legislative scorecard site | "What I delivered" record — bills, motions, constituency projects mapped ward by ward (incumbent content advantage, verified against House records). |
| P3 | Direct-voter SMS/WhatsApp protocols | Estate + trader mailing lists, NDPA-compliant. |

## Tailored technical plan
- Scorecard site cloned from `ola-western-web` base, LP colorway; `/record` page with delivery map; `/agent-login` portal.
- **PVT stack** (the differentiator pitch):
```sql
CREATE TABLE pu_agents (id UUID PK, pu_code TEXT UNIQUE, ward TEXT, agent_name TEXT,
  phone TEXT, accreditation_no TEXT, status TEXT DEFAULT 'trained');
CREATE TABLE result_uploads (id UUID PK, agent_id UUID REFERENCES pu_agents,
  ec8a_photo_url TEXT, ocr_votes JSONB, uploaded_at TIMESTAMPTZ,
  geotpoint GEOGRAPHY(POINT), verified BOOLEAN DEFAULT false);
```
  Low-bandwidth upload queue (retry-on-restored-signal), duplicate-detection between uploaded EC8A and INEC published results.
- Listening dashboard = rebranded `war-room-demo` with LP narrative categories.

## Contract phasing
1. Scorecard site + listening desk before canvassing season.
2. Agent recruitment/portal during mapping window.
3. **Election-day PVT drill** (dry run on a mock PU map) — sold as insurance; budget approvals spike pre-election.

## Risks/notes
- PVT tooling must be framed strictly as *observation and verification* of public results — lawful transparency, not interference. All uploads are of the publicly posted EC8A sheet.
