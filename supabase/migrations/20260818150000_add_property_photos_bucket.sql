-- Úložiště fotek nemovitostí.
-- Fotky se nahrávají z prohlížeče (anon klíč), proto veřejný bucket + otevřené politiky.
-- Etapa 1 nemá auth; až přijde, zúžit politiky na authenticated.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-photos',
  'property-photos',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "property photos readable by anyone" on storage.objects;
create policy "property photos readable by anyone"
  on storage.objects for select
  using (bucket_id = 'property-photos');

drop policy if exists "property photos uploadable" on storage.objects;
create policy "property photos uploadable"
  on storage.objects for insert
  with check (bucket_id = 'property-photos');

drop policy if exists "property photos deletable" on storage.objects;
create policy "property photos deletable"
  on storage.objects for delete
  using (bucket_id = 'property-photos');
