# Ola Western Campaign — Operator Manual

How to add the remaining AI keys to Netlify, deploy the change, and prove the six-key rotation is live — without breaking the site.

Site: `https://olawestern.ng`
Netlify site ID: `d07bfb40-965b-4307-bdc8-4b10e41c3cb4`
Repo: `MrIridescent/olawestern.ng` (branch `main`)

---

## 0. What is missing, and what this manual can and cannot do

The Truth Desk supports three keys per provider. Production currently has one:

| Variable | Production status |
| --- | --- |
| `OPENAI_API_KEY` | Set |
| `OPENAI_API_KEY_2` | **Missing** |
| `OPENAI_API_KEY_3` | **Missing** |
| `GEMINI_API_KEY` | Set |
| `GEMINI_API_KEY_2` | **Missing** |
| `GEMINI_API_KEY_3` | **Missing** |

The four missing values do not exist in `.env`, `.env.local`, the repo, or Netlify. No code change is required — the rotation reads the slots at runtime. Only you can supply the key values, which you paste yourself in Netlify or into a local prompt. Never send them through chat, a ticket, a screenshot, or a commit.

Once the four values are in place, the application automatically:

- starts each question on the next key in line (round-robin),
- retries the next key when one is rejected, rate-limited, times out, or errors,
- rests a rejected key for 30 minutes and a rate-limited key for 5 minutes,
- falls back from OpenAI to Gemini when the whole OpenAI chain is exhausted.

---

## 1. Before you start

You need:

1. A Netlify login that can edit the `olawestern` site.
2. Netlify CLI available through `npx` (already installed in this repo). Confirm:

   ```bash
   npx netlify --version
   ```

3. The repo checked out and linked. Confirm the link:

   ```bash
   cat .netlify/state.json
   ```

   It must show `"siteId": "d07bfb40-965b-4307-bdc8-4b10e41c3cb4"`.

4. Access to the OpenAI dashboard and Google AI Studio for the accounts that own the extra keys.

### Golden rules

- Never paste a key into a chat window, GitHub issue, screenshot, or commit.
- Never run bare `netlify env:list` on this project. It prints values to the terminal. Use the name-only command in section 5.1.
- Add keys as **secret** variables. Once marked secret, Netlify will not display the value again.
- Environment changes take effect only on a **new deploy**.
- Rotating keys is for resilience. It does not multiply an organization-level quota. Use keys you are entitled to; if you need more capacity, raise the provider plan.

---

## 2. Get the four keys

### 2.1 OpenAI (`OPENAI_API_KEY_2`, `OPENAI_API_KEY_3`)

1. Sign in at `https://platform.openai.com/`.
2. Open **API keys** in the left sidebar.
3. Select **Create new secret key**.
4. Name it so you can identify it later, for example `olawestern-truth-2`.
5. Choose the project you want to bill. A key belongs to a project inside an organization.
6. Copy the key immediately. It starts with `sk-` and is shown once.

Repeat for the third key with a distinct name, for example `olawestern-truth-3`.

If the **Create new secret key** button is disabled, your role lacks permission. Ask the organization owner to create the key or to grant your account key-management access.

### 2.2 Google Gemini (`GEMINI_API_KEY_2`, `GEMINI_API_KEY_3`)

1. Sign in at `https://aistudio.google.com/app/apikey`.
2. Select **Create API key**.
3. Choose a Google Cloud project. To get independent quota, choose a **different project** from the first key. Keys in the same project share that project's quota.
4. Copy the key. It usually starts with `AIza`.

Repeat for the third key in a third project if independent quota matters.

### 2.3 The quota truth, stated plainly

- OpenAI usage limits are enforced per organization and per project. Three keys in one project do **not** triple your limit; they spread per-key rate limits and keep the desk answering if one key is individually throttled or revoked.
- Gemini free-tier quota is per project. Three keys in one project share one quota. Separate projects give separate quotas, subject to Google's terms.
- The rotation is a failover mechanism. It is not a way to evade billing or usage policies.

---

## 3. Add the keys to Netlify

