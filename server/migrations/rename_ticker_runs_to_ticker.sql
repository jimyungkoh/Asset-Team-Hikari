-- ============================================================
-- Modified: See CHANGELOG.md for complete modification history
-- Last Updated: 2025-11-01
-- Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
-- ============================================================

-- Migration: Rename ticker_runs table to ticker
-- This migration safely renames the ticker_runs table and updates all foreign key constraints

BEGIN;

-- Step 1: Drop the foreign key constraint from reports table
ALTER TABLE reports 
DROP CONSTRAINT IF EXISTS reports_ticker_run_fk;

-- Step 2: Rename the ticker_runs table to ticker
ALTER TABLE ticker_runs 
RENAME TO ticker;

-- Step 3: Recreate the foreign key constraint with the new table name
ALTER TABLE reports 
ADD CONSTRAINT reports_ticker_run_fk 
FOREIGN KEY (ticker, run_date) 
REFERENCES ticker(ticker, run_date);

COMMIT;
