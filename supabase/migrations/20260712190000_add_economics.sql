-- Migration: Add commission_status and costs columns to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS commission_status TEXT DEFAULT 'očekávaná';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS costs JSONB DEFAULT '[]'::jsonb;
