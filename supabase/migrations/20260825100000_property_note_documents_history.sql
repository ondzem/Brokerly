-- Karta nemovitosti ukazovala tři věci, které nikde neležely:
--   * „Poznámka" byla ve skutečnosti facts_for_answers (fakta pro AI odpovědi),
--     takže makléřova poznámka a podklad pro odpovědi byly jedno pole,
--   * „+ Nahrát" zapisoval doslova ['LV.pdf','PENB.pdf'] do attachments —
--     a tím přepsal fotky, protože attachments drží obojí,
--   * „Historie ceny" byla dvě natvrdo napsaná čísla podle ceny nemovitosti.
-- Každá z nich teď dostává vlastní sloupec.

alter table public.properties add column if not exists note text;

-- [{ "name": "LV.pdf", "url": "...", "size": 12345, "uploaded_at": "2026-…" }]
alter table public.properties
    add column if not exists documents jsonb not null default '[]'::jsonb;

-- [{ "from": 5900000, "to": 5200000, "changed_at": "2026-…" }]
alter table public.properties
    add column if not exists price_history jsonb not null default '[]'::jsonb;

comment on column public.properties.note is 'Interní poznámka makléře — nejde do odpovědí zájemcům.';
comment on column public.properties.documents is 'Nahrané dokumenty (LV, PENB, smlouvy). Fotky jsou zvlášť v attachments.';
comment on column public.properties.price_history is 'Záznam každé změny ceny, doplňuje se automaticky při uložení.';

-- Úložiště dokumentů — oddělené od fotek, protože sem chodí i PDF a smlouvy.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'property-documents', 'property-documents', true, 20971520,
    array['application/pdf','image/jpeg','image/png','image/webp',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do nothing;

drop policy if exists property_documents_read on storage.objects;
create policy property_documents_read on storage.objects
    for select using (bucket_id = 'property-documents');

drop policy if exists property_documents_insert on storage.objects;
create policy property_documents_insert on storage.objects
    for insert with check (bucket_id = 'property-documents');

drop policy if exists property_documents_delete on storage.objects;
create policy property_documents_delete on storage.objects
    for delete using (bucket_id = 'property-documents');
