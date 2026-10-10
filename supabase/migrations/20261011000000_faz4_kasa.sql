-- Faz 4: Kasa modülü
-- Kategoriler, günlük hareketler (servis / ürün / rehber bağlantılı), gün sonu sayım + kapatma, düzeltme geçmişi.

-- Türkiye saatine göre bugünün tarihi (hareket tarihi varsayılanı).
create or replace function public.bugun_tr()
returns date
language sql
stable
set search_path = ''
as $$
    select (now() at time zone 'Europe/Istanbul')::date;
$$;

-- ─────────────────────────────────────────────────────────────
-- kasa_kategorileri: gelir ve gider kategorileri (panelden yönetilir)
-- kod: sistemin koddan tanıdığı kategoriler (satis, servis); sistem = true silinemez.
-- ─────────────────────────────────────────────────────────────
create table public.kasa_kategorileri (
    id          uuid primary key default gen_random_uuid(),
    ad          text not null check (length(trim(ad)) > 0),
    tip         text not null check (tip in ('gelir', 'gider')),
    kod         text unique,
    sistem      boolean not null default false,
    created_at  timestamptz not null default now()
);

create unique index kasa_kategorileri_ad_tekil on public.kasa_kategorileri (tip, lower(trim(ad)));

insert into public.kasa_kategorileri (ad, tip, kod, sistem) values
    ('Satış',        'gelir', 'satis',  true),
    ('Servis',       'gelir', 'servis', true),
    ('Tahsilat',     'gelir', null,     false),
    ('Diğer Gelir',  'gelir', null,     false),
    ('Alış',         'gider', 'alis',   true),
    ('Kira',         'gider', null,     false),
    ('Fatura',       'gider', null,     false),
    ('Maaş',         'gider', null,     false),
    ('Masraf',       'gider', null,     false),
    ('Diğer Gider',  'gider', null,     false);

create or replace function public.kasa_kategorisi_koru()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if old.sistem then
        if tg_op = 'DELETE' then
            raise exception 'Sistem kategorisi silinemez: %', old.ad;
        elsif new.kod is distinct from old.kod or new.sistem is distinct from old.sistem or new.tip is distinct from old.tip then
            raise exception 'Sistem kategorisinin kodu veya tipi değiştirilemez: %', old.ad;
        end if;
    end if;
    if tg_op = 'DELETE' then
        return old;
    end if;
    return new;
end;
$$;

create trigger kasa_kategorileri_koru
    before update or delete on public.kasa_kategorileri
    for each row execute function public.kasa_kategorisi_koru();

-- ─────────────────────────────────────────────────────────────
-- kasa_gunleri: gün sonu sayımı ve kapatma
-- Açılış nakdi = önceki son kapanmış günün sayılan nakdi (ilk gün için elle girilir).
-- ─────────────────────────────────────────────────────────────
create table public.kasa_gunleri (
    tarih            date primary key,
    acilis_nakit     numeric(14, 2),             -- yalnızca öncesinde kapanmış gün yoksa elle girilir
    beklenen_nakit   numeric(14, 2),             -- kapanışta hesaplanır
    sayilan_nakit    numeric(14, 2) check (sayilan_nakit >= 0),
    kapandi          boolean not null default false,
    kapanis_notu     text,
    kapatan_id       uuid references auth.users (id) on delete set null,
    kapanis_zamani   timestamptz,
    created_at       timestamptz not null default now()
);

create index kasa_gunleri_kapatan_idx on public.kasa_gunleri (kapatan_id);

-- ─────────────────────────────────────────────────────────────
-- kasa_hareketleri
-- ─────────────────────────────────────────────────────────────
create table public.kasa_hareketleri (
    id                uuid primary key default gen_random_uuid(),
    tarih             date not null default public.bugun_tr(),
    tip               text not null check (tip in ('gelir', 'gider')),
    yontem            text not null check (yontem in ('nakit', 'kredi_karti', 'banka_karti', 'havale_eft')),
    tutar             numeric(14, 2) not null check (tutar > 0),
    kategori_id       uuid not null references public.kasa_kategorileri (id) on delete restrict,
    kimden_kime       text,
    aciklama          text,

    rehber_kisi_id    uuid references public.rehber_kisiler (id) on delete set null,
    servis_id         uuid references public.teknik_servis_kayitlari (id) on delete restrict,
    urun_id           uuid references public.urunler (id) on delete restrict,  -- satışı olan ürün silinemez
    urun_adet         integer check (urun_adet > 0),
    stok_hareketi_id  uuid references public.stok_hareketleri (id) on delete set null,

    kullanici_id      uuid default auth.uid() references auth.users (id) on delete set null,
    created_at        timestamptz not null default now(),
    updated_at        timestamptz not null default now(),

    check ((urun_id is null) = (urun_adet is null))
);

