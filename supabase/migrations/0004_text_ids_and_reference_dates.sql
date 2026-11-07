-- 0004 — readable IDs + human-readable citation dates
--
-- Two mismatches between the app and the schema shipped in 0001/0002:
--
-- 1. `accomplishments`, `fact_checks` and `press_releases` were created with
--    UUID primary keys, but the CMS addresses the editorial ledger with the
--    readable ids the seed content uses ('csr-boreholes', 'fc-mandate',
--    'election-to-lsha-2015'). Updating or deleting one of those rows through
--    the admin sends a non-UUID string and Postgres rejects it with
--    "invalid input syntax for type uuid". New rows still get a generated id;
--    it is now generated as text so both forms coexist.
--
-- 2. `press_references.date` only accepted `YYYY` or `YYYY-MM-DD`, while the
--    desk records the date as it appeared on the page ('March 2018',
--    'December 2021'). Every such insert failed the CHECK. Ordering has always
--    used the separate `year` integer, so the display text is relaxed to a
--    sane length bound rather than losing the month.
--
-- Safe to re-run: each block checks the live column type / constraint first.

-- ── 1. UUID → TEXT primary keys ─────────────────────────────────────────────
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['accomplishments', 'fact_checks', 'press_releases'] LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = t
        AND column_name = 'id'
        AND data_type = 'uuid'
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN id DROP DEFAULT', t);
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN id TYPE TEXT USING id::text', t);
      EXECUTE format(
        'ALTER TABLE public.%I ALTER COLUMN id SET DEFAULT gen_random_uuid()::text',
        t
      );
    END IF;
  END LOOP;
END
$$;

-- ── 2. Citation dates: keep the month the outlet printed ────────────────────
ALTER TABLE press_references
  DROP CONSTRAINT IF EXISTS press_references_date_check;

ALTER TABLE press_references
  ADD CONSTRAINT press_references_date_check
  CHECK (char_length(date) BETWEEN 4 AND 40);

-- ── 3. The year index the ledger sorts on ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_references_year
  ON press_references (year DESC, outlet);
