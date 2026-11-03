# Hon. Rauf Olawale Age-Sulaimon (Wale Rauf) — APC State House of Assembly, Constituency 02 (incumbent candidate)

## Profile & strategic context
- **Office:** State Assembly Constituency 02 — **Trade Fair Complex, Satellite Town, industrial zones, riverine Ibassa Ijegun-Egba**. Returning lawmaker + secured APC endorsement.
- **Defining constraint (from the directory):** *variable internet across coastal settlements.* His campaign needs **low-bandwidth-first infrastructure** — this is the cleanest technical fit in the whole directory.
- **Platform anchors:** local infrastructure, marine transport safety, commercial trade security.

## Matched packages
| Priority | Package | Rationale |
|---|---|---|
| P1 | **2 — Automated WhatsApp Canvassing Network (voice-first)** | Bulk **voice broadcasts** in Yoruba/Pidgin/Hausa for riverine & trader populations; status-card images ≤80 KB. |
| P1 | **Offline-first voter verification DB** | Canvasser Android app with local cache + sync-on-signal; PU rosters for Ibassa/Satellite remain usable with 0 bars. |
| P2 | **1 — CRM with trade-segment profiling** | Unions, transport assoc., Trade Fair traders, boat-owners — segment by livelihood, not just ward. |
| P3 | SMS fallback gateway | 160-char GOTV blasts through a licensed aggregator for the truly offline. |

## Tailored technical plan
- Lightweight site (3 pages max, <300 KB total payload, static-rendered; the `ola-western-web` base with media diet) + `/voice` broadcast console.
- `whatsapp_broadcast_queue`, `voter_roster_offline` (PU-scoped, encrypted at rest), `sms_jobs` tables.
- Canvasser PWA: service-worker cached rosters; conflict-safe sync; battery-light.
- **Marine-safety + trade-security content calendar** auto-distributed on Mondays/Thursdays.

## Contract phasing
1. Mapping window: offline rosters loaded per PU, verified with ward leaders in Satellite/Ibassa.
2. Canvassing: voice-broadcast cadence + trader-segment ads.
3. Election day: offline PU tallies sync at first signal — riverine results reported before lag kills them.

## Risks/notes
- Voice-broadcast legality: aggregator must honour STOP-wording opt-outs; consent captured at first contact; no spam-clock sending (residential riverine communities punish it politically).
