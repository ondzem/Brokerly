-- Přidání sloupce s DEFAULT now() orazítkovalo i staré řádky dneškem, takže
-- předchozí doplnění (podmíněné na NULL) nic nenašlo a všech pět nemovitostí
-- tvrdilo „přidáno dnes".
--
-- Řádky z toho hromadného zápisu poznáme podle toho, že mají všechny stejné
-- created_at. Kde existuje obchod, vezmeme datum nejstaršího; kde ne, sloupec
-- vyprázdníme — karta ten údaj pak neukáže, což je lepší než vymyšlené číslo.
with bulk as (
    select created_at
    from public.properties
    group by created_at
    having count(*) > 1
    order by count(*) desc
    limit 1
)
update public.properties p
set created_at = (
    select min(d.created_at) from public.deals d where d.property_id = p.id
)
where p.created_at = (select created_at from bulk);
