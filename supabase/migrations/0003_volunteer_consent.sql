-- 0003: record NDPA 2023 consent timestamp on volunteer signups.
-- The website cannot submit the volunteer form without the consent box ticked,
-- so a stored lead can always be answered with the exact date consent was given.

ALTER TABLE volunteers
  ADD COLUMN IF NOT EXISTS consent_at TIMESTAMP WITH TIME ZONE;
