-- Donanım puanları (UserBenchmark)
-- Kaynak: https://www.userbenchmark.com/page/developer adresindeki resmi CSV dosyaları (CPU, GPU, SSD, HDD, RAM, USB).
-- Haftalık zamanlanmış görev veya paneldeki "Şimdi güncelle" ile yüklenir (src/lib/donanim-puanlari.ts).
-- Her ürün sayfası (URL) bir kayıttır; GPU'da kart varyantları (Asus/MSI ...) aynı çipin kaydında toplanır.

create table public.donanim_puanlari (
    id           uuid primary key default gen_random_uuid(),
    tur          text not null check (tur in ('CPU', 'GPU', 'SSD', 'HDD', 'RAM', 'USB')),
    url          text not null unique,
    marka        text not null,
    model        text not null,
    parca_nolar  text[] not null default '{}',
    varyantlar   text[] not null default '{}',  -- aynı kayda bağlı diğer model adları (kart üreticileri vb.)
    sira         integer,
    puan         numeric(10, 2),
    ornek        integer,                        -- puanın dayandığı test sayısı
    son_gorulme  timestamptz not null default now(),  -- en son güncellemede CSV'de vardı
    arama        text not null default '',       -- tetikleyici doldurur (Türkçe harf duyarsız)
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

create index donanim_puanlari_tur_sira_idx on public.donanim_puanlari (tur, sira);

create or replace function public.donanim_puani_hazirla()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.arama := public.arama_metni(
        new.marka || ' ' || new.model || ' ' || array_to_string(new.parca_nolar, ' ') || ' ' || array_to_string(new.varyantlar, ' ')
    );
    return new;
end;
$$;

create trigger donanim_puanlari_hazirla
    before insert or update on public.donanim_puanlari
    for each row execute function public.donanim_puani_hazirla();

create trigger donanim_puanlari_updated_at
    before update on public.donanim_puanlari
    for each row execute function public.updated_at_guncelle();

-- ─────────────────────────────────────────────────────────────
-- Geçmiş: sıra veya puan her değiştiğinde (ve ilk yüklemede) bir satır yazılır.
-- ─────────────────────────────────────────────────────────────
create table public.donanim_puan_gecmisi (
    id        bigint generated always as identity primary key,
    puan_id   uuid not null references public.donanim_puanlari (id) on delete cascade,
    sira      integer,
    puan      numeric(10, 2),
    ornek     integer,
    tarih     timestamptz not null default now()
);

create index donanim_puan_gecmisi_puan_idx on public.donanim_puan_gecmisi (puan_id, tarih desc);

create or replace function public.donanim_puani_gecmise_yaz()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if tg_op = 'INSERT' or new.sira is distinct from old.sira or new.puan is distinct from old.puan then
        insert into public.donanim_puan_gecmisi (puan_id, sira, puan, ornek) values (new.id, new.sira, new.puan, new.ornek);
    end if;
    return new;
end;
$$;

create trigger donanim_puanlari_gecmis
    after insert or update on public.donanim_puanlari
    for each row execute function public.donanim_puani_gecmise_yaz();

-- ─────────────────────────────────────────────────────────────
-- Takip listesi (dükkân geneli; herkes aynı listeyi görür).
-- ─────────────────────────────────────────────────────────────
create table public.donanim_takip (
    puan_id     uuid primary key references public.donanim_puanlari (id) on delete cascade,
    ekleyen_id  uuid default auth.uid() references auth.users (id) on delete set null,
    created_at  timestamptz not null default now()
);

create index donanim_takip_ekleyen_idx on public.donanim_takip (ekleyen_id);

-- ─────────────────────────────────────────────────────────────
-- Güncelleme kayıtları (son güncelleme zamanı ve sonucu panelde gösterilir).
-- ─────────────────────────────────────────────────────────────
create table public.donanim_guncellemeleri (
    id          bigint generated always as identity primary key,
    kaynak      text not null check (kaynak in ('zamanlanmis', 'elle')),
    basarili    boolean not null,
    ozet        jsonb not null default '{}',  -- { "CPU": 1427, ... }
    hata        text,
    tarih       timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Stoktaki ürünün eşleştiği donanım (elle onaylanır; boşsa panel otomatik öneri gösterir).
-- ─────────────────────────────────────────────────────────────
alter table public.urunler
    add column donanim_puan_id uuid references public.donanim_puanlari (id) on delete set null;

create index urunler_donanim_puan_idx on public.urunler (donanim_puan_id);

-- ─────────────────────────────────────────────────────────────
-- RLS: tüm panel rolleri okur; yükleme ve takip yönetici + teknisyen. Zamanlanmış görev gizli anahtarla RLS'i atlar.
-- ─────────────────────────────────────────────────────────────
alter table public.donanim_puanlari       enable row level security;
alter table public.donanim_puan_gecmisi   enable row level security;
alter table public.donanim_takip          enable row level security;
alter table public.donanim_guncellemeleri enable row level security;

create policy "rol_okur" on public.donanim_puanlari for select to authenticated
    using ((select public.panel_rolu()) = any ('{yonetici,teknisyen,kasa}'::text[]));
create policy "rol_ekler" on public.donanim_puanlari for insert to authenticated
    with check ((select public.panel_rolu()) = any ('{yonetici,teknisyen}'::text[]));
create policy "rol_gunceller" on public.donanim_puanlari for update to authenticated
    using ((select public.panel_rolu()) = any ('{yonetici,teknisyen}'::text[]))
    with check ((select public.panel_rolu()) = any ('{yonetici,teknisyen}'::text[]));

create policy "rol_okur" on public.donanim_puan_gecmisi for select to authenticated
    using ((select public.panel_rolu()) = any ('{yonetici,teknisyen,kasa}'::text[]));
-- Geçmiş yalnızca tetikleyiciyle yazılır (tetikleyici, satırı ekleyen kullanıcının yetkisiyle çalışır).
create policy "rol_ekler" on public.donanim_puan_gecmisi for insert to authenticated
    with check ((select public.panel_rolu()) = any ('{yonetici,teknisyen}'::text[]));

create policy "rol_okur" on public.donanim_takip for select to authenticated
    using ((select public.panel_rolu()) = any ('{yonetici,teknisyen,kasa}'::text[]));
create policy "rol_ekler" on public.donanim_takip for insert to authenticated
    with check ((select public.panel_rolu()) = any ('{yonetici,teknisyen}'::text[]));
create policy "rol_siler" on public.donanim_takip for delete to authenticated
    using ((select public.panel_rolu()) = any ('{yonetici,teknisyen}'::text[]));

create policy "rol_okur" on public.donanim_guncellemeleri for select to authenticated
    using ((select public.panel_rolu()) = any ('{yonetici,teknisyen,kasa}'::text[]));
create policy "rol_ekler" on public.donanim_guncellemeleri for insert to authenticated
    with check ((select public.panel_rolu()) = any ('{yonetici,teknisyen}'::text[]));

revoke all on public.donanim_puanlari, public.donanim_puan_gecmisi, public.donanim_takip, public.donanim_guncellemeleri from anon;
