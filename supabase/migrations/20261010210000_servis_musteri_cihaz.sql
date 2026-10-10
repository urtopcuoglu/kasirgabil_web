-- Servis müşterisi (cari) ve cihaz kaydı
-- Müşteriler rehber_kisiler'de 'Müşteri' sistem kategorisiyle tutulur; cihazlar müşteriye bağlıdır.
-- Aynı müşteri / aynı cihaz tekrar geldiğinde yeni cari veya cihaz açılmaz, mevcut kayda bağlanır.

-- ─────────────────────────────────────────────────────────────
-- 'Müşteri' sistem kategorisi (elle açılmış olan varsa ona kod verilir)
-- ─────────────────────────────────────────────────────────────
insert into public.rehber_kategorileri (ad, kod, sistem)
values ('Müşteri', 'musteri', true)
on conflict (ad) do update set kod = 'musteri', sistem = true;

-- ─────────────────────────────────────────────────────────────
-- Telefon tekilliği: telefon_1'in son 10 hanesi rehberde bir kez bulunabilir.
-- "0532 123 45 67", "+90 532 123 4567" ve "5321234567" aynı numara sayılır.
-- ─────────────────────────────────────────────────────────────
alter table public.rehber_kisiler
    add column telefon_anahtar text generated always as (
        nullif(right(regexp_replace(coalesce(telefon_1, ''), '[^0-9]', '', 'g'), 10), '')
    ) stored;

create unique index rehber_kisiler_telefon_tekil on public.rehber_kisiler (telefon_anahtar);

-- ─────────────────────────────────────────────────────────────
-- cihazlar
-- ─────────────────────────────────────────────────────────────
create table public.cihazlar (
    id           uuid primary key default gen_random_uuid(),
    musteri_id   uuid not null references public.rehber_kisiler (id) on delete restrict,
    marka_model  text not null check (length(trim(marka_model)) > 0),
    seri_no      text,
    created_at   timestamptz not null default now()
);

create index cihazlar_musteri_idx on public.cihazlar (musteri_id);
-- Aynı müşteride aynı seri numaralı ikinci cihaz açılamaz.
create unique index cihazlar_seri_tekil on public.cihazlar (musteri_id, upper(seri_no)) where seri_no is not null;

alter table public.cihazlar enable row level security;

create policy "panel_kullanicilari_tam_erisim" on public.cihazlar
    for all to authenticated using (true) with check (true);

-- ─────────────────────────────────────────────────────────────
-- teknik_servis_kayitlari → müşteri ve cihaz bağlantısı
-- musteri_ad_soyad / musteri_telefon / cihaz_marka_model / seri_no sütunları kalır:
-- bağlı kayıtlardan trigger ile kopyalanır (vitrin sorgusu ve arama sütunu bunları kullanır).
-- ─────────────────────────────────────────────────────────────
alter table public.teknik_servis_kayitlari
    add column musteri_id uuid references public.rehber_kisiler (id) on delete restrict,
    add column cihaz_id   uuid references public.cihazlar (id) on delete restrict;

create index teknik_servis_musteri_idx on public.teknik_servis_kayitlari (musteri_id);
create index teknik_servis_cihaz_idx   on public.teknik_servis_kayitlari (cihaz_id);

-- Mevcut kayıtları bağla: telefonu rehberde olan müşteri o kişiye bağlanır, olmayan için kişi açılır.
insert into public.rehber_kisiler (ad_soyad_unvan, telefon_1, kategori_id)
select distinct on (anahtar) k.musteri_ad_soyad, k.musteri_telefon,
       (select id from public.rehber_kategorileri where kod = 'musteri')
  from (select *, right(regexp_replace(musteri_telefon, '[^0-9]', '', 'g'), 10) as anahtar
          from public.teknik_servis_kayitlari) k
 where not exists (select 1 from public.rehber_kisiler r where r.telefon_anahtar = k.anahtar)
 order by anahtar, k.giris_tarihi desc;

update public.teknik_servis_kayitlari k
   set musteri_id = r.id
  from public.rehber_kisiler r
 where r.telefon_anahtar = right(regexp_replace(k.musteri_telefon, '[^0-9]', '', 'g'), 10);

