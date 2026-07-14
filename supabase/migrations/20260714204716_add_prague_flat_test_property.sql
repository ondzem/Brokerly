-- Add a new test owner
INSERT INTO contacts (
    id, full_name, phone, email, roles, source, status, temperature, gdpr_consent, consent_date, consent_source
) VALUES (
    'a8b3db18-5a82-45e0-8197-b676a086bc33',
    'Marek Kučera',
    '+420 722 888 999',
    'marek.kucera@example.cz',
    ARRAY['vlastník']::TEXT[],
    'web',
    'klient',
    'vlažný',
    TRUE,
    '2026-07-14',
    'poptávka z portálu'
) ON CONFLICT (id) DO NOTHING;

-- Add a new test property (Kind = byt) with all fields filled
INSERT INTO properties (
    id,
    owner_id,
    kind,
    transaction,
    address,
    offer_status,
    price,
    facts_for_answers,
    handover_term,
    listing_id,
    flat_layout,
    flat_area,
    floor,
    ownership,
    construction,
    flat_condition,
    flat_features,
    flat_penb
) VALUES (
    '55555555-5555-5555-5555-555555555555',
    'a8b3db18-5a82-45e0-8197-b676a086bc33',
    'byt',
    'prodej',
    'Vinohradská 45, Praha 2',
    'v nabídce',
    12500000,
    'Luxusní byt 3+kk v novostavbě v žádané lokalitě Královských Vinohrad. K bytu náleží prostorná terasa (12 m²), sklepní kóje a garážové stání v suterénu budovy (které je již zahrnuto v ceně). Byt je vybaven klimatizací, rekuperací tepla a podlahovým vytápěním. Výborná dopravní dostupnost, metro A v docházkové vzdálenosti.',
    'Ihned po podpisu kupní smlouvy a doplacení kupní ceny',
    'BYT-PRAHA-002',
    '3+kk',
    85,
    '4. patro z 5',
    'osobní',
    'cihla',
    'novostavba',
    ARRAY['výtah', 'terasa', 'sklep']::TEXT[],
    'A'
) ON CONFLICT (id) DO NOTHING;
