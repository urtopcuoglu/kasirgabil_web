-- Faz 3: Stok / Ürün modülü
-- Kategori ağacı, kutular (notebook yedek parça), ürünler ve stok hareketleri.

-- ─────────────────────────────────────────────────────────────
-- urun_kategorileri: kendine referanslı, sınırsız derinlikte ağaç
-- kutu_sistemi = true olan kategori ve tüm alt kategorilerindeki ürünler bir kutuya bağlanır.
-- ─────────────────────────────────────────────────────────────
create table public.urun_kategorileri (
    id            uuid primary key default gen_random_uuid(),
    ad            text not null check (length(trim(ad)) > 0),
    ust_id        uuid references public.urun_kategorileri (id) on delete restrict,
    kutu_sistemi  boolean not null default false,
    created_at    timestamptz not null default now()
);

create index urun_kategorileri_ust_idx on public.urun_kategorileri (ust_id);
-- Aynı dalda aynı isimli iki kategori olamaz.
create unique index urun_kategorileri_ad_tekil
    on public.urun_kategorileri (coalesce(ust_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(trim(ad)));

-- Kategori kendi alt dalına taşınamaz (döngü oluşmasın).
create or replace function public.urun_kategori_dongu_engelle()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.ust_id is not null and exists (
        with recursive alt as (
            select id from public.urun_kategorileri where id = new.id
            union all
            select k.id from public.urun_kategorileri k join alt on k.ust_id = alt.id
        )
        select 1 from alt where id = new.ust_id
    ) then
        raise exception 'Kategori kendi alt kategorisinin altına taşınamaz.';
    end if;
    return new;
end;
$$;

create trigger urun_kategorileri_dongu
    before update of ust_id on public.urun_kategorileri
    for each row execute function public.urun_kategori_dongu_engelle();

-- Kategori veya üst kategorilerinden biri kutu sistemindeyse true.
create or replace function public.urun_kategori_kutulu(p_kategori_id uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
    with recursive ust as (
        select id, ust_id, kutu_sistemi from public.urun_kategorileri where id = p_kategori_id
        union all
        select k.id, k.ust_id, k.kutu_sistemi from public.urun_kategorileri k join ust on k.id = ust.ust_id
    )
    select coalesce(bool_or(kutu_sistemi), false) from ust;
$$;

-- Başlangıç dalı: Notebook > Yedek Parça (kutu sistemi). Kalan ağaç kullanıcının listesiyle eklenecek.
with notebook as (
    insert into public.urun_kategorileri (ad) values ('Notebook') returning id
)
insert into public.urun_kategorileri (ad, ust_id, kutu_sistemi)
select 'Yedek Parça', id, true from notebook;

-- ─────────────────────────────────────────────────────────────
-- kutular: notebook parçalarının fiziksel kutuları (üstünde marka/model yazar)
-- Aynı marka/model için ikinci kutu açılmaz; parçalar mevcut kutuya eklenir.
-- ─────────────────────────────────────────────────────────────
create table public.kutular (
    id          uuid primary key default gen_random_uuid(),
    kutu_no     integer not null unique check (kutu_no > 0),
    marka       text not null check (length(trim(marka)) > 0),
    model       text not null check (length(trim(model)) > 0),
    konum       text,  -- raf / dolap
    notlar      text,
    son_sira    integer not null default 0,  -- kutuya eklenen son parçanın sırası (stok kodu için)
    -- Arama için: "301 Lenovo ThinkPad E14"
    arama       text generated always as (kutu_no::text || ' ' || marka || ' ' || model) stored,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

-- Büyük/küçük harf ve fazla boşluk farkı aynı kutu sayılır.
create unique index kutular_marka_model_tekil on public.kutular (
    lower(regexp_replace(trim(marka), '\s+', ' ', 'g')),
    lower(regexp_replace(trim(model), '\s+', ' ', 'g'))
);

create trigger kutular_updated_at
    before update on public.kutular
    for each row execute function public.updated_at_guncelle();

-- ─────────────────────────────────────────────────────────────
-- Stok kodu
-- Kutulu ürün: <kutu no>-<kutu içi sıra 4 hane>  → 200-0001
-- Diğer ürünler: 6 haneli sıra                    → 000001
-- Biçim değişirse yalnızca bu fonksiyon ve urun_hazirla() değiştirilir.
-- ─────────────────────────────────────────────────────────────
create sequence public.urun_stok_kodu_seq start 1;

create or replace function public.stok_kodu_uret()
returns text
language sql
volatile
set search_path = ''
as $$
    select lpad(nextval('public.urun_stok_kodu_seq')::text, 6, '0');
$$;

-- ─────────────────────────────────────────────────────────────
-- urunler
-- ─────────────────────────────────────────────────────────────
create table public.urunler (
    id               uuid primary key default gen_random_uuid(),
    stok_kodu        text not null unique,  -- trigger üretir
    kategori_id      uuid not null references public.urun_kategorileri (id) on delete restrict,
    kutu_id          uuid references public.kutular (id) on delete restrict,
    kutu_sira        integer,
    ad               text not null check (length(trim(ad)) > 0),
    marka            text,
    model            text,
    durum            text not null default 'sifir' check (durum in ('sifir', 'ikinci_el')),
    seri_no          text,
    barkod           text,  -- barkod / GTIN
    tedarikci_id     uuid references public.rehber_kisiler (id) on delete set null,
    aciklama         text,

    -- Fiyat ve maliyet hesabı (hepsi opsiyonel). Satış fiyatı KDV dahildir.
    satis_fiyati     numeric(12, 2) check (satis_fiyati >= 0),
    alis_fiyati      numeric(12, 2) check (alis_fiyati >= 0),
    kdv_orani        smallint check (kdv_orani in (1, 10, 18, 20)),
    komisyon_orani   numeric(5, 2) check (komisyon_orani between 0 and 100),
    komisyon_tutari  numeric(12, 2) check (komisyon_tutari >= 0),
    kargo_desi       numeric(7, 2) check (kargo_desi >= 0),
    kargo_ucreti     numeric(12, 2) check (kargo_ucreti >= 0),

    -- Yalnızca stok_hareketleri trigger'ı değiştirir.
    stok_adedi       integer not null default 0 check (stok_adedi >= 0),

    arama            text generated always as (
                         stok_kodu || ' ' || ad || ' ' || coalesce(marka, '') || ' ' || coalesce(model, '') || ' ' ||
                         coalesce(seri_no, '') || ' ' || coalesce(barkod, '')
                     ) stored,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now(),

    unique (kutu_id, kutu_sira)
);

create index urunler_kategori_idx  on public.urunler (kategori_id);
create index urunler_kutu_idx      on public.urunler (kutu_id);
create index urunler_tedarikci_idx on public.urunler (tedarikci_id);
-- Seri no ve barkod girildiyse benzersizdir.
create unique index urunler_seri_tekil   on public.urunler (upper(seri_no)) where seri_no is not null;
create unique index urunler_barkod_tekil on public.urunler (barkod) where barkod is not null;

create trigger urunler_updated_at
    before update on public.urunler
    for each row execute function public.updated_at_guncelle();

-- Kutu kuralı, stok kodu ve stok adedi koruması.
create or replace function public.urun_hazirla()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
    v_kutu_no integer;
begin
    if public.urun_kategori_kutulu(new.kategori_id) then
        if new.kutu_id is null then
            raise exception 'Notebook yedek parçaları bir kutuya bağlanmalı. Kutu seçin.';
        end if;
    else
        new.kutu_id := null;
    end if;

    if tg_op = 'INSERT' or new.kutu_id is distinct from old.kutu_id then
        if new.kutu_id is not null then
            -- Sayaç kutu satırında artar (satır kilitlenir); silinen parçanın kodu başkasına verilmez.
            update public.kutular set son_sira = son_sira + 1 where id = new.kutu_id
            returning kutu_no, son_sira into v_kutu_no, new.kutu_sira;
            new.stok_kodu := v_kutu_no || '-' || lpad(new.kutu_sira::text, 4, '0');
        elsif tg_op = 'INSERT' or old.kutu_id is not null then
            new.kutu_sira := null;
            new.stok_kodu := public.stok_kodu_uret();
        else
            new.stok_kodu := old.stok_kodu;
        end if;
    else
        new.stok_kodu := old.stok_kodu;
        new.kutu_sira := old.kutu_sira;
    end if;

    -- Stok adedi formdan değiştirilemez; yalnızca hareket trigger'ı (iç içe çağrı) değiştirir.
    if tg_op = 'UPDATE' and pg_trigger_depth() = 1 then
        new.stok_adedi := old.stok_adedi;
    end if;

    return new;
end;
$$;

create trigger urunler_hazirla
    before insert or update on public.urunler
    for each row execute function public.urun_hazirla();

-- Kutu numarası, içinde ürün varken değiştirilemez (stok kodları kutu no içerir).
create or replace function public.kutu_no_koru()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.kutu_no <> old.kutu_no and exists (select 1 from public.urunler where kutu_id = old.id) then
        raise exception 'İçinde ürün olan kutunun numarası değiştirilemez.';
    end if;
    return new;
end;
$$;

create trigger kutular_no_koru
    before update of kutu_no on public.kutular
    for each row execute function public.kutu_no_koru();

-- ─────────────────────────────────────────────────────────────
-- stok_hareketleri: her adet değişikliğinin kaydı (silinmez, düzenlenmez)
--   giris: +, cikis: -, sayim: sayım düzeltmesi (+/-)
-- ─────────────────────────────────────────────────────────────
create table public.stok_hareketleri (
    id            uuid primary key default gen_random_uuid(),
    urun_id       uuid not null references public.urunler (id) on delete cascade,
    tip           text not null check (tip in ('giris', 'cikis', 'sayim')),
    miktar        integer not null check (miktar <> 0),
    aciklama      text,
    kullanici_id  uuid default auth.uid() references auth.users (id) on delete set null,
    created_at    timestamptz not null default now(),
    check ((tip = 'giris' and miktar > 0) or (tip = 'cikis' and miktar < 0) or tip = 'sayim')
);

create index stok_hareketleri_urun_idx      on public.stok_hareketleri (urun_id, created_at desc);
create index stok_hareketleri_kullanici_idx on public.stok_hareketleri (kullanici_id);

create or replace function public.stok_hareketi_uygula()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    update public.urunler set stok_adedi = stok_adedi + new.miktar where id = new.urun_id;
    return new;
exception
    when check_violation then
        raise exception 'Stokta yeterli ürün yok; stok adedi eksiye düşemez.';
end;
$$;

create trigger stok_hareketleri_uygula
    after insert on public.stok_hareketleri
    for each row execute function public.stok_hareketi_uygula();

-- Ürün kaydedilirken girilen başlangıç adedi, ilk giriş hareketi olarak yazılır.
create or replace function public.urun_ilk_stok()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.stok_adedi > 0 then
        update public.urunler set stok_adedi = 0 where id = new.id;
        insert into public.stok_hareketleri (urun_id, tip, miktar, aciklama)
        values (new.id, 'giris', new.stok_adedi, 'İlk kayıt');
    end if;
    return new;
end;
$$;

create trigger urunler_ilk_stok
    after insert on public.urunler
    for each row execute function public.urun_ilk_stok();

-- ─────────────────────────────────────────────────────────────
-- RLS: yalnızca giriş yapmış panel kullanıcıları. Stok hareketleri sadece eklenir/okunur.
-- ─────────────────────────────────────────────────────────────
alter table public.urun_kategorileri enable row level security;
alter table public.kutular           enable row level security;
alter table public.urunler           enable row level security;
alter table public.stok_hareketleri  enable row level security;

create policy "panel_kullanicilari_tam_erisim" on public.urun_kategorileri
    for all to authenticated using (true) with check (true);

create policy "panel_kullanicilari_tam_erisim" on public.kutular
    for all to authenticated using (true) with check (true);

create policy "panel_kullanicilari_tam_erisim" on public.urunler
    for all to authenticated using (true) with check (true);

create policy "panel_kullanicilari_okur" on public.stok_hareketleri
    for select to authenticated using (true);

create policy "panel_kullanicilari_ekler" on public.stok_hareketleri
    for insert to authenticated with check (true);

-- Fonksiyon yetkileri: Supabase varsayılan olarak public fonksiyonları anon'a açar.
revoke execute on function public.stok_kodu_uret()            from public, anon;
revoke execute on function public.urun_kategori_kutulu(uuid)  from public, anon;
grant  execute on function public.stok_kodu_uret()            to authenticated;
grant  execute on function public.urun_kategori_kutulu(uuid)  to authenticated;