Choose one method. The dashboard is the least error-prone; the CLI is faster once you are linked.

### Option A — Netlify dashboard (recommended)

1. Open `https://app.netlify.com/` and select the **olawestern** site.
2. Go to **Site configuration**.
3. In the left menu, choose **Environment variables**.
4. Select **Add a variable** → **Add a single variable**.
5. Fill in:
   - **Key**: `OPENAI_API_KEY_2`
   - **Value**: paste the key, with no leading or trailing spaces.
   - **Scopes**: tick **Builds**, **Functions**, and **Runtime**.
   - **Deploy contexts**: tick **Production**. Add **Deploy previews** and **Branch deploys** only if you want the desk active there too.
   - **Contains secret values**: tick this.
6. Select **Create variable**.
7. Repeat steps 4–6 for `OPENAI_API_KEY_3`, `GEMINI_API_KEY_2`, and `GEMINI_API_KEY_3`.

Do not create empty variables. An empty slot is treated as absent, and a placeholder value such as `change-me` will be attempted as a real key and waste an attempt.

### Option B — Netlify CLI (no key in shell history)

Run each block separately in Git Bash from the repo root. The `read -s` prompt hides typing, and the variable is unset afterwards.

```bash
read -r -s -p "Paste OPENAI_API_KEY_2: " K; echo
npx netlify env:set OPENAI_API_KEY_2 "$K" --context production --scope builds functions runtime --secret --force
unset K
```

```bash
read -r -s -p "Paste OPENAI_API_KEY_3: " K; echo
npx netlify env:set OPENAI_API_KEY_3 "$K" --context production --scope builds functions runtime --secret --force
unset K
```

```bash
read -r -s -p "Paste GEMINI_API_KEY_2: " K; echo
npx netlify env:set GEMINI_API_KEY_2 "$K" --context production --scope builds functions runtime --secret --force
unset K
```

```bash
read -r -s -p "Paste GEMINI_API_KEY_3: " K; echo
npx netlify env:set GEMINI_API_KEY_3 "$K" --context production --scope builds functions runtime --secret --force
unset K
```

If a command reports `Not logged in`, run `npx netlify login` once and retry.

### Option C — Local development only

To exercise the rotation on your machine, put the same four names in `.env.local` (never `.env`, never a tracked file):

```dotenv
OPENAI_API_KEY_2=...
OPENAI_API_KEY_3=...
GEMINI_API_KEY_2=...
GEMINI_API_KEY_3=...
```

Then restart `npm run dev`. `.env.local` is gitignored; confirm with:

```bash
git check-ignore -v .env.local
```

---

## 4. Deploy the change

Environment variables are read by the running function. A new deploy is required.

### 4.1 Normal path (when build credits are available)

```bash
npx netlify deploy --build --prod --site d07bfb40-965b-4307-bdc8-4b10e41c3cb4
```

Or push to `main` if Git-triggered builds are enabled.

### 4.2 Current path (build credits exhausted)

Git-triggered builds are currently skipped with `Skipped due to account credit usage exceeded`. Build locally, upload a draft, then promote it through the API.

Step 1 — verify the code before building:

```bash
npx tsc --noEmit
npm run lint
```

Step 2 — build and upload a draft:

```bash
npx netlify deploy --build --site d07bfb40-965b-4307-bdc8-4b10e41c3cb4
```

Wait for `Deploy is live!` and copy the **Deploy ID** from the output. It looks like `6aef68c130de4b802cb368f5`.

Step 3 — promote that deploy to production:

```bash
npx netlify api restoreSiteDeploy --data '{"site_id":"d07bfb40-965b-4307-bdc8-4b10e41c3cb4","deploy_id":"PASTE_DEPLOY_ID_HERE"}'
```

Step 4 — confirm the live deploy changed:

```bash
npx netlify api getSite --data '{"site_id":"d07bfb40-965b-4307-bdc8-4b10e41c3cb4"}' | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);console.log(j.published_deploy.id, j.published_deploy.created_at)})"
```

