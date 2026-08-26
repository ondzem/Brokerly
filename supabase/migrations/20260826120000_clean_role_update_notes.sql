-- Poznámka kontaktu patří makléři. Dedup do ní dřív lepil servisní řádky
-- „[Aktualizace role]: …" — tahle migrace je z existujících poznámek odstraní.
-- Odstraňuje POUZE řádky začínající tou značkou; vlastní text zůstává.
UPDATE contacts
SET note = NULLIF(
  TRIM(BOTH E'\n' FROM regexp_replace(note, E'\\n?\\[Aktualizace role\\]:[^\\n]*', '', 'g')),
  ''
)
WHERE note LIKE '%[Aktualizace role]%';
