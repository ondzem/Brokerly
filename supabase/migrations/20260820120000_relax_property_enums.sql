-- Nabídky u nemovitostí se rozšířily a makléř smí napsat i vlastní hodnotu
-- („jiné — napíšu vlastní"). Pevný výčet v CHECK by takový zápis odmítl a
-- uložení by spadlo, proto omezení na těchto sloupcích ruším.
--
-- Ruší se JEN u polí, kde je volný text smysluplný. Sloupce, které řídí
-- chování aplikace (kind, transaction, offer_status, stage, result), zůstávají
-- hlídané — tam by překlep rozbil filtry a kanban.

alter table public.properties drop constraint if exists properties_ownership_check;
alter table public.properties drop constraint if exists properties_construction_check;
alter table public.properties drop constraint if exists properties_flat_condition_check;
alter table public.properties drop constraint if exists properties_house_type_check;
alter table public.properties drop constraint if exists properties_house_condition_check;
alter table public.properties drop constraint if exists properties_flat_penb_check;
alter table public.properties drop constraint if exists properties_house_penb_check;
