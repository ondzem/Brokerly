export interface Contact {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  roles: ('kupující' | 'vlastník' | 'protistrana' | 'doporučitel')[];
  source: 'Sreality' | 'iDNES' | 'web' | 'doporučení' | 'cold call' | 'monitoring' | 'osobní';
  status: 'nový' | 'kontaktovaný' | 'kvalifikovaný' | 'klient' | 'ztracený';
  temperature: 'horký' | 'vlažný' | 'studený' | null;
  note: string | null;
  created_at: string;
  
  // Co hledá
  seeking_transaction: 'koupě' | 'pronájem' | null;
  seeking_kind: ('byt' | 'dům' | 'pozemek' | 'komerční')[] | null;
  seeking_location: string[] | null;
  seeking_layout: ('1+kk' | '2+kk' | '2+1' | '3+kk' | '3+1' | '4+ a více')[] | null;
  budget_from: number | null;
  budget_to: number | null;
  purpose: 'vlastní bydlení' | 'investice' | 'rekreace' | 'jiné' | null;
  seeking_until: string | null;
  
  // Souhlas (GDPR)
  gdpr_consent: boolean;
  consent_date: string | null;
  consent_source: 'poptávka z portálu' | 'formulář' | 'osobně' | 'e-mail' | null;
}

export interface Property {
  id: string;
  owner_id: string;
  owner?: Contact; // joined
  kind: 'byt' | 'dům' | 'pozemek' | 'komerční' | 'garáž/ostatní';
  transaction: 'prodej' | 'pronájem';
  address: string;
  offer_status: 'akvizice' | 'prodá později' | 'příprava' | 'v nabídce' | 'rezervováno' | 'uzavřeno' | 'staženo';
  price: number;
  facts_for_answers: string | null;
  handover_term: string | null;
  listing_id: string | null;
  attachments: string[] | null;
  
  // Byt
  flat_layout: '1+kk' | '2+kk' | '2+1' | '3+kk' | '3+1' | '4+kk' | '4+1' | '5 a více' | null;
  flat_area: number | null;
  floor: string | null;
  ownership: 'osobní' | 'družstevní' | 'SVJ' | null;
  construction: 'cihla' | 'panel' | 'jiné' | null;
  flat_features: ('výtah' | 'balkon/lodžie' | 'terasa' | 'sklep')[] | null;
  flat_condition: 'novostavba' | 'po rekonstrukci' | 'dobrý' | 'před rekonstrukcí' | null;
  flat_penb: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | null;
  
  // Dům
  house_layout: '2+kk' | '3+kk' | '4+kk' | '5+kk' | '6 a více' | null;
  house_area: number | null;
  land_area: number | null;
  house_type: 'samostatný' | 'řadový' | 'dvojdomek' | null;
  floors_count: number | null;
  house_features: ('garáž' | 'zahrada' | 'bazén')[] | null;
  house_condition: 'novostavba' | 'po rekonstrukci' | 'dobrý' | 'před rekonstrukcí' | null;
  house_penb: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | null;

  // Deferred blocks (pozemek, komerční, pronájem)
  land_size: number | null;
  land_type: string | null;
  land_utilities: string[] | null;
  zoning_plan: string | null;
  land_access: string | null;
  land_dimensions: string | null;
  comm_subtype: string | null;
  comm_floor_area: number | null;
  comm_condition_equipment: string | null;
  comm_parking_entrance: string | null;
  comm_penb: string | null;
  rent_deposit: number | null;
  rent_fees_utilities: number | null;
  rent_duration: string | null;
  rent_available_from: string | null;
  rent_equipment: string | null;
  commission_pct: number | null;
  commission_val: number | null;
}

export interface Deal {
  id: string;
  buyer_id: string;
  buyer?: Contact; // joined
  property_id: string | null;
  property?: Property; // joined
  deal_name: string;
  stage: 'lead' | 'kontaktován' | 'kvalifikován' | 'prohlídka' | 'nabídka' | 'rezervace' | 'podpis' | 'prohráno';
  result: 'otevřený' | 'vyhraný' | 'prohraný';
  temperature: 'horký (A)' | 'vlažný (B)' | 'studený (C)' | null;
  financing: 'hotovost' | 'hypotéka schválená' | 'hypotéka v řešení' | 'neřešeno' | null;
  must_sell_first: boolean;
  moving_term: 'do 1 měsíce' | 'do 3 měsíců' | 'do 6 měsíců' | 'nespěchá' | null;
  value: number | null;
  next_step: string | null;
  next_step_date: string | null;
  created_at: string;
  expected_close: string | null;
  closed_date: string | null;
  loss_reason: 'cena' | 'financování' | 'koupil jinde' | 'rozmyslel si' | 'nedostupné' | 'jiné' | null;
  assigned_agent: string | null;
}

export interface Activity {
  id: string;
  type: 'hovor' | 'e-mail' | 'SMS' | 'schůzka' | 'prohlídka' | 'poznámka' | 'PŘIPOMÍNKA' | 'follow-up';
  content: string;
  contact_id: string;
  contact?: Contact; // joined
  deal_id: string | null;
  deal?: Deal; // joined
  when: string;
  is_reminder: boolean;
  done: boolean;
  direction: 'příchozí' | 'odchozí' | null;
  followup_result: 'vážný zájem' | 'zvažuje' | 'nezaujalo' | 'nedovolal jsem se' | null;
  who: string | null;
}

export interface Settings {
  id: string;
  agent_name: string;
  sender_phone: string;
  sender_email: string;
  signature: string;
  addressing: 'tykání' | 'vykání';
  tone: 'přátelský' | 'věcný' | 'formální';
  reply_samples: string | null;
  languages: ('CZ' | 'EN' | 'DE' | 'UA')[];
  reaction_limit_min: number;
  escalation_rule: string;
  working_hours: string | null;
  qualification_questions: string | null;
}
