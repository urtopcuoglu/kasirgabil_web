-- Marka & Model yönetimi
-- Ürün formundaki marka/model açılır listelerinin kaynağı. Ürünler ve kutular marka/modeli metin olarak tutmaya
-- devam eder; burada kayıtlı olmayan bir marka/model ürüne veya kutuya yazılınca tetikleyiciyle otomatik eklenir.
-- Yeniden adlandırma ürün ve kutulardaki metni de günceller; aynı ada adlandırma iki kaydı birleştirir.
-- Büyük/küçük harf, Türkçe karakter ve fazla boşluk farkı aynı ad sayılır ("LENOVO" = "Lenovo").

create table public.urun_markalari (
    id          uuid primary key default gen_random_uuid(),
    ad          text not null check (length(trim(ad)) between 1 and 60),
    anahtar     text generated always as (public.arama_metni(regexp_replace(trim(ad), '\s+', ' ', 'g'))) stored unique,
    created_at  timestamptz not null default now()
);

create table public.urun_modelleri (
    id          uuid primary key default gen_random_uuid(),
    marka_id    uuid not null references public.urun_markalari (id) on delete cascade,
    ad          text not null check (length(trim(ad)) between 1 and 100),
    anahtar     text generated always as (public.arama_metni(regexp_replace(trim(ad), '\s+', ' ', 'g'))) stored,
    created_at  timestamptz not null default now(),
    unique (marka_id, anahtar)
);