create index kasa_hareketleri_tarih_idx     on public.kasa_hareketleri (tarih, created_at);
create index kasa_hareketleri_kategori_idx  on public.kasa_hareketleri (kategori_id);
create index kasa_hareketleri_rehber_idx    on public.kasa_hareketleri (rehber_kisi_id);
create index kasa_hareketleri_servis_idx    on public.kasa_hareketleri (servis_id);
create index kasa_hareketleri_urun_idx      on public.kasa_hareketleri (urun_id);
create index kasa_hareketleri_stok_idx      on public.kasa_hareketleri (stok_hareketi_id);
create index kasa_hareketleri_kullanici_idx on public.kasa_hareketleri (kullanici_id);

create trigger kasa_hareketleri_updated_at
    before update on public.kasa_hareketleri
    for each row execute function public.updated_at_guncelle();

-- Kapanmış güne hareket eklenemez, değiştirilemez, silinemez; kategori tipi hareket tipine uymalı;
-- rehber kişisi seçilip "kimden/kime" boş bırakıldıysa kişinin adı yazılır.
-- İstisna: rehber kişisi silinince bağlantının boşaltılması (on delete set null) kilide takılmaz.
create or replace function public.kasa_hareketi_denetle()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if tg_op = 'UPDATE'
       and (new.tarih, new.tip, new.yontem, new.tutar, new.kategori_id, new.kimden_kime, new.aciklama,
            new.servis_id, new.urun_id, new.urun_adet)
           is not distinct from
           (old.tarih, old.tip, old.yontem, old.tutar, old.kategori_id, old.kimden_kime, old.aciklama,
            old.servis_id, old.urun_id, old.urun_adet)
       and new.rehber_kisi_id is null then
        return new;
    end if;

    if tg_op in ('UPDATE', 'DELETE') and exists (select 1 from public.kasa_gunleri where tarih = old.tarih and kapandi) then
        raise exception 'Kapatılmış güne (%) ait hareket değiştirilemez. Önce günü yeniden açın.', to_char(old.tarih, 'DD.MM.YYYY');
    end if;
    if tg_op = 'DELETE' then
        return old;
    end if;

    if exists (select 1 from public.kasa_gunleri where tarih = new.tarih and kapandi) then
        raise exception 'Kapatılmış güne (%) hareket eklenemez. Önce günü yeniden açın.', to_char(new.tarih, 'DD.MM.YYYY');
    end if;
    if new.tarih > public.bugun_tr() then
        raise exception 'İleri tarihli kasa hareketi girilemez.';
    end if;
    if (select tip from public.kasa_kategorileri where id = new.kategori_id) <> new.tip then
        raise exception 'Seçilen kategori bu hareket tipine (%) ait değil.', new.tip;
    end if;
    if new.rehber_kisi_id is not null and nullif(trim(new.kimden_kime), '') is null then
        select ad_soyad_unvan into new.kimden_kime from public.rehber_kisiler where id = new.rehber_kisi_id;
    end if;
    return new;
end;
$$;

create trigger kasa_hareketleri_denetle
    before insert or update or delete on public.kasa_hareketleri
    for each row execute function public.kasa_hareketi_denetle();

-- Ürün bağlantısı stoka yansır: gelir (satış) → stoktan çıkış, gider (alış) → stoka giriş.
-- Hareket silinir ya da ürün/adet/tip değişirse eski etki ters hareketle geri alınır.
create or replace function public.kasa_stoka_yansit()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
    v_yeni_id uuid;
