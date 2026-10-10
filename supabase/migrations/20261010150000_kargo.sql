-- Kargo şablonları: gönderici firmalar ve oluşturulan kargo fişleri
-- Supabase Dashboard → SQL Editor'de bir kez çalıştırılır.

-- ─────────────────────────────────────────────────────────────
-- kargo_gondericileri
-- ─────────────────────────────────────────────────────────────
create table public.kargo_gondericileri (
    id             uuid primary key default gen_random_uuid(),
    firma_adi      text not null check (length(trim(firma_adi)) > 0),
    gonderici_adi  text not null check (length(trim(gonderici_adi)) > 0),
    telefon        text not null,
    adres          text not null,
    vkn            text check (vkn is null or vkn ~ '^[0-9]{10,11}$'),  -- VKN (10) veya TCKN (11)
    varsayilan     boolean not null default false,
    created_at     timestamptz not null default now()
);

-- En fazla bir varsayılan gönderici olabilir.
create unique index kargo_gondericileri_tek_varsayilan
    on public.kargo_gondericileri (varsayilan) where varsayilan;

insert into public.kargo_gondericileri (firma_adi, gonderici_adi, telefon, adres, varsayilan) values
    ('Kasırga Bilgisayar', 'Kasırga Bilgisayar', '0505 387 79 39',
     'Bayındır-1 Sk. No:5/10 Kızılay/Çankaya/Ankara', true);

-- ─────────────────────────────────────────────────────────────
-- kargolar
-- Gönderici ve alıcı bilgileri oluşturulma anındaki halleriyle kopyalanır;
-- rehber veya gönderici kaydı sonradan değişse de fiş aynı kalır.
-- ─────────────────────────────────────────────────────────────
create table public.kargolar (
    id                     uuid primary key default gen_random_uuid(),
    gonderici_id           uuid references public.kargo_gondericileri (id) on delete set null,
    alici_rehber_id        uuid references public.rehber_kisiler (id) on delete set null,

    gonderici_firma_adi    text not null,
    gonderici_adi          text not null,
    gonderici_telefon      text not null,
    gonderici_adres        text not null,
    gonderici_vkn          text,

    alici_adi              text not null,
    alici_firma            text,
    alici_telefon          text,
    alici_adres            text not null,

    odeme_tipi             text not null check (odeme_tipi in ('UA', 'GO')),  -- Ücret Alıcı / Gönderici Ödemeli
    kargoya_verilis_tarihi date,
    created_at             timestamptz not null default now()
);

create index kargolar_created_at_idx on public.kargolar (created_at desc);

-- ─────────────────────────────────────────────────────────────
-- RLS: yalnızca giriş yapmış panel kullanıcıları.
-- ─────────────────────────────────────────────────────────────
alter table public.kargo_gondericileri enable row level security;
alter table public.kargolar            enable row level security;

create policy "panel_kullanicilari_tam_erisim" on public.kargo_gondericileri
    for all to authenticated using (true) with check (true);

create policy "panel_kullanicilari_tam_erisim" on public.kargolar
    for all to authenticated using (true) with check (true);
