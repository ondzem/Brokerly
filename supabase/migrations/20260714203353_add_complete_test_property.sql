-- Add a new test owner
INSERT INTO contacts (
    id, full_name, phone, email, roles, source, status, temperature, gdpr_consent, consent_date, consent_source
) VALUES (
    'e7c3db18-5a82-45e0-8197-b676a086bc22',
    'Alena Dvořáková',
    '+420 725 333 444',
    'alena.dvorakova@example.cz',
    ARRAY['vlastník']::TEXT[],
    'web',
    'klient',
    'horký',
    TRUE,
    '2026-07-14',
    'formulář'
) ON CONFLICT (id) DO NOTHING;

-- Add a new test property (Kind = dům) with all fields filled
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
    house_layout,
    house_area,
    land_area,
    house_type,
    floors_count,
    house_features,
    house_condition,
    house_penb
) VALUES (
    '44444444-4444-4444-4444-444444444444',
    'e7c3db18-5a82-45e0-8197-b676a086bc22',
    'dům',
    'prodej',
    'Slunečná 12, Brno',
    'v nabídce',
    8900000,
    'Samostatný dvoupodlažní rodinný dům 5+kk po celkové nákladné rekonstrukci. K domu náleží okrasná zahrada (600 m²) s bazénem a samostatná zděná garáž. Vytápění je řešeno úsporným tepelným čerpadlem a podlahovým vytápěním. PENB třídy B zaručuje nízké měsíční náklady na provoz. Kuchyně na míru včetně prémiových spotřebičů je součástí prodejní ceny.',
    'Do 3 měsíců od podpisu kupní smlouvy',
    'DUM-BRNO-001',
    '5+kk',
    180,
    600,
    'samostatný',
    2,
    ARRAY['garáž', 'zahrada', 'bazén']::TEXT[],
    'po rekonstrukci',
    'B'
) ON CONFLICT (id) DO NOTHING;