begin
    -- Ürün, adet ve tip aynıysa stok etkisi değişmez.
    if tg_op = 'UPDATE' and (new.urun_id, new.urun_adet, new.tip) is not distinct from (old.urun_id, old.urun_adet, old.tip) then
        new.stok_hareketi_id := old.stok_hareketi_id;
        return new;
    end if;

    if tg_op in ('UPDATE', 'DELETE') and old.urun_id is not null then
        insert into public.stok_hareketleri (urun_id, tip, miktar, aciklama)
        values (old.urun_id,
                case when old.tip = 'gelir' then 'giris' else 'cikis' end,
                case when old.tip = 'gelir' then old.urun_adet else -old.urun_adet end,
                case when tg_op = 'DELETE' then 'Kasa hareketi silindi' else 'Kasa hareketi düzeltildi' end);
    end if;

    if tg_op = 'DELETE' then
        return old;
    end if;

    new.stok_hareketi_id := null;
    if new.urun_id is not null then
        insert into public.stok_hareketleri (urun_id, tip, miktar, aciklama)
        values (new.urun_id,
                case when new.tip = 'gelir' then 'cikis' else 'giris' end,
                case when new.tip = 'gelir' then -new.urun_adet else new.urun_adet end,
                case when new.tip = 'gelir' then 'Kasa: satış' else 'Kasa: alış' end)
        returning id into v_yeni_id;
        new.stok_hareketi_id := v_yeni_id;
    end if;
    return new;
end;
$$;

