-- ============================================================================
-- Ola Western Campaign — Supabase migration 0002
-- The CMS content tables that 0001 predates: media library, video library,
-- editable profile facts, social channels, press references, site copy.
--
-- Schema authority is the TypeScript layer, not this file:
--   • src/types/index.ts      — row shapes the app reads and writes
--   • src/lib/content.ts      — MEDIA_POSITIONS (image frames), seed rows
--   • src/lib/cms.ts          — the validation the API applies before a write
-- Every column below accepts exactly what src/lib/store.ts sends, so the
-- Supabase backend and the bundled file backend behave identically.
--
-- Ids are TEXT, not UUID. Rows the desk creates carry crypto.randomUUID()
-- values, but the bundled seed rows carry readable slugs (`gfx-mandate`,
-- `vid-tvc-flagbearer`, `soc-x`, and the fixed key `site` for the copy row),
-- so the campaign can mirror the shipped content into Postgres verbatim.
--
-- Run in the Supabase SQL editor or via `supabase db push`.
-- ============================================================================

create extension if not exists pgcrypto;

-- 1. Media library — every photograph the site renders ----------------------
-- `slot` binds a photo to a named frame (hero portrait, town hall, gallery
-- lead ...). The list of valid frames lives in MEDIA_POSITIONS and is validated
-- by the API on write; it is intentionally not a CHECK constraint here, so
-- adding a new image position to the site never requires a database migration.
-- `orientation` IS a CHECK because the layout resolver only understands three
-- shapes and a typo would silently break a crop.
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  src TEXT NOT NULL,                       -- /images/uploads/… or a press CDN URL
  alt TEXT NOT NULL,
  caption TEXT,
  credit TEXT,                             -- 'Photo: THISDAY' — press credit travels with the file
  source_url TEXT,                         -- the published report the photo came from
  width INT CHECK (width IS NULL OR width > 0),
  height INT CHECK (height IS NULL OR height > 0),
  orientation TEXT NOT NULL DEFAULT 'landscape'
    CHECK (orientation IN ('portrait', 'landscape', 'square')),
  slot TEXT,
  published BOOLEAN NOT NULL DEFAULT false,   -- HQ gate: unpublished photos stay in the library
  featured BOOLEAN NOT NULL DEFAULT false     -- hero / lead-frame candidates
);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;
-- The public site may only read photos HQ has published; the desk reads and
-- writes everything with the service-role key (see src/lib/supabase.ts).
DROP POLICY IF EXISTS "media_public_read_published" ON media;
CREATE POLICY "media_public_read_published" ON media
  FOR SELECT USING (published = true);

-- 2. Video library — YouTube coverage of the campaign -----------------------
-- The player embeds youtube-nocookie.com, so only the 11-character id is
-- stored. The API refuses an id YouTube does not recognise or allow embedding,
-- which is what this CHECK backs up at the database boundary.
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  youtube_id TEXT NOT NULL CHECK (char_length(youtube_id) = 11),
  title TEXT NOT NULL,
  outlet TEXT,
  published_at TIMESTAMPTZ,              -- broadcast date, when the desk knows it
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "videos_public_read_published" ON videos;
CREATE POLICY "videos_public_read_published" ON videos
  FOR SELECT USING (published = true);

-- 3. Editable profile facts — the About page dossier ------------------------
-- A row with no value is a question HQ has not answered in writing yet; the
-- public page hides it, so the policy can hide it too.
CREATE TABLE IF NOT EXISTS profile_facts (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL,                     -- 'Profession', 'Constituency', …
  value TEXT,                            -- NULL = not yet attested → not published
  note TEXT,                             -- sourcing note held alongside the fact
  sort INT NOT NULL DEFAULT 0
);

ALTER TABLE profile_facts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profile_facts_public_read_attested" ON profile_facts;
CREATE POLICY "profile_facts_public_read_attested" ON profile_facts
  FOR SELECT USING (value IS NOT NULL);

