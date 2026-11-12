ALTER TABLE study_sessions
  ADD COLUMN IF NOT EXISTS end_time TIME;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM study_sessions
    WHERE end_time IS NULL
      AND session_time >= TIME '23:59:59'
  ) THEN
    RAISE EXCEPTION
      'Cannot infer an end time for a session starting at 23:59:59; update that session before migrating';
  END IF;
END
$$;

UPDATE study_sessions
SET end_time = CASE
  WHEN session_time <= TIME '22:29:59'
    THEN (session_time + INTERVAL '90 minutes')::TIME
  ELSE TIME '23:59:59'
END
WHERE end_time IS NULL;

ALTER TABLE study_sessions
  ALTER COLUMN end_time SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'session_ends_after_start'
      AND conrelid = 'study_sessions'::regclass
  ) THEN
    ALTER TABLE study_sessions
      ADD CONSTRAINT session_ends_after_start
      CHECK (end_time > session_time) NOT VALID;
  END IF;
END
$$;

ALTER TABLE study_sessions
  VALIDATE CONSTRAINT session_ends_after_start;
