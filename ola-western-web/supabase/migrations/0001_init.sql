-- ============================================================================
-- Ola Western Campaign — Supabase (PostgreSQL) initial migration
-- Consolidated schema from:
--   • "build the personal website for Hon. Folorunso Olaitan Segun" spec
--   • "DEVELOPER WORKFLOW for a website" spec
--   • "THE UNIVERSAL ELECTORAL DOMINANCE BLUEPRINT" §4
-- Run in the Supabase SQL editor or via `supabase db push`.
-- ============================================================================

create extension if not exists pgcrypto;

-- 1. Volunteers (campaign website /join form) -------------------------------
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  email TEXT,
  ward_location TEXT NOT NULL CHECK (ward_location IN ('Festac I', 'Festac II', 'Festac III', 'Mile 2 / Housing Estate')),
  address_street TEXT,
  polling_unit_code TEXT,
  primary_concern TEXT, -- e.g. 'Road Infrastructure', 'Drainage & Flooding', 'Market & SME Support'
  status TEXT NOT NULL DEFAULT 'pending_verification'
    CHECK (status IN ('pending_verification', 'verified', 'assigned', 'inactive'))
);

ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

-- Anonymous website visitors may insert; nobody may read via the anon key.
DROP POLICY IF EXISTS "volunteers_public_insert" ON volunteers;
CREATE POLICY "volunteers_public_insert" ON volunteers
  FOR INSERT WITH CHECK (true);

-- 2. Supporters / micro-mobilization leads (scalable multi-constituency form)
CREATE TABLE IF NOT EXISTS supporters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  email TEXT,
  state_code TEXT NOT NULL DEFAULT 'Lagos',
  constituency_code TEXT NOT NULL DEFAULT 'amuwo-odofin-1',
  ward_name TEXT NOT NULL,
  polling_unit_code TEXT,
  primary_voter_issue TEXT,
  pledged_voters_count INT NOT NULL DEFAULT 0,
  role TEXT NOT NULL DEFAULT 'supporter'
    CHECK (role IN ('supporter', 'canvasser', 'ward_captain', 'pu_agent'))
);

ALTER TABLE supporters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "supporters_public_insert" ON supporters;
CREATE POLICY "supporters_public_insert" ON supporters
  FOR INSERT WITH CHECK (true);

-- 3. Accomplishments & track record ------------------------------------------
CREATE TABLE IF NOT EXISTS accomplishments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Infrastructure', 'Youth & Sports', 'Security', 'Philanthropy', 'Legislative')),
  ward_impact TEXT NOT NULL, -- e.g. 'Festac II', 'Mile 2', 'All Wards'
  description TEXT NOT NULL,
  image_url TEXT,
  verification_source_url TEXT -- news report or official press release
);

ALTER TABLE accomplishments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "accomplishments_public_read" ON accomplishments;
CREATE POLICY "accomplishments_public_read" ON accomplishments
  FOR SELECT USING (true);

-- 4. Truth Room fact-check ledger --------------------------------------------
CREATE TABLE IF NOT EXISTS fact_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  claim_summary TEXT NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('VERIFIED FACT', 'FALSE CLAIM', 'MISLEADING')),
  detailed_explanation TEXT NOT NULL,
  official_document_url TEXT,
  is_featured BOOLEAN DEFAULT false
);

ALTER TABLE fact_checks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fact_checks_public_read" ON fact_checks;
CREATE POLICY "fact_checks_public_read" ON fact_checks
  FOR SELECT USING (true);
-- Writes go through the service-role webhook only (no public insert policy).

-- 5. Constituent inquiries ("Ask Ola") ----------------------------------------
CREATE TABLE IF NOT EXISTS constituent_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  ward TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('Policy Inquiry', 'Rumor Verification', 'General Support', 'Office Hours Booking')),
  message_body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'answered', 'published', 'archived'))
);

ALTER TABLE constituent_inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inquiries_public_insert" ON constituent_inquiries;
CREATE POLICY "inquiries_public_insert" ON constituent_inquiries
  FOR INSERT WITH CHECK (true);

-- 6. Press releases (CMS-synced newsfeed) -------------------------------------
CREATE TABLE IF NOT EXISTS press_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  body TEXT NOT NULL,
  image_url TEXT,
  pdf_url TEXT,
  source TEXT NOT NULL DEFAULT 'campaign_hq' CHECK (source IN ('campaign_hq', 'festaconline', 'partner_press'))
);

ALTER TABLE press_releases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "press_public_read" ON press_releases;
CREATE POLICY "press_public_read" ON press_releases
  FOR SELECT USING (published_at IS NOT NULL);

-- 7. War Room sentiment alerts (backend ingestion; never public) --------------
CREATE TABLE IF NOT EXISTS sentiment_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source_platform TEXT NOT NULL,           -- x | facebook | instagram | tiktok | youtube | nairaland | festaconline | whatsapp
  source_url TEXT,
  author_handle TEXT,
  content_text TEXT NOT NULL,
  detected_language TEXT DEFAULT 'en',     -- en | pcm | yo | ha | ig
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  threat_score NUMERIC(3,2) NOT NULL CHECK (threat_score >= 0.00 AND threat_score <= 1.00),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'dispatched'))
);

ALTER TABLE sentiment_alerts ENABLE ROW LEVEL SECURITY;
-- No public policies: accessible via service role only (War Room backend).

-- 8. Constituent Help Desk — neighbourhood issue tracker ----------
CREATE TABLE IF NOT EXISTS community_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  ward TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Drainage & Flooding', 'Roads & Streetlighting', 'Water & Boreholes', 'Community Security', 'Waste & Sanitation', 'Market & SME')),
  detail TEXT,
  reporter_name TEXT,      -- campaign-side only, never published
  reporter_phone TEXT,     -- campaign-side only, never published
  consent BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT false,   -- HQ gate before the public dashboard
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'under_review', 'action_scheduled', 'resolved')),
  update_note TEXT         -- plain-language progress note shown publicly
);

ALTER TABLE community_issues ENABLE ROW LEVEL SECURITY;
-- Anonymous visitors may file a report; it stays invisible until the ward team publishes it.
DROP POLICY IF EXISTS "issues_public_insert" ON community_issues;
CREATE POLICY "issues_public_insert" ON community_issues
  FOR INSERT WITH CHECK (true);
-- Public readers may only see HQ-published rows.
DROP POLICY IF EXISTS "issues_public_read_published" ON community_issues;
CREATE POLICY "issues_public_read_published" ON community_issues
  FOR SELECT USING (published = true);

-- Indexes ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_volunteers_ward ON volunteers (ward_location);
CREATE INDEX IF NOT EXISTS idx_supporters_ward ON supporters (ward_name);
CREATE INDEX IF NOT EXISTS idx_accomplishments_category ON accomplishments (category);
CREATE INDEX IF NOT EXISTS idx_fact_checks_featured ON fact_checks (is_featured, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_threat ON sentiment_alerts (threat_score DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issues_public ON community_issues (published, status, created_at DESC);

-- NDPA 2023 note: voter contact data (volunteers, supporters, constituent_inquiries)
-- must be encrypted at rest (Supabase default disk encryption) and in transit (TLS 1.3).
-- Retention & deletion requests are handled by service-role operations only.
