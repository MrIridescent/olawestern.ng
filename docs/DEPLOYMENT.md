# Deployment Guide

This document provides a comprehensive guide to deploying and managing the Ola Western campaign website.

## Deployment to Netlify

The website deploys to Netlify with the native Next.js runtime so server routes and the admin CMS work.

1.  Create a new site on Netlify and connect it to your Git repository.
2.  Netlify reads `netlify.toml`: build command `npm run build`, publish directory `.next`, with the `@netlify/plugin-nextjs` runtime.
3.  Set the `ADMIN_PASSWORD` and `ADMIN_SECRET` environment variables in the Netlify project.
4.  Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` so leads persist. The local `data/db.json` store does not survive a serverless deploy.
5.  Optionally add `RESEND_API_KEY`, `EMAIL_FROM` and `EMAIL_TO` for email notifications. Leads are saved even if email is not configured.
6.  To switch on the conversational Truth Desk, add `OPENAI_API_KEY` or `GEMINI_API_KEY` (optionally `TRUTH_AI_PROVIDER`, `OPENAI_MODEL`, `GEMINI_MODEL`). Up to three keys per provider are supported via `_2` and `_3` suffixes (`OPENAI_API_KEY_2`, `GEMINI_API_KEY_3`, …); the desk rotates on rejection, rate limits, timeouts and provider errors, and starts each question on the next key. Without a key, `/truth-room` shows setup instructions and `/api/truth-room/chat` returns `503 AI_NOT_CONFIGURED` — it never produces a canned answer.

### Truth Desk (live AI)

`/api/truth-room/chat` is a real language-model route, not a simulated demo:

*   It calls the OpenAI Chat Completions API or Google Gemini `generateContent`, whichever is configured; `TRUTH_AI_PROVIDER=auto` (default) tries OpenAI then Gemini when both keys exist. Each provider's three keys are tried in rotation before falling back to the other provider.
*   Answers are grounded in the published fact-check ledger, track record, newsroom, profile and legislative agenda. The model is instructed to say when the record is silent rather than guess, to cite `[S#]` evidence ids, and to answer hostile or sarcastic messages factually without mirroring the tone.
*   Requests are capped at 10 per minute per instance, 1,000 characters per question and 8 history turns; each provider call times out after 15 seconds.
*   No key material is returned to the browser, and provider error details stay in server logs.

### Forms and the data store

Every public form posts to a Next.js route handler:

*   `/api/volunteer` — volunteer signup, saved with its NDPA 2023 consent timestamp.
*   `/api/inquiry` — Ask Ola / media desk inquiries.
*   `/api/issues` — constituent help-desk reports, held for ward verification.

With Supabase configured, these writes go to Postgres and survive redeploys. Without it, they go to `data/db.json`, which is suitable for local development or a host with a persistent disk. A static export (`NEXT_OUTPUT=export`, publish `out`) disables every API route and is for design preview only.

## Static preview build

`npm run export:sites` produces the frozen `out/` bundle used for a Qoder Sites pitch preview. It has no server routes, forms or admin CMS.


## Admin CMS

The website includes a robust admin CMS for managing the site's content. The CMS is protected by a password, which is set as an environment variable (`ADMIN_PASSWORD`) on the server.

### Accessing the CMS

To access the CMS, navigate to `/admin` on your website. You will be prompted to enter the admin password.

### CMS Features

The CMS is divided into several tabs, each managing a different aspect of the site's content:

*   **Truth Room:** Manage fact-checks, including adding, editing, and deleting entries.
*   **Media:** Manage the site's images.
*   **Video:** Manage the site's videos.
*   **Sources:** Manage the sources of your information.
*   **Site:** Manage the site's general copy.

## Backend

The backend is built with Next.js API routes and is responsible for handling all the CMS functionality. The API routes are located in the `/src/app/api/admin` directory.

### Authentication

Authentication is handled by the `/src/app/api/admin/login/route.ts` file. This file checks the provided password against the `ADMIN_PASSWORD` environment variable.

### Database

The website uses a Supabase database to store all of its content. The database is managed through the API routes.