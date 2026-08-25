-- Karta nemovitosti má ukazovat, jak dlouho je v nabídce. Tabulka properties
-- ale žádné datum vzniku neměla (contacts i deals ho mají).
alter table public.properties
    add column if not exists created_at timestamptz default now();

-- Zpětné doplnění: u starších záznamů datum neznáme, ale nejstarší obchod na
-- té nemovitosti je spolehlivá spodní hranice. Zbytek zůstává prázdný a karta
-- ten údaj neukáže — radši nic než vymyšlené číslo.
update public.properties p
set created_at = d.first_deal
from (
    select property_id, min(created_at) as first_deal
    from public.deals
    where property_id is not null
    group by property_id
) d
where p.id = d.property_id and p.created_at is null;