-- 4. Social channels — footer, About page, sticky mobile bar ----------------
-- `url` NULL means the handle exists but the link is not confirmed; the UI
-- renders that as pending rather than as a dead link, so the row stays public.
CREATE TABLE IF NOT EXISTS socials (
  id TEXT PRIMARY KEY,                   -- 'soc-x', 'soc-whatsapp', …
  platform TEXT NOT NULL
    CHECK (platform IN ('x', 'facebook', 'instagram', 'tiktok', 'youtube', 'whatsapp')),
  label TEXT NOT NULL,
  handle TEXT NOT NULL,
  url TEXT,
  sort INT NOT NULL DEFAULT 0
);

ALTER TABLE socials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "socials_public_read" ON socials;
CREATE POLICY "socials_public_read" ON socials
  FOR SELECT USING (true);

-- 5. Press references — the verifiable track record -------------------------
-- `REFERENCES` is a reserved word in PostgreSQL, so the table is named
-- press_references and needs no quoting anywhere; src/lib/store.ts uses the
-- same name on both backends.
-- Every citation on /impact links out to the published report. Withdrawal is a
-- delete; nothing here is ever invented, so the row is only as good as its URL.
CREATE TABLE IF NOT EXISTS press_references (
  id TEXT PRIMARY KEY,
  year INT NOT NULL CHECK (year BETWEEN 2000 AND 2100),
  -- TEXT, not DATE: the desk may cite a story whose exact publication day is not
  -- on the page, and the app then stores the year alone. Ordering uses `year`.
  date TEXT NOT NULL CHECK (date ~ '^[0-9]{4}$' OR date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
  outlet TEXT NOT NULL,
  headline TEXT NOT NULL,
  url TEXT NOT NULL CHECK (url ~ '^https?://')
);

ALTER TABLE press_references ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "press_references_public_read" ON press_references;
CREATE POLICY "press_references_public_read" ON press_references
  FOR SELECT USING (true);

-- 6. Site copy — the one-row editable hero / CTA / stats text ---------------
-- The app always addresses this row as id = 'site' and upserts the whole
-- document; `stats` is a JSON array of {value,label} because the strip is
-- edited as a set, not as separate rows.
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'site' CHECK (id = 'site'),
  hero_kicker TEXT NOT NULL DEFAULT '',
  hero_title TEXT NOT NULL DEFAULT '',
  hero_slogan TEXT NOT NULL DEFAULT '',
  hero_body TEXT NOT NULL DEFAULT '',
  cta_title TEXT NOT NULL DEFAULT '',
  cta_body TEXT NOT NULL DEFAULT '',
  stats JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "site_settings_public_read" ON site_settings;
CREATE POLICY "site_settings_public_read" ON site_settings
  FOR SELECT USING (true);

-- 7. Align 0001 with the app -----------------------------------------------
-- Ask-Ola triage: the desk moves a message new → reviewed → answered. 0001
-- constrained status to a set the app never writes, so on the Supabase backend
-- every inquiry submission and every triage update failed the CHECK. The legacy
-- values are kept so rows already filed under them stay valid.
ALTER TABLE constituent_inquiries DROP CONSTRAINT IF EXISTS constituent_inquiries_status_check;
ALTER TABLE constituent_inquiries
  ADD CONSTRAINT constituent_inquiries_status_check
  CHECK (status IN ('new', 'reviewed', 'answered', 'pending_review', 'published', 'archived'));
ALTER TABLE constituent_inquiries
  ALTER COLUMN status SET DEFAULT 'new';

-- The /join form requires NDPA 2023 consent before it accepts a volunteer; the
-- site validated it and then dropped it. Record when consent was given so the
-- campaign can prove it.
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ;

-- Indexes -------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_media_slot ON media (slot, published);
CREATE INDEX IF NOT EXISTS idx_media_public ON media (published, featured DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_public ON videos (published, featured DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_facts_sort ON profile_facts (sort);
CREATE INDEX IF NOT EXISTS idx_socials_sort ON socials (sort);
CREATE INDEX IF NOT EXISTS idx_references_year ON references (year DESC, outlet);

-- NDPA 2023 note: `volunteers.consent_at` exists so a deletion or objection
-- request can be answered with the date the consent was captured. Media,
-- videos, references and site_settings hold no personal data.
