-- Faz 2: Teknik Servis modülü
-- Supabase Dashboard → SQL Editor'de bir kez çalıştırılır.
-- Ön koşul: Faz 1 migration'ı (personel tablosu, updated_at_guncelle fonksiyonu).

-- ─────────────────────────────────────────────────────────────
-- Form numarası
-- GEÇİCİ BİÇİM: sırayla artan sayı (1, 2, 3...). Firmanın kağıt fişindeki biçim
-- netleşince yalnızca bu fonksiyon değiştirilir; kağıttaki son numaradan devam etmek için:
--   select setval('public.servis_form_no_seq', <kağıttaki son numara>);
-- ─────────────────────────────────────────────────────────────
create sequence public.servis_form_no_seq start 1;

create or replace function public.servis_form_no_uret()
returns text
language sql
volatile
set search_path = ''
as $$
    select nextval('public.servis_form_no_seq')::text;
$$;

-- ─────────────────────────────────────────────────────────────
-- teknik_servis_kayitlari
-- ─────────────────────────────────────────────────────────────
create table public.teknik_servis_kayitlari (
    id                      uuid primary key default gen_random_uuid(),
    form_no                 text not null unique default public.servis_form_no_uret(),
    musteri_ad_soyad        text not null check (length(trim(musteri_ad_soyad)) > 0),
    musteri_telefon         text not null,
    cihaz_marka_model       text not null check (length(trim(cihaz_marka_model)) > 0),
    seri_no                 text,
    sikayet                 text not null check (length(trim(sikayet)) > 0),
    notlar                  text,  -- iç not; vitrin sorgusunda asla gösterilmez
    durum                   text not null default 'kayit_alindi'
                            check (durum in ('kayit_alindi', 'parca_bekliyor', 'musteri_onayi_bekliyor',
                                             'tamir_asamasinda', 'teslim_hazir', 'teslim_edildi')),
    teslim_alan_personel_id uuid not null references public.personel (id) on delete restrict,
    giris_tarihi            timestamptz not null default now(),
    tahmini_teslim_tarihi   date,
    teslim_tarihi           timestamptz,
    -- Admin araması için: form no + müşteri + telefon rakamları + cihaz + seri no
    arama                   text generated always as (
                                form_no || ' ' || musteri_ad_soyad || ' ' ||
                                regexp_replace(musteri_telefon, '[^0-9]', '', 'g') || ' ' ||
                                cihaz_marka_model || ' ' || coalesce(seri_no, '')
                            ) stored,
    created_at              timestamptz not null default now(),
    updated_at              timestamptz not null default now()
);

create index teknik_servis_durum_idx on public.teknik_servis_kayitlari (durum);
create index teknik_servis_giris_idx on public.teknik_servis_kayitlari (giris_tarihi desc);

create trigger teknik_servis_updated_at
    before update on public.teknik_servis_kayitlari
    for each row execute function public.updated_at_guncelle();

-- ─────────────────────────────────────────────────────────────
-- servis_durum_gecmisi: her durum değişikliğinin kaydı
-- ─────────────────────────────────────────────────────────────
create table public.servis_durum_gecmisi (
    id           uuid primary key default gen_random_uuid(),
    servis_id    uuid not null references public.teknik_servis_kayitlari (id) on delete cascade,
    durum        text not null
                 check (durum in ('kayit_alindi', 'parca_bekliyor', 'musteri_onayi_bekliyor',
                                  'tamir_asamasinda', 'teslim_hazir', 'teslim_edildi')),
    aciklama     text,  -- iç not; vitrine açılmaz
    kullanici_id uuid default auth.uid() references auth.users (id) on delete set null,
    created_at   timestamptz not null default now()
);

create index servis_durum_gecmisi_servis_idx on public.servis_durum_gecmisi (servis_id, created_at);

-- Yeni kayıt açılınca ilk geçmiş satırı otomatik yazılır.
create or replace function public.servis_ilk_gecmis()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    insert into public.servis_durum_gecmisi (servis_id, durum, aciklama)
    values (new.id, new.durum, 'Servis kaydı oluşturuldu');
    return new;
end;
$$;

create trigger teknik_servis_ilk_gecmis
    after insert on public.teknik_servis_kayitlari
    for each row execute function public.servis_ilk_gecmis();

