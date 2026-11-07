-- Panel kayıt talepleri ve "şifremi unuttum" denemeleri.
-- /admin/kayit: giriş gerektirmez; talep, hız sınırı uygulayan personel_talebi_gonder() ile eklenir.
-- Talepleri yalnızca "personel" iznine sahip rol (yönetici) görür, onaylar ya da reddeder (src/actions/talepler.ts).
-- Onaylanan talepte personel kaydı ve panel girişi oluşturulur; şifreyi onaylayan belirler ve personele iletir.

create table public.personel_talepleri (
    id            uuid primary key default gen_random_uuid(),
    ad_soyad      text not null check (length(trim(ad_soyad)) between 2 and 100),
    telefon       text not null check (length(telefon) <= 25 and length(regexp_replace(telefon, '[^0-9]', '', 'g')) >= 10),
    eposta        text not null check (length(eposta) <= 120 and eposta like '%_@_%'),
    durum         text not null default 'bekliyor' check (durum in ('bekliyor', 'onaylandi', 'reddedildi')),
    karar_veren   uuid references public.personel (id) on delete set null,
    karar_tarihi  timestamptz,
    personel_id   uuid references public.personel (id) on delete set null, -- onaylanınca oluşturulan personel
    created_at    timestamptz not null default now()
);

create index personel_talepleri_tarih_idx on public.personel_talepleri (created_at desc);
create index personel_talepleri_karar_veren_idx on public.personel_talepleri (karar_veren);
create index personel_talepleri_personel_idx on public.personel_talepleri (personel_id);
-- Aynı e-postayla aynı anda tek bekleyen talep.
create unique index personel_talepleri_bekleyen_eposta on public.personel_talepleri (lower(eposta)) where durum = 'bekliyor';

-- Hız sınırı: aynı e-postayla bekleyen talep varsa reddedilir; tüm siteden 1 saatte en fazla 10 talep.
create or replace function public.personel_talebi_gonder(p_ad_soyad text, p_telefon text, p_eposta text)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
    if exists (select 1 from public.personel_talepleri where lower(eposta) = lower(trim(p_eposta)) and durum = 'bekliyor') then
        raise exception 'Bu e-posta adresiyle bekleyen bir talep zaten var. Yönetim onayladığında size bilgi verilecek.';
    end if;
    if (select count(*) from public.personel_talepleri where created_at > now() - interval '1 hour') >= 10 then
        raise exception 'Çok fazla talep gönderildi. Lütfen bir süre sonra tekrar deneyin.';
    end if;

    insert into public.personel_talepleri (ad_soyad, telefon, eposta)
    values (trim(p_ad_soyad), trim(p_telefon), lower(trim(p_eposta)));
end;
$$;

revoke execute on function public.personel_talebi_gonder(text, text, text) from public;
grant  execute on function public.personel_talebi_gonder(text, text, text) to anon, authenticated;

alter table public.personel_talepleri enable row level security;

create policy "yonetici_okur" on public.personel_talepleri
    for select to authenticated using ((select public.panel_rolu()) = 'yonetici');
create policy "yonetici_gunceller" on public.personel_talepleri
    for update to authenticated
    using ((select public.panel_rolu()) = 'yonetici') with check ((select public.panel_rolu()) = 'yonetici');
create policy "yonetici_siler" on public.personel_talepleri
    for delete to authenticated using ((select public.panel_rolu()) = 'yonetici');
create policy mfa_zorunlu on public.personel_talepleri as restrictive for all to authenticated
    using ((select public.mfa_tamam())) with check ((select public.mfa_tamam()));

-- ─────────────────────────────────────────────────────────────
-- Şifremi unuttum: e-posta + doğrulama uygulaması kodu. Kaba kuvvet denemelerine karşı denemeler kaydedilir.
-- Yalnızca gizli anahtarlı sunucu istemcisi yazar/okur (RLS açık, politika yok).
-- ─────────────────────────────────────────────────────────────
create table public.sifre_sifirlama_denemeleri (
    id          bigint generated always as identity primary key,
    eposta      text not null,
    ip          text,
    basarili    boolean not null default false,
    created_at  timestamptz not null default now()
);

create index sifre_sifirlama_denemeleri_eposta_idx on public.sifre_sifirlama_denemeleri (lower(eposta), created_at desc);
create index sifre_sifirlama_denemeleri_ip_idx on public.sifre_sifirlama_denemeleri (ip, created_at desc);

alter table public.sifre_sifirlama_denemeleri enable row level security;
create policy mfa_zorunlu on public.sifre_sifirlama_denemeleri as restrictive for all to authenticated
    using ((select public.mfa_tamam())) with check ((select public.mfa_tamam()));

-- E-postadan auth kullanıcı kimliği (yalnızca gizli anahtar / service_role).
create or replace function public.auth_kullanici_kimligi(p_eposta text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
    select id from auth.users where lower(email) = lower(trim(p_eposta)) limit 1;
$$;

revoke execute on function public.auth_kullanici_kimligi(text) from public, anon, authenticated;
grant  execute on function public.auth_kullanici_kimligi(text) to service_role;