-- Ürün/kutu metninin karşılaştırma anahtarı (tablolardaki "anahtar" sütunuyla aynı dönüşüm).
create or replace function public.ad_anahtari(p text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
    select public.arama_metni(regexp_replace(trim(coalesce(p, '')), '\s+', ' ', 'g'));
$$;

create index urunler_marka_anahtar_idx on public.urunler (public.ad_anahtari(marka), public.ad_anahtari(model));
create index kutular_marka_anahtar_idx on public.kutular (public.ad_anahtari(marka), public.ad_anahtari(model));

-- ─────────────────────────────────────────────────────────────
-- Senkron: ürün/kutu kaydedilince marka ve model yoksa eklenir.
-- Ürünü kaydedebilen her kullanıcı için çalışsın diye tanımlayıcı yetkisiyle çalışır (yalnızca ekler).
-- ─────────────────────────────────────────────────────────────
create or replace function public.marka_model_kaydet()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_marka_id uuid;
begin
    if length(trim(coalesce(new.marka, ''))) = 0 then
        return new;
    end if;

    insert into public.urun_markalari (ad) values (regexp_replace(trim(new.marka), '\s+', ' ', 'g'))
    on conflict (anahtar) do nothing;
    select id into v_marka_id from public.urun_markalari where anahtar = public.ad_anahtari(new.marka);

    if length(trim(coalesce(new.model, ''))) > 0 then
        insert into public.urun_modelleri (marka_id, ad) values (v_marka_id, regexp_replace(trim(new.model), '\s+', ' ', 'g'))
        on conflict (marka_id, anahtar) do nothing;
    end if;
    return new;
end;
$$;

revoke execute on function public.marka_model_kaydet() from public, anon, authenticated;

create trigger urunler_marka_model
    after insert or update of marka, model on public.urunler
    for each row execute function public.marka_model_kaydet();

create trigger kutular_marka_model
    after insert or update of marka, model on public.kutular
    for each row execute function public.marka_model_kaydet();

-- Mevcut ürün ve kutulardaki marka/modeller aktarılır (aynı adın en çok kullanılan yazımı alınır).
insert into public.urun_markalari (ad)
select distinct on (public.ad_anahtari(marka)) regexp_replace(trim(marka), '\s+', ' ', 'g')
from (
    select marka from public.urunler where length(trim(coalesce(marka, ''))) > 0
    union all
    select marka from public.kutular
) m
group by marka
order by public.ad_anahtari(marka), count(*) desc
on conflict (anahtar) do nothing;

insert into public.urun_modelleri (marka_id, ad)
select distinct on (mk.id, public.ad_anahtari(x.model)) mk.id, regexp_replace(trim(x.model), '\s+', ' ', 'g')
from (
    select marka, model from public.urunler where length(trim(coalesce(model, ''))) > 0
    union all
    select marka, model from public.kutular
) x
join public.urun_markalari mk on mk.anahtar = public.ad_anahtari(x.marka)
group by mk.id, x.model
order by mk.id, public.ad_anahtari(x.model), count(*) desc
on conflict (marka_id, anahtar) do nothing;

-- ─────────────────────────────────────────────────────────────
-- Yönetim fonksiyonları (çağıranın yetkisiyle çalışır; RLS ürün/kutu güncellemesini yöneticiye sınırlar).
-- ─────────────────────────────────────────────────────────────

-- Markayı yeniden adlandırır. Yeni ad başka bir markaya denk geliyorsa ikisi birleşir (modeller taşınır).
-- Ürün ve kutulardaki marka metni de yeni ada çevrilir.
create or replace function public.marka_yeniden_adlandir(p_id uuid, p_ad text)
returns void
language plpgsql
set search_path = ''
as $$
declare
    v_ad     text := regexp_replace(trim(coalesce(p_ad, '')), '\s+', ' ', 'g');
    v_eski   text;
    v_hedef  uuid;
begin
    if length(v_ad) = 0 or length(v_ad) > 60 then
        raise exception 'Marka adı 1-60 karakter olmalı.';
    end if;
    select anahtar into v_eski from public.urun_markalari where id = p_id;
    if v_eski is null then
        raise exception 'Marka bulunamadı.';
    end if;

    select id into v_hedef from public.urun_markalari where anahtar = public.ad_anahtari(v_ad) and id <> p_id;
    if v_hedef is not null then
        -- Birleştirme: hedefte aynı model varsa kaynaktaki silinir, yoksa hedefe taşınır.
        delete from public.urun_modelleri k
        using public.urun_modelleri h
        where k.marka_id = p_id and h.marka_id = v_hedef and h.anahtar = k.anahtar;
        update public.urun_modelleri set marka_id = v_hedef where marka_id = p_id;
        delete from public.urun_markalari where id = p_id;
        update public.urun_markalari set ad = v_ad where id = v_hedef;
    else
        update public.urun_markalari set ad = v_ad where id = p_id;
    end if;

    update public.urunler set marka = v_ad
    where public.ad_anahtari(marka) in (v_eski, public.ad_anahtari(v_ad)) and marka is distinct from v_ad;
    update public.kutular set marka = v_ad
    where public.ad_anahtari(marka) in (v_eski, public.ad_anahtari(v_ad)) and marka is distinct from v_ad;
end;
$$;

-- Modeli yeniden adlandırır (aynı marka içinde aynı ada denk gelirse birleşir). Ürün ve kutulardaki model metni de güncellenir.
create or replace function public.model_yeniden_adlandir(p_id uuid, p_ad text)
returns void
language plpgsql
set search_path = ''
as $$
declare
    v_ad         text := regexp_replace(trim(coalesce(p_ad, '')), '\s+', ' ', 'g');
    v_eski       text;
    v_marka_id   uuid;
    v_marka      text;
begin
    if length(v_ad) = 0 or length(v_ad) > 100 then
        raise exception 'Model adı 1-100 karakter olmalı.';
    end if;
    select m.anahtar, m.marka_id, mk.anahtar into v_eski, v_marka_id, v_marka
    from public.urun_modelleri m join public.urun_markalari mk on mk.id = m.marka_id
    where m.id = p_id;
    if v_eski is null then
        raise exception 'Model bulunamadı.';
    end if;

    if exists (select 1 from public.urun_modelleri where marka_id = v_marka_id and anahtar = public.ad_anahtari(v_ad) and id <> p_id) then
        delete from public.urun_modelleri where id = p_id;
        update public.urun_modelleri set ad = v_ad where marka_id = v_marka_id and anahtar = public.ad_anahtari(v_ad);
    else
        update public.urun_modelleri set ad = v_ad where id = p_id;
    end if;

    update public.urunler set model = v_ad
    where public.ad_anahtari(marka) = v_marka
      and public.ad_anahtari(model) in (v_eski, public.ad_anahtari(v_ad)) and model is distinct from v_ad;
    update public.kutular set model = v_ad
    where public.ad_anahtari(marka) = v_marka
      and public.ad_anahtari(model) in (v_eski, public.ad_anahtari(v_ad)) and model is distinct from v_ad;
end;
$$;

-- Yalnızca hiçbir ürün veya kutuda kullanılmayan marka/model silinir.
create or replace function public.marka_sil(p_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
declare
    v_anahtar text;
begin
    select anahtar into v_anahtar from public.urun_markalari where id = p_id;
    if v_anahtar is null then
        raise exception 'Marka bulunamadı.';
    end if;
    if exists (select 1 from public.urunler where public.ad_anahtari(marka) = v_anahtar)
       or exists (select 1 from public.kutular where public.ad_anahtari(marka) = v_anahtar) then
        raise exception 'Bu marka ürün veya kutularda kullanılıyor; silinemez. Başka bir markayla birleştirmek için yeniden adlandırın.';
    end if;
    delete from public.urun_markalari where id = p_id;
end;
$$;

create or replace function public.model_sil(p_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
declare
    v_model text;
    v_marka text;
begin
    select m.anahtar, mk.anahtar into v_model, v_marka
    from public.urun_modelleri m join public.urun_markalari mk on mk.id = m.marka_id
    where m.id = p_id;
    if v_model is null then
        raise exception 'Model bulunamadı.';
    end if;
    if exists (select 1 from public.urunler where public.ad_anahtari(marka) = v_marka and public.ad_anahtari(model) = v_model)
       or exists (select 1 from public.kutular where public.ad_anahtari(marka) = v_marka and public.ad_anahtari(model) = v_model) then
        raise exception 'Bu model ürün veya kutularda kullanılıyor; silinemez. Başka bir modelle birleştirmek için yeniden adlandırın.';
    end if;
    delete from public.urun_modelleri where id = p_id;
end;
$$;

revoke execute on function public.marka_yeniden_adlandir(uuid, text), public.model_yeniden_adlandir(uuid, text),
    public.marka_sil(uuid), public.model_sil(uuid) from public, anon;
grant execute on function public.marka_yeniden_adlandir(uuid, text), public.model_yeniden_adlandir(uuid, text),
    public.marka_sil(uuid), public.model_sil(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- RLS: tüm panel rolleri okur; ekleme/düzenleme/silme yönetici (stok_yonet).
-- ─────────────────────────────────────────────────────────────
alter table public.urun_markalari enable row level security;
alter table public.urun_modelleri enable row level security;

create policy "rol_okur" on public.urun_markalari for select to authenticated
    using ((select public.panel_rolu()) = any ('{yonetici,teknisyen,kasa}'::text[]));
create policy "rol_yonetir" on public.urun_markalari for all to authenticated
    using ((select public.panel_rolu()) = any ('{yonetici}'::text[]))
    with check ((select public.panel_rolu()) = any ('{yonetici}'::text[]));

create policy "rol_okur" on public.urun_modelleri for select to authenticated
    using ((select public.panel_rolu()) = any ('{yonetici,teknisyen,kasa}'::text[]));
create policy "rol_yonetir" on public.urun_modelleri for all to authenticated
    using ((select public.panel_rolu()) = any ('{yonetici}'::text[]))
    with check ((select public.panel_rolu()) = any ('{yonetici}'::text[]));

revoke all on public.urun_markalari, public.urun_modelleri from anon;