-- Aynı müşterideki aynı cihaz (seri no; seri no yoksa marka/model) tek cihaz kaydı olur.
insert into public.cihazlar (musteri_id, marka_model, seri_no)
select distinct on (musteri_id, coalesce(upper(seri_no), lower(trim(cihaz_marka_model))))
       musteri_id, cihaz_marka_model, seri_no
  from public.teknik_servis_kayitlari
 order by musteri_id, coalesce(upper(seri_no), lower(trim(cihaz_marka_model))), giris_tarihi desc;

update public.teknik_servis_kayitlari k
   set cihaz_id = c.id
  from public.cihazlar c
 where c.musteri_id = k.musteri_id
   and coalesce(upper(c.seri_no), lower(trim(c.marka_model)))
     = coalesce(upper(k.seri_no), lower(trim(k.cihaz_marka_model)));

alter table public.teknik_servis_kayitlari
    alter column musteri_id set not null,
    alter column cihaz_id   set not null;

-- ─────────────────────────────────────────────────────────────
-- Kayıt açılırken / düzenlenirken müşteri ve cihazı çözen trigger
--   musteri_id boş → yeni müşteri açılır; telefon rehberde kayıtlıysa hata verir (mevcut kişi seçilmeli).
--   cihaz_id boş   → müşterinin aynı seri no'lu (seri no yoksa aynı marka/modelli) cihazı varsa o kullanılır,
--                    yoksa yeni cihaz açılır.
-- Ardından müşteri/cihaz bilgileri servis kaydına kopyalanır.
-- ─────────────────────────────────────────────────────────────
create or replace function public.servis_musteri_cihaz_bagla()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
    v_anahtar text;
    v_mevcut  text;
    v_seri    text := nullif(trim(new.seri_no), '');
begin
    if new.musteri_id is null then
        v_anahtar := nullif(right(regexp_replace(coalesce(new.musteri_telefon, ''), '[^0-9]', '', 'g'), 10), '');

        select ad_soyad_unvan into v_mevcut from public.rehber_kisiler where telefon_anahtar = v_anahtar;
        if found then
            raise exception 'Bu telefon numarası rehberde "%" adına kayıtlı. Müşteriyi listeden seçin.', v_mevcut;
        end if;

        insert into public.rehber_kisiler (ad_soyad_unvan, telefon_1, kategori_id)
        values (trim(new.musteri_ad_soyad), trim(new.musteri_telefon),
                (select id from public.rehber_kategorileri where kod = 'musteri'))
        returning id into new.musteri_id;
    end if;

    if new.cihaz_id is null then
        select id into new.cihaz_id
          from public.cihazlar
         where musteri_id = new.musteri_id
           and case when v_seri is not null then upper(seri_no) = upper(v_seri)
                    else seri_no is null and lower(trim(marka_model)) = lower(trim(new.cihaz_marka_model)) end
         limit 1;

        if new.cihaz_id is null then
            insert into public.cihazlar (musteri_id, marka_model, seri_no)
            values (new.musteri_id, trim(new.cihaz_marka_model), v_seri)
            returning id into new.cihaz_id;
        end if;
    elsif not exists (select 1 from public.cihazlar where id = new.cihaz_id and musteri_id = new.musteri_id) then
        raise exception 'Seçilen cihaz bu müşteriye ait değil.';
    end if;

    select ad_soyad_unvan, coalesce(telefon_1, telefon_2, new.musteri_telefon)
      into new.musteri_ad_soyad, new.musteri_telefon
      from public.rehber_kisiler where id = new.musteri_id;

    select marka_model, seri_no
      into new.cihaz_marka_model, new.seri_no
      from public.cihazlar where id = new.cihaz_id;

    return new;
end;
$$;

create trigger teknik_servis_musteri_cihaz
    before insert or update of musteri_id, cihaz_id, musteri_ad_soyad, musteri_telefon, cihaz_marka_model, seri_no
    on public.teknik_servis_kayitlari
    for each row execute function public.servis_musteri_cihaz_bagla();