The printed ID must match the Deploy ID you promoted.

If `netlify deploy --build --prod` returns `JSONHTTPError: Forbidden`, do not retry it. Use the draft-and-promote path above; that path is known to work on this account.

---

## 5. Verify, in order

### 5.1 Confirm the variable names exist (values stay hidden)

```bash
npx netlify env:list --context production --json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);console.log(Object.keys(j).sort().join('\n'))})"
```

You should see all six names:

```
GEMINI_API_KEY
GEMINI_API_KEY_2
GEMINI_API_KEY_3
OPENAI_API_KEY
OPENAI_API_KEY_2
OPENAI_API_KEY_3
```

Never run `npx netlify env:list` by itself; it prints secret values.

### 5.2 Confirm the deployed app sees all six

```bash
curl -s https://olawestern.ng/api/truth-room/chat | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);console.log(JSON.stringify(j.providers,null,2))})"
```

Expected:

```json
[
  { "id": "openai", "configured": true, "model": "gpt-4o-mini", "keys": 3 },
  { "id": "gemini", "configured": true, "model": "gemini-3.5-flash", "keys": 3 }
]
```

If a provider still shows `"keys": 1`, the variable is in the wrong context, the wrong scope, or the deploy predates the change. Fix the variable, redeploy, and check again.

If `"keys"` is lower than the number of variables you added, two slots hold the **same key**. The pool de-duplicates identical strings by design.

### 5.3 Confirm a real answer, not a canned one

```bash
curl -s https://olawestern.ng/api/truth-room/chat \
  -H 'content-type: application/json' \
  -d '{"question":"What seat and party is Ola Western contesting?"}' \
  | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);console.log(j.success, j.provider, j.model, j.latencyMs);console.log((j.answer||j.error||'').slice(0,300))})"
```

A healthy response has `success: true`, a `provider`, a `model`, a latency, a written answer, and source chips. It must not be a fixed string.

### 5.4 Prove the rotation is cycling

The cursor advances on every question, so three consecutive questions exercise all three keys of the active provider. Send three:

```bash
for i in 1 2 3; do
  curl -s https://olawestern.ng/api/truth-room/chat \
    -H 'content-type: application/json' \
    -d '{"question":"What does a Lagos State lawmaker actually control?"}' \
    | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);console.log(j.provider, j.model, j.latencyMs, j.success)})"
done
```

Then check the function log for a failed key. If a key was rejected or throttled, the rotation logs a line that names the position, never the key:

```
[truth-ai] openai key 2/3 failed (PROVIDER_RATE_LIMIT); trying key 3.
```

Where to read it:

1. Netlify dashboard → **olawestern** → **Logs** → **Functions**.
2. Filter for `truth-ai` or `truth-room/chat`.
3. Confirm the desk still answered while rotating.

If all three keys of a provider are rejected, the API returns `401` with `All 3 configured OpenAI keys were rejected.` Replace the bad key; do not add a fourth slot, because only `_2` and `_3` are read.

### 5.5 Confirm the UI

1. Open `https://olawestern.ng/truth-room`.
2. Ask: “Why should I vote Ola Western over anyone else?”
3. Confirm a sourced answer appears, with source chips and no console errors.
4. Open DevTools → **Network** → the `chat` request → confirm status `200`.
5. Check the phone layout at 390 px wide before signing off.

---