-- Denetimden sonra çalışsın diye adı "z" ile başlar (aynı olaydaki BEFORE trigger'lar ada göre sıralanır).
create trigger kasa_hareketleri_z_stok
    before insert or update or delete on public.kasa_hareketleri
    for each row execute function public.kasa_stoka_yansit();

-- ─────────────────────────────────────────────────────────────
-- kasa_hareket_gecmisi: düzenlenen / silinen hareketlerin eski hali (silinmez, düzenlenmez)
-- ─────────────────────────────────────────────────────────────
create table public.kasa_hareket_gecmisi (
    id            uuid primary key default gen_random_uuid(),
    hareket_id    uuid not null,  -- silinmiş olabilir, FK yok
    tarih         date not null,  -- hareketin (eski) tarihi; gün sayfasında listelemek için
    islem         text not null check (islem in ('duzeltme', 'silme')),
    eski          jsonb not null,
    kullanici_id  uuid default auth.uid() references auth.users (id) on delete set null,
    created_at    timestamptz not null default now()
);

create index kasa_hareket_gecmisi_tarih_idx     on public.kasa_hareket_gecmisi (tarih, created_at);
create index kasa_hareket_gecmisi_hareket_idx   on public.kasa_hareket_gecmisi (hareket_id);
create index kasa_hareket_gecmisi_kullanici_idx on public.kasa_hareket_gecmisi (kullanici_id);

-- security definer: geçmiş tablosuna kullanıcılar doğrudan yazamaz, yalnızca bu trigger yazar.
create or replace function public.kasa_gecmise_yaz()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.kasa_hareket_gecmisi (hareket_id, tarih, islem, eski)
    values (old.id, old.tarih, case when tg_op = 'DELETE' then 'silme' else 'duzeltme' end, to_jsonb(old));
    return null;
end;
$$;

create trigger kasa_hareketleri_gecmis
    after update or delete on public.kasa_hareketleri
    for each row execute function public.kasa_gecmise_yaz();

-- ─────────────────────────────────────────────────────────────
-- Gün özeti, kapatma ve yeniden açma
-- ─────────────────────────────────────────────────────────────

-- Günün açılış nakdi: elle girilmişse o, değilse önceki son kapanmış günün sayılan nakdi, o da yoksa 0.
create or replace function public.kasa_acilis_nakit(p_tarih date)
returns numeric
language sql
stable
set search_path = ''
as $$
    select coalesce(
        (select acilis_nakit from public.kasa_gunleri where tarih = p_tarih),
        (select sayilan_nakit from public.kasa_gunleri where tarih < p_tarih and kapandi order by tarih desc limit 1),
        0
    );
$$;

-- Kasada olması gereken nakit: açılış + nakit gelir - nakit gider.
create or replace function public.kasa_beklenen_nakit(p_tarih date)
returns numeric
language sql
stable
set search_path = ''
as $$
    select public.kasa_acilis_nakit(p_tarih) + coalesce(sum(case when tip = 'gelir' then tutar else -tutar end), 0)
      from public.kasa_hareketleri
     where tarih = p_tarih and yontem = 'nakit';
$$;

-- Günler sırayla kapanır: öncesinde hareketi olup kapanmamış gün varsa kapatılamaz (devir zinciri bozulmasın).
create or replace function public.kasa_gun_kapat(p_tarih date, p_sayilan numeric, p_not text default null)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
    v_acik date;
begin
    if p_tarih > public.bugun_tr() then
        raise exception 'Gelecek bir gün kapatılamaz.';
    end if;
    if p_sayilan is null or p_sayilan < 0 then
        raise exception 'Sayılan nakit tutarını girin.';
    end if;

    select min(h.tarih) into v_acik
      from public.kasa_hareketleri h
     where h.tarih < p_tarih
       and not exists (select 1 from public.kasa_gunleri g where g.tarih = h.tarih and g.kapandi);
    if v_acik is not null then
        raise exception 'Önce % tarihli günü kapatın.', to_char(v_acik, 'DD.MM.YYYY');
    end if;

    insert into public.kasa_gunleri (tarih) values (p_tarih) on conflict (tarih) do nothing;

    update public.kasa_gunleri
       set beklenen_nakit = public.kasa_beklenen_nakit(p_tarih),
           sayilan_nakit  = p_sayilan,
           kapanis_notu   = nullif(trim(p_not), ''),
           kapandi        = true,
           kapatan_id     = auth.uid(),
           kapanis_zamani = now()
     where tarih = p_tarih and not kapandi;

    if not found then
        raise exception 'Bu gün zaten kapatılmış.';
    end if;
end;
$$;

-- Yeniden açma: sonrasında kapanmış gün varsa açılamaz (önce onlar açılmalı).
create or replace function public.kasa_gun_ac(p_tarih date)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
    v_sonraki date;
begin
    select min(tarih) into v_sonraki from public.kasa_gunleri where tarih > p_tarih and kapandi;
    if v_sonraki is not null then
        raise exception 'Önce % tarihli kapanmış günü yeniden açın.', to_char(v_sonraki, 'DD.MM.YYYY');
    end if;

    update public.kasa_gunleri
       set kapandi = false, beklenen_nakit = null, kapatan_id = null, kapanis_zamani = null
     where tarih = p_tarih and kapandi;

    if not found then
        raise exception 'Bu gün kapalı değil.';
    end if;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- RLS: yalnızca giriş yapmış panel kullanıcıları. Düzeltme geçmişi sadece okunur (trigger yazar).
-- ─────────────────────────────────────────────────────────────
alter table public.kasa_kategorileri    enable row level security;
alter table public.kasa_gunleri         enable row level security;
alter table public.kasa_hareketleri     enable row level security;
alter table public.kasa_hareket_gecmisi enable row level security;

create policy "panel_kullanicilari_tam_erisim" on public.kasa_kategorileri
    for all to authenticated using (true) with check (true);

create policy "panel_kullanicilari_tam_erisim" on public.kasa_gunleri
    for all to authenticated using (true) with check (true);

create policy "panel_kullanicilari_tam_erisim" on public.kasa_hareketleri
    for all to authenticated using (true) with check (true);

create policy "panel_kullanicilari_okur" on public.kasa_hareket_gecmisi
    for select to authenticated using (true);

-- Fonksiyon yetkileri: Supabase varsayılan olarak public fonksiyonları anon'a açar.
revoke execute on function public.kasa_gecmise_yaz()                  from public, anon, authenticated;
revoke execute on function public.bugun_tr()                          from public, anon;
revoke execute on function public.kasa_acilis_nakit(date)             from public, anon;
revoke execute on function public.kasa_beklenen_nakit(date)           from public, anon;
revoke execute on function public.kasa_gun_kapat(date, numeric, text) from public, anon;
revoke execute on function public.kasa_gun_ac(date)                   from public, anon;
grant  execute on function public.bugun_tr()                          to authenticated;
grant  execute on function public.kasa_acilis_nakit(date)             to authenticated;
grant  execute on function public.kasa_beklenen_nakit(date)           to authenticated;
grant  execute on function public.kasa_gun_kapat(date, numeric, text) to authenticated;
grant  execute on function public.kasa_gun_ac(date)                   to authenticated;
