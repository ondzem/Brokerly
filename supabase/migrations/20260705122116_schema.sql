-- Supabase schema migration for Brokerly Stage 1 ("Denní jádro")

-- 1. Table: CONTACTS
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    roles TEXT[] NOT NULL, -- Czech multi-select: kupující; vlastník; protistrana; doporučitel
    source TEXT NOT NULL, -- Czech select: Sreality; iDNES; web; doporučení; cold call; monitoring; osobní
    status TEXT NOT NULL DEFAULT 'nový', -- Czech select: nový; kontaktovaný; kvalifikovaný; klient; ztracený
    temperature TEXT, -- Czech select: horký; vlažný; studený
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Co hledá (Buyer demand profile)
    seeking_transaction TEXT, -- Czech select: koupě; pronájem
    seeking_kind TEXT[], -- Czech multi-select: byt; dům; pozemek; komerční
    seeking_location TEXT[], -- Location names
    seeking_layout TEXT[], -- Czech multi-select: 1+kk; 2+kk; 2+1; 3+kk; 3+1; 4+ a více
    budget_from NUMERIC,
    budget_to NUMERIC,
    purpose TEXT, -- Czech select: vlastní bydlení; investice; rekreace; jiné
    seeking_until DATE,
    
    -- Souhlas (GDPR)
    gdpr_consent BOOLEAN DEFAULT FALSE,
    consent_date DATE,
    consent_source TEXT, -- Czech select: poptávka z portálu; formulář; osobně; e-mail

    -- Constraints
    CONSTRAINT contacts_phone_email_required CHECK (phone IS NOT NULL OR email IS NOT NULL),
    CONSTRAINT contacts_source_check CHECK (source IN ('Sreality', 'iDNES', 'web', 'doporučení', 'cold call', 'monitoring', 'osobní')),
    CONSTRAINT contacts_status_check CHECK (status IN ('nový', 'kontaktovaný', 'kvalifikovaný', 'klient', 'ztracený')),
    CONSTRAINT contacts_temperature_check CHECK (temperature IN ('horký', 'vlažný', 'studený')),
    CONSTRAINT contacts_seeking_transaction_check CHECK (seeking_transaction IN ('koupě', 'pronájem')),
    CONSTRAINT contacts_purpose_check CHECK (purpose IN ('vlastní bydlení', 'investice', 'rekreace', 'jiné')),
    CONSTRAINT contacts_consent_source_check CHECK (consent_source IN ('poptávka z portálu', 'formulář', 'osobně', 'e-mail'))
);