-- Durum değişikliği ve geçmiş kaydı tek işlemde yapılır (biri olup diğeri eksik kalmaz).
-- security invoker: çağıranın RLS yetkileriyle çalışır.
create or replace function public.servis_durum_degistir(p_servis_id uuid, p_durum text, p_aciklama text default null)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
    update public.teknik_servis_kayitlari
       set durum = p_durum,
           teslim_tarihi = case
               when p_durum = 'teslim_edildi' then coalesce(teslim_tarihi, now())
               else null
           end
     where id = p_servis_id;

    if not found then
        raise exception 'Servis kaydı bulunamadı.';
    end if;

    insert into public.servis_durum_gecmisi (servis_id, durum, aciklama)
    values (p_servis_id, p_durum, nullif(trim(p_aciklama), ''));
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- servis_kalemleri: işçilik / malzeme ücret satırları (vitrine asla açılmaz)
-- ─────────────────────────────────────────────────────────────
create table public.servis_kalemleri (
    id           uuid primary key default gen_random_uuid(),
    servis_id    uuid not null references public.teknik_servis_kayitlari (id) on delete cascade,
    tip          text not null check (tip in ('iscilik', 'malzeme')),
    aciklama     text not null check (length(trim(aciklama)) > 0),
    miktar       numeric(10, 2) not null default 1 check (miktar > 0),
    birim_fiyat  numeric(12, 2) not null default 0 check (birim_fiyat >= 0),
    tutar        numeric(14, 2) generated always as (round(miktar * birim_fiyat, 2)) stored,
    created_at   timestamptz not null default now()
);

create index servis_kalemleri_servis_idx on public.servis_kalemleri (servis_id, created_at);

-- ─────────────────────────────────────────────────────────────
-- RLS: yalnızca giriş yapmış panel kullanıcıları.
-- ─────────────────────────────────────────────────────────────
alter table public.teknik_servis_kayitlari enable row level security;
alter table public.servis_durum_gecmisi    enable row level security;
alter table public.servis_kalemleri        enable row level security;

create policy "panel_kullanicilari_tam_erisim" on public.teknik_servis_kayitlari
    for all to authenticated using (true) with check (true);

create policy "panel_kullanicilari_tam_erisim" on public.servis_durum_gecmisi
    for all to authenticated using (true) with check (true);

create policy "panel_kullanicilari_tam_erisim" on public.servis_kalemleri
    for all to authenticated using (true) with check (true);

-- ─────────────────────────────────────────────────────────────
-- Vitrin sorgusu (anonim ziyaretçi)
-- Form no VE telefon (son 10 hane) birlikte tam eşleşmeli; tek alanla kimsenin kaydı listelenemez.
-- Yalnızca durum bilgisi döner: ücretler, iç notlar ve açıklamalar dönmez; isim maskelenir.
-- security definer: anon tabloları doğrudan okuyamaz, sadece bu fonksiyon üzerinden bu alanları görür.
-- ─────────────────────────────────────────────────────────────
create or replace function public.servis_sorgula(p_form_no text, p_telefon text)
returns table (
    form_no               text,
    musteri               text,
    cihaz                 text,
    sikayet               text,
    durum                 text,
    giris_tarihi          timestamptz,
    tahmini_teslim_tarihi date,
    teslim_tarihi         timestamptz,
    gecmis                jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
    select
        k.form_no,
        (select string_agg(left(p, 2) || repeat('*', greatest(length(p) - 2, 1)), ' ')
           from regexp_split_to_table(trim(k.musteri_ad_soyad), '\s+') as p),
        k.cihaz_marka_model,
        k.sikayet,
        k.durum,
        k.giris_tarihi,
        k.tahmini_teslim_tarihi,
        k.teslim_tarihi,
        coalesce(
            (select jsonb_agg(jsonb_build_object('durum', g.durum, 'tarih', g.created_at) order by g.created_at)
               from public.servis_durum_gecmisi g
              where g.servis_id = k.id),
            '[]'::jsonb
        )
    from public.teknik_servis_kayitlari k
    where length(regexp_replace(coalesce(p_telefon, ''), '[^0-9]', '', 'g')) >= 10
      and upper(k.form_no) = upper(trim(p_form_no))
      and right(regexp_replace(k.musteri_telefon, '[^0-9]', '', 'g'), 10)
          = right(regexp_replace(p_telefon, '[^0-9]', '', 'g'), 10);
$$;

-- ─────────────────────────────────────────────────────────────
-- Fonksiyon yetkileri: Supabase varsayılan olarak public fonksiyonları anon'a açar.
-- ─────────────────────────────────────────────────────────────
revoke execute on function public.servis_form_no_uret()                    from public, anon;
revoke execute on function public.servis_durum_degistir(uuid, text, text)  from public, anon;
revoke execute on function public.servis_sorgula(text, text)               from public;
grant  execute on function public.servis_form_no_uret()                    to authenticated;
grant  execute on function public.servis_durum_degistir(uuid, text, text)  to authenticated;
grant  execute on function public.servis_sorgula(text, text)               to anon, authenticated;