## 6. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Status shows `keys: 1` after deploy | Variable added only to another context, or the deploy is older than the change | Re-add with **Production** context and **Builds + Functions + Runtime** scopes, then redeploy |
| Status shows `keys: 2` when three variables exist | Two slots contain the identical key string | Use three distinct keys |
| `503 AI_NOT_CONFIGURED` | No key visible to the runtime | Check scopes, redeploy, and re-check status |
| `401` and “All 3 … keys were rejected” | Keys revoked, wrong project, or copied with whitespace | Regenerate and re-set each key; paste without spaces |
| `429 RATE_LIMITED` from our route | More than 10 questions per minute from one IP | Wait for the window to reset; this is our own guard, not the provider |
| Answers work but one provider never appears | `TRUTH_AI_PROVIDER` is pinned to the other provider | Set `TRUTH_AI_PROVIDER=auto` (or the intended provider) and redeploy |
| `/api/...` returns HTML or `404` | A static export was deployed instead of the SSR build | Deploy with the native Next.js runtime; publish directory must be `.next`, plugin `@netlify/plugin-nextjs` |
| Netlify build skipped: credits exceeded | Account build credits are exhausted | Use the local build + draft + `restoreSiteDeploy` path in section 4.2 |
| Admin login returns `401` after env edits | `ADMIN_PASSWORD`/`ADMIN_SECRET` were changed or differ between local files | Set the intended pair in Netlify Production, redeploy, sign in with that pair |
| New env var seems ignored | Netlify does not hot-reload runtime variables | Redeploy after every change |

---

## 7. Key hygiene

1. Mark every key as **secret** in Netlify. Once secret, the dashboard will not reveal it again.
2. Keep `.env` and `.env.local` out of Git. Verify:

   ```bash
   git check-ignore -v .env .env.local
   ```

3. Before every commit:

   ```bash
   git status --short
   git diff --cached
   ```

   If a key ever appears in a diff, stop, revoke it at the provider, then rewrite the history before pushing.
4. If a key is exposed (chat, screenshot, ticket, screen share), treat it as compromised:
   - revoke it in the OpenAI or Google console,
   - overwrite the Netlify slot with a new key,
   - redeploy,
   - confirm status again.
5. Rotate keys on a schedule. Changing a key is a two-minute job with the commands in section 3B followed by section 4.2.

---

## Appendix A — Environment variable reference

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | For OpenAI answers | First OpenAI key |
| `OPENAI_API_KEY_2` | Optional | Second OpenAI key |
| `OPENAI_API_KEY_3` | Optional | Third OpenAI key |
| `OPENAI_MODEL` | Optional | Defaults to `gpt-4o-mini` |
| `GEMINI_API_KEY` | For Gemini answers | First Gemini key |
| `GEMINI_API_KEY_2` | Optional | Second Gemini key |
| `GEMINI_API_KEY_3` | Optional | Third Gemini key |
| `GEMINI_MODEL` | Optional | Defaults to `gemini-3.5-flash` |
| `TRUTH_AI_PROVIDER` | Optional | `auto` (default), `openai`, or `gemini` |
| `ADMIN_PASSWORD` / `ADMIN_SECRET` | Yes | Admin CMS login and cookie signing |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Yes in production | CMS and form persistence |
| `RESEND_API_KEY` / `EMAIL_FROM` / `EMAIL_TO` | Optional | Lead notification email |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Yes | `2348034005708` |
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://www.olawestern.ng` |

A single variable can also hold a comma-separated list, but the four named slots are easier to audit.

## Appendix B — Command cheat sheet

```bash
# Add one key without leaving it in shell history
read -r -s -p "Key: " K; echo
npx netlify env:set OPENAI_API_KEY_2 "$K" --context production --scope builds functions runtime --secret --force
unset K

# List names only (never values)
npx netlify env:list --context production --json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);console.log(Object.keys(j).sort().join('\n'))})"

# Verify the deployed key counts
curl -s https://olawestern.ng/api/truth-room/chat | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);console.log(j.providers)})"

# Ask a real question
curl -s https://olawestern.ng/api/truth-room/chat -H 'content-type: application/json' -d '{"question":"What seat and party is Ola Western contesting?"}'

# Build and upload a draft (credits exhausted path)
npx netlify deploy --build --site d07bfb40-965b-4307-bdc8-4b10e41c3cb4

# Promote the draft by its Deploy ID
npx netlify api restoreSiteDeploy --data '{"site_id":"d07bfb40-965b-4307-bdc8-4b10e41c3cb4","deploy_id":"PASTE_DEPLOY_ID_HERE"}'
```

---

Last verified against the running site on 7 November 2026: one key per provider configured, four slots empty, SSR build live at `https://olawestern.ng`.