-- Unique indexes to enable easy contact deduplication by phone or email
CREATE UNIQUE INDEX idx_contacts_phone ON contacts (phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX idx_contacts_email ON contacts (email) WHERE email IS NOT NULL;


-- 2. Table: PROPERTIES
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    kind TEXT NOT NULL, -- Czech select: byt; dům; pozemek; komerční; garáž/ostatní
    transaction TEXT NOT NULL, -- Czech select: prodej; pronájem
    address TEXT NOT NULL,
    offer_status TEXT NOT NULL, -- Czech select: akvizice; prodá později; příprava; v nabídce; rezervováno; uzavřeno; staženo
    price NUMERIC NOT NULL,
    facts_for_answers TEXT,
    handover_term TEXT,
    listing_id TEXT,
    attachments TEXT[], -- File paths/URLs
    
    -- Jen pro BYT
    flat_layout TEXT, -- Czech select: 1+kk; 2+kk; 2+1; 3+kk; 3+1; 4+kk; 4+1; 5 a více
    flat_area NUMERIC,
    floor TEXT,
    ownership TEXT, -- Czech select: osobní; družstevní; SVJ
    construction TEXT, -- Czech select: cihla; panel; jiné
    flat_condition TEXT, -- Czech select: novostavba; po rekonstrukci; dobrý; před rekonstrukcí
    flat_features TEXT[], -- Czech multi-select: výtah; balkon/lodžie; terasa; sklep
    flat_penb TEXT, -- Czech select: A; B; C; D; E; F; G
    
    -- Jen pro DŮM
    house_layout TEXT, -- Czech select: 2+kk; 3+kk; 4+kk; 5+kk; 6 a více
    house_area NUMERIC,
    land_area NUMERIC,
    house_type TEXT, -- Czech select: samostatný; řadový; dvojdomek
    floors_count INTEGER,
    house_features TEXT[], -- Czech multi-select: garáž; zahrada; bazén
    house_condition TEXT, -- Czech select: novostavba; po rekonstrukci; dobrý; před rekonstrukcí
    house_penb TEXT, -- Czech select: A; B; C; D; E; F; G
    
    -- Deferred blocks (Pozemek, Komerční, Pronájem)
    land_size NUMERIC,
    land_type TEXT,
    land_utilities TEXT[],
    zoning_plan TEXT,
    land_access TEXT,
    land_dimensions TEXT,
    comm_subtype TEXT,
    comm_floor_area NUMERIC,
    comm_condition_equipment TEXT,
    comm_parking_entrance TEXT,
    comm_penb TEXT,
    rent_deposit NUMERIC,
    rent_fees_utilities NUMERIC,
    rent_duration TEXT,
    rent_available_from DATE,
    rent_equipment TEXT,

    -- Constraints
    CONSTRAINT properties_kind_check CHECK (kind IN ('byt', 'dům', 'pozemek', 'komerční', 'garáž/ostatní')),
    CONSTRAINT properties_transaction_check CHECK (transaction IN ('prodej', 'pronájem')),
    CONSTRAINT properties_offer_status_check CHECK (offer_status IN ('akvizice', 'prodá později', 'příprava', 'v nabídce', 'rezervováno', 'uzavřeno', 'staženo')),
    CONSTRAINT properties_ownership_check CHECK (ownership IN ('osobní', 'družstevní', 'SVJ')),
    CONSTRAINT properties_construction_check CHECK (construction IN ('cihla', 'panel', 'jiné')),
    CONSTRAINT properties_flat_condition_check CHECK (flat_condition IN ('novostavba', 'po rekonstrukci', 'dobrý', 'před rekonstrukcí')),
    CONSTRAINT properties_flat_penb_check CHECK (flat_penb IN ('A', 'B', 'C', 'D', 'E', 'F', 'G')),
    CONSTRAINT properties_house_type_check CHECK (house_type IN ('samostatný', 'řadový', 'dvojdomek')),
    CONSTRAINT properties_house_condition_check CHECK (house_condition IN ('novostavba', 'po rekonstrukci', 'dobrý', 'před rekonstrukcí')),
    CONSTRAINT properties_house_penb_check CHECK (house_penb IN ('A', 'B', 'C', 'D', 'E', 'F', 'G'))
);


-- 3. Table: DEALS
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    deal_name TEXT NOT NULL, -- Auto-generated via trigger
    stage TEXT NOT NULL DEFAULT 'lead', -- Czech select: lead; kontaktován; kvalifikován; prohlídka; nabídka; rezervace; podpis; prohráno
    result TEXT NOT NULL DEFAULT 'otevřený', -- Czech select: otevřený; vyhraný; prohraný
    temperature TEXT, -- Czech select: horký (A); vlažný (B); studený (C)
    financing TEXT, -- Czech select: hotovost; hypotéka schválená; hypotéka v řešení; neřešeno
    must_sell_first BOOLEAN DEFAULT FALSE,
    moving_term TEXT, -- Czech select: do 1 měsíce; do 3 měsíců; do 6 měsíců; nespěchá
    value NUMERIC,
    next_step TEXT,
    next_step_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expected_close DATE,
    closed_date DATE,
    loss_reason TEXT, -- Czech select: cena; financování; koupil jinde; rozmyslel si; nedostupné; jiné
    assigned_agent UUID, -- office only, stays empty
    
    -- Constraints
    CONSTRAINT deals_stage_check CHECK (stage IN ('lead', 'kontaktován', 'kvalifikován', 'prohlídka', 'nabídka', 'rezervace', 'podpis', 'prohráno')),
    CONSTRAINT deals_result_check CHECK (result IN ('otevřený', 'vyhraný', 'prohraný')),
    CONSTRAINT deals_temperature_check CHECK (temperature IN ('horký (A)', 'vlažný (B)', 'studený (C)')),
    CONSTRAINT deals_financing_check CHECK (financing IN ('hotovost', 'hypotéka schválená', 'hypotéka v řešení', 'neřešeno')),
    CONSTRAINT deals_moving_term_check CHECK (moving_term IN ('do 1 měsíce', 'do 3 měsíců', 'do 6 měsíců', 'nespěchá')),
    CONSTRAINT deals_loss_reason_check CHECK (loss_reason IN ('cena', 'financování', 'koupil jinde', 'rozmyslel si', 'nedostupné', 'jiné'))
);

