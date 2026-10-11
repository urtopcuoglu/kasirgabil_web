-- İletişim mesajları: vitrindeki iletişim formundan gelen mesajlar panelde okunur.
-- Ziyaretçi tabloya doğrudan yazamaz; mesaj, hız sınırı uygulayan iletisim_mesaji_gonder() ile eklenir.
-- Panelde yalnızca yönetici okur, okundu işaretler ve siler (src/lib/izinler.ts: mesajlar).

create table public.iletisim_mesajlari (
    id             uuid primary key default gen_random_uuid(),
    ad             text not null check (length(trim(ad)) between 2 and 60),
    soyad          text check (length(soyad) <= 60),
    telefon        text check (length(telefon) <= 25),
    eposta         text not null check (length(eposta) <= 120 and eposta like '%_@_%'),
    mesaj          text not null check (length(trim(mesaj)) between 10 and 2000),
    okundu         boolean not null default false,
    okunma_tarihi  timestamptz,
    arama          text generated always as (
                       ad || ' ' || coalesce(soyad, '') || ' ' || eposta || ' ' ||
                       coalesce(regexp_replace(telefon, '[^0-9]', '', 'g'), '') || ' ' || mesaj
                   ) stored,
    created_at     timestamptz not null default now()
);

create index iletisim_mesajlari_tarih_idx     on public.iletisim_mesajlari (created_at desc);
create index iletisim_mesajlari_okunmamis_idx on public.iletisim_mesajlari (created_at desc) where not okundu;

-- Okundu işaretlenince tarih tutulur, geri alınınca silinir.
create or replace function public.iletisim_okunma_tarihi()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.okundu is distinct from old.okundu then
        new.okunma_tarihi := case when new.okundu then now() end;
    end if;
    return new;
end;
$$;

create trigger iletisim_mesajlari_okunma
    before update of okundu on public.iletisim_mesajlari
    for each row execute function public.iletisim_okunma_tarihi();

-- ─────────────────────────────────────────────────────────────
-- Vitrinden mesaj gönderme (anon). Basit hız sınırı:
--   aynı e-postadan 1 saatte en fazla 3, tüm siteden 10 dakikada en fazla 30 mesaj.
-- ─────────────────────────────────────────────────────────────
create or replace function public.iletisim_mesaji_gonder(p_ad text, p_soyad text, p_telefon text, p_eposta text, p_mesaj text)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
    if (select count(*) from public.iletisim_mesajlari
         where lower(eposta) = lower(trim(p_eposta)) and created_at > now() - interval '1 hour') >= 3
       or (select count(*) from public.iletisim_mesajlari where created_at > now() - interval '10 minutes') >= 30 then
        raise exception 'Çok fazla mesaj gönderildi. Lütfen bir süre sonra tekrar deneyin.';
    end if;

    insert into public.iletisim_mesajlari (ad, soyad, telefon, eposta, mesaj)
    values (trim(p_ad), nullif(trim(p_soyad), ''), nullif(trim(p_telefon), ''), lower(trim(p_eposta)), trim(p_mesaj));
end;
$$;

revoke execute on function public.iletisim_mesaji_gonder(text, text, text, text, text) from public;
grant  execute on function public.iletisim_mesaji_gonder(text, text, text, text, text) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- RLS: insert politikası yok (yalnızca yukarıdaki fonksiyon ekler). Panelde yalnızca yönetici.
-- ─────────────────────────────────────────────────────────────
alter table public.iletisim_mesajlari enable row level security;

create policy "yonetici_okur" on public.iletisim_mesajlari
    for select to authenticated using ((select public.panel_rolu()) = 'yonetici');

create policy "yonetici_gunceller" on public.iletisim_mesajlari
    for update to authenticated
    using ((select public.panel_rolu()) = 'yonetici') with check ((select public.panel_rolu()) = 'yonetici');

create policy "yonetici_siler" on public.iletisim_mesajlari
    for delete to authenticated using ((select public.panel_rolu()) = 'yonetici');
