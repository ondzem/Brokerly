-- Vlastní štítky u vybavení (výtah, bazén, přípojky…). Makléř si smí přidat
-- vlastní hodnotu a poskládat pořadí — a chce to mít i u příští nemovitosti.
--
-- Jeden řádek na pole formuláře. Sdílené pro oba makléře, protože sdílejí
-- i databázi; kdyby to leželo v prohlížeči, každý by si to nastavoval znovu.
create table if not exists public.custom_options (
    field       text primary key,   -- 'flat_features' | 'house_features' | 'land_utilities'
    custom      text[] not null default '{}',   -- co si makléř přidal (smí smazat)
    sort_order  text[] not null default '{}',   -- pořadí štítků, včetně vestavěných
    updated_at  timestamptz not null default now()
);

alter table public.custom_options enable row level security;

drop policy if exists custom_options_read on public.custom_options;
create policy custom_options_read on public.custom_options for select using (true);

drop policy if exists custom_options_write on public.custom_options;
create policy custom_options_write on public.custom_options for all using (true) with check (true);