-- Trigger function for auto deal_name generation
CREATE OR REPLACE FUNCTION trg_fn_generate_deal_name()
RETURNS TRIGGER AS $$
DECLARE
    contact_full_name TEXT;
    contact_last_name TEXT;
    prop_address TEXT;
    prop_kind TEXT;
    prop_layout TEXT;
    prop_desc TEXT;
BEGIN
    SELECT full_name INTO contact_full_name FROM contacts WHERE id = NEW.buyer_id;
    
    IF contact_full_name IS NOT NULL THEN
        -- Extract the last part of full name as last name
        contact_last_name := split_part(contact_full_name, ' ', array_length(string_to_array(contact_full_name, ' '), 1));
    ELSE
        contact_last_name := 'Zájemce';
    END IF;

    IF NEW.property_id IS NOT NULL THEN
        SELECT address, kind, COALESCE(flat_layout, house_layout, '') INTO prop_address, prop_kind, prop_layout 
        FROM properties WHERE id = NEW.property_id;
        
        -- If layout exists, use address (first part) + layout, else address + kind
        IF prop_layout IS NOT NULL AND prop_layout != '' THEN
            prop_desc := split_part(prop_address, ',', 1) || ' ' || prop_layout;
        ELSE
            prop_desc := split_part(prop_address, ',', 1) || ' ' || prop_kind;
        END IF;
    ELSE
        prop_desc := 'Poptávka';
    END IF;

    NEW.deal_name := contact_last_name || ' — ' || trim(prop_desc);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_deals_generate_name
BEFORE INSERT OR UPDATE OF buyer_id, property_id ON deals
FOR EACH ROW
EXECUTE FUNCTION trg_fn_generate_deal_name();


-- 4. Table: ACTIVITIES
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- Czech select: hovor; e-mail; SMS; schůzka; prohlídka; poznámka; PŘIPOMÍNKA; follow-up
    content TEXT NOT NULL,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    "when" TIMESTAMP WITH TIME ZONE NOT NULL,
    is_reminder BOOLEAN NOT NULL DEFAULT FALSE,
    done BOOLEAN DEFAULT FALSE,
    direction TEXT, -- Czech select: příchozí; odchozí
    followup_result TEXT, -- Czech select: vážný zájem; zvažuje; nezaujalo; nedovolal jsem se
    who TEXT, -- Stays empty (office only)
    
    -- Constraints
    CONSTRAINT activities_type_check CHECK (type IN ('hovor', 'e-mail', 'SMS', 'schůzka', 'prohlídka', 'poznámka', 'PŘIPOMÍNKA', 'follow-up')),
    CONSTRAINT activities_direction_check CHECK (direction IN ('příchozí', 'odchozí')),
    CONSTRAINT activities_followup_result_check CHECK (followup_result IN ('vážný zájem', 'zvažuje', 'nezaujalo', 'nedovolal jsem se'))
);


-- 5. Table: SETTINGS
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    sender_phone TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    signature TEXT NOT NULL,
    addressing TEXT NOT NULL, -- Czech select: tykání; vykání
    tone TEXT NOT NULL, -- Czech select: přátelský; věcný; formální
    reply_samples TEXT,
    languages TEXT[], -- Czech multi-select: CZ; EN; DE; UA
    reaction_limit_min INTEGER NOT NULL DEFAULT 15,
    escalation_rule TEXT NOT NULL,
    working_hours TEXT,
    qualification_questions TEXT,
    
    -- Office only fields (Stay empty in Stage 1)
    lead_assignment_rule TEXT,
    no_reply_escalation_min INTEGER,
    report_recipient TEXT,
    
    -- Constraints
    CONSTRAINT settings_addressing_check CHECK (addressing IN ('tykání', 'vykání')),
    CONSTRAINT settings_tone_check CHECK (tone IN ('přátelský', 'věcný', 'formální'))
);


