-- Enable Row Level Security (RLS) for all tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create wildcard policies for public access (required for anonymous client SDK access in Stage 1)

-- 1. contacts
CREATE POLICY "Enable all for public access on contacts" ON contacts 
    FOR ALL TO public 
    USING (true) 
    WITH CHECK (true);

-- 2. properties
CREATE POLICY "Enable all for public access on properties" ON properties 
    FOR ALL TO public 
    USING (true) 
    WITH CHECK (true);

-- 3. deals
CREATE POLICY "Enable all for public access on deals" ON deals 
    FOR ALL TO public 
    USING (true) 
    WITH CHECK (true);

-- 4. activities
CREATE POLICY "Enable all for public access on activities" ON activities 
    FOR ALL TO public 
    USING (true) 
    WITH CHECK (true);

-- 5. settings
CREATE POLICY "Enable all for public access on settings" ON settings 
    FOR ALL TO public 
    USING (true) 
    WITH CHECK (true);
