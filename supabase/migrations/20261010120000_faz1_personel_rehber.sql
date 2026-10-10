-- Faz 1: Personel ve Rehber modülleri
-- Supabase Dashboard → SQL Editor'de bir kez çalıştırılır.

-- ─────────────────────────────────────────────────────────────
-- Ortak: updated_at alanını otomatik güncelleyen tetikleyici
-- ─────────────────────────────────────────────────────────────
create or replace function public.updated_at_guncelle()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- personel
-- ─────────────────────────────────────────────────────────────
create table public.personel (
    id            uuid primary key default gen_random_uuid(),
    ad_soyad      text not null check (length(trim(ad_soyad)) > 0),
    telefon       text,
    rol           text not null default 'teknisyen'
                  check (rol in ('yonetici', 'teknisyen', 'kasa')),
    aktif         boolean not null default true,
    -- Panele girişi olan personel için Supabase Auth kullanıcısı (opsiyonel)
    auth_user_id  uuid unique references auth.users (id) on delete set null,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

create trigger personel_updated_at
    before update on public.personel
    for each row execute function public.updated_at_guncelle();

-- ─────────────────────────────────────────────────────────────
-- rehber_kategorileri
-- kod: sistemin koddan tanıdığı kategoriler (örn. 'tedarikci').
-- sistem = true olan kategoriler silinemez.
-- ─────────────────────────────────────────────────────────────
create table public.rehber_kategorileri (
    id          uuid primary key default gen_random_uuid(),
    ad          text not null unique check (length(trim(ad)) > 0),
    kod         text unique,
    sistem      boolean not null default false,
    created_at  timestamptz not null default now()
);

insert into public.rehber_kategorileri (ad, kod, sistem) values
    ('Tedarikçi',           'tedarikci', true),
    ('Kurye / Kargo',       null,        false),
    ('Muhasebe',            null,        false),
    ('Teknik Destek Hattı', null,        false),
    ('Diğer',               null,        false);

create or replace function public.sistem_kategorisi_koru()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if old.sistem then
        if tg_op = 'DELETE' then
            raise exception 'Sistem kategorisi silinemez: %', old.ad;
        elsif new.kod is distinct from old.kod or new.sistem is distinct from old.sistem then
            raise exception 'Sistem kategorisinin kodu değiştirilemez: %', old.ad;
        end if;
    end if;
    if tg_op = 'DELETE' then
        return old;
    end if;
    return new;
end;
$$;

create trigger rehber_kategorileri_koru
    before update or delete on public.rehber_kategorileri
    for each row execute function public.sistem_kategorisi_koru();

-- ─────────────────────────────────────────────────────────────
-- rehber_kisiler
-- ─────────────────────────────────────────────────────────────
create table public.rehber_kisiler (
    id              uuid primary key default gen_random_uuid(),
    ad_soyad_unvan  text not null check (length(trim(ad_soyad_unvan)) > 0),
    firma           text,
    kategori_id     uuid references public.rehber_kategorileri (id) on delete set null,
    telefon_1       text,
    telefon_2       text,
    eposta          text,
    adres           text,   -- kargo/teslimat adresi olarak da kullanılır
    notlar          text,
    -- Arama için: ad + firma + telefonların yalnızca rakamları.
    -- "0532 123 45 67" ile kaydedilen numara "5321234567" yazılarak da bulunur.
    arama           text generated always as (
                        coalesce(ad_soyad_unvan, '') || ' ' || coalesce(firma, '') || ' ' ||
                        regexp_replace(coalesce(telefon_1, ''), '[^0-9]', '', 'g') || ' ' ||
                        regexp_replace(coalesce(telefon_2, ''), '[^0-9]', '', 'g')
                    ) stored,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

create index rehber_kisiler_kategori_idx on public.rehber_kisiler (kategori_id);

create trigger rehber_kisiler_updated_at
    before update on public.rehber_kisiler
    for each row execute function public.updated_at_guncelle();

-- ─────────────────────────────────────────────────────────────
-- RLS: yalnızca giriş yapmış kullanıcılar (admin paneli) okuyup yazabilir.
-- Kayıt (signup) kapalı olduğu için authenticated = panele eklenmiş kullanıcı.
-- Rol bazlı kısıtlama Faz 6'da bu politikalar daraltılarak eklenecek.
-- anon (vitrin ziyaretçisi) için politika yok → erişim yok.
-- ─────────────────────────────────────────────────────────────
alter table public.personel            enable row level security;
alter table public.rehber_kategorileri enable row level security;
alter table public.rehber_kisiler      enable row level security;

create policy "panel_kullanicilari_tam_erisim" on public.personel
    for all to authenticated using (true) with check (true);

create policy "panel_kullanicilari_tam_erisim" on public.rehber_kategorileri
    for all to authenticated using (true) with check (true);

create policy "panel_kullanicilari_tam_erisim" on public.rehber_kisiler
    for all to authenticated using (true) with check (true);