-- 6. INSERT SEED DATA FOR WALKTHROUGH VALIDATION
-- Add default Settings first
INSERT INTO settings (
    agent_name, sender_phone, sender_email, signature, addressing, tone, languages, reaction_limit_min, escalation_rule
) VALUES (
    'Patrik Makléř', '+420 777 999 888', 'patrik.makler@brokerly.cz', 'S pozdravem,\nPatrik Makléř\nRealitní specialista', 'vykání', 'věcný', ARRAY['CZ', 'EN'], 15, 'Eskalovat po 15 minutách nečinnosti na SMS'
);

-- Insert Owner
INSERT INTO contacts (
    id, full_name, phone, email, roles, source, status, temperature, gdpr_consent, consent_date, consent_source
) VALUES (
    'a7b3db18-5a82-45e0-8197-b676a086bc11', 'Jan Novák', '+420 777 111 222', 'jan.novak@example.cz', ARRAY['vlastník']::TEXT[], 'osobní', 'klient', 'vlažný', TRUE, '2026-07-05', 'osobně'
);

-- Insert Owner's Property (Kind = byt)
INSERT INTO properties (
    id, owner_id, kind, transaction, address, offer_status, price, facts_for_answers, handover_term, flat_layout, flat_area, floor, ownership, construction, flat_condition, flat_features, flat_penb
) VALUES (
    '33333333-3333-3333-3333-333333333333', 'a7b3db18-5a82-45e0-8197-b676a086bc11', 'byt', 'prodej', 'Bory, Plzeň', 'v nabídce', 4200000, 'V ceně je kuchyňská linka se spotřebiči a sklepní kóje.', 'Dohodou, ihned po zaplacení', '2+kk', 55, '3', 'osobní', 'cihla', 'po rekonstrukci', ARRAY['sklep', 'balkon/lodžie']::TEXT[], 'C'
);

-- Insert Buyer 1 (Marie Veselá)
INSERT INTO contacts (
    id, full_name, phone, email, roles, source, status, temperature, gdpr_consent, seeking_transaction, seeking_kind, seeking_layout, budget_to
) VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Marie Veselá', '+420 608 333 444', 'marie.vesela@example.cz', ARRAY['kupující']::TEXT[], 'web', 'nový', 'horký', TRUE, 'koupě', ARRAY['byt']::TEXT[], ARRAY['2+kk']::TEXT[], 4500000
);

-- Insert Buyer 2 (Petr Svoboda)
INSERT INTO contacts (
    id, full_name, phone, email, roles, source, status, temperature, gdpr_consent, seeking_transaction, seeking_kind, seeking_layout, budget_to
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Petr Svoboda', '+420 724 555 666', 'petr.svoboda@example.cz', ARRAY['kupující']::TEXT[], 'Sreality', 'nový', 'vlažný', TRUE, 'koupě', ARRAY['byt']::TEXT[], ARRAY['2+kk', '3+kk']::TEXT[], 5000000
);

-- Insert Deal 1 (Marie Veselá on Jan Novák's Property)
-- Trigger will auto-generate deal_name = 'Veselá — Bory 2+kk'
INSERT INTO deals (
    id, buyer_id, property_id, stage, result, temperature
) VALUES (
    'd1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'lead', 'otevřený', 'horký (A)'
);

-- Insert Deal 2 (Petr Svoboda on Jan Novák's Property)
-- Trigger will auto-generate deal_name = 'Svoboda — Bory 2+kk'
INSERT INTO deals (
    id, buyer_id, property_id, stage, result, temperature
) VALUES (
    'd2222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'lead', 'otevřený', 'vlažný (B)'
);
