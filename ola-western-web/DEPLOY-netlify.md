# Ola Western — Netlify deployment

Netlify supports Next.js natively (server rendering + API routes), which keeps the
volunteer/Ask-Ola forms, Supabase writes and War Room webhook fully live.

## Option A — Full site with working forms (recommended)

1. Push this folder (`ola-western-web`) to a Git repository.
2. In Netlify: **Add new site → Import an existing project** and pick the repo.
3. Build is auto-detected from `netlify.toml` (`npm run build`, Next.js runtime).
4. Site configuration → Environment variables: add at least
   `NEXT_PUBLIC_SITE_URL=https://<your-netlify-domain>` (plus Supabase/WhatsApp keys
   when credentials exist — the site runs in zero-config mode without them).
5. Deploy. Domain settings → add `olawestern.ng` when DNS is ready.

## Option B — Static-only preview (no server)

Use when you want a pure-files host (free tier, no SSR):

```bash
npm run export:sites          # produces out/
netlify deploy --dir=out --prod   # or drag the out/ folder onto app.netlify.com/drop
```

In this mode the capture forms intentionally show the "preview build" notice
(there is no server to record leads), exactly like the Qoder Sites preview.

## Notes

- `out/` and `.next/` are build artifacts — never edit them; edit `src/` and rebuild.
- Image slots: drop photos in `public/images/` and set `src` in `src/lib/content.ts` (GALLERY).
- Social handles: fill confirmed URLs in `src/lib/content.ts` (SOCIALS).
- Candidate file facts: fill `PROFILE_FACTS` after HQ confirmation.
