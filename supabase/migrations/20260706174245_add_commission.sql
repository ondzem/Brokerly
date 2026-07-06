-- Migration: Add commission columns to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS commission_pct NUMERIC;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS commission_val NUMERIC;
