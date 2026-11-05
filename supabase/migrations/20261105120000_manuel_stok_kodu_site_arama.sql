-- 1) Manuel stok kodu: formda stok kodu girilirse o kullanılır, boşsa eskisi gibi otomatik üretilir.
--    Otomatik üretilen kod elle girilmiş bir kodla çakışırsa sıradaki numaraya geçilir.
-- 2) Vitrin araması: Türkçe büyük/küçük harf ve şapka/nokta farkı yok sayılır (I/ı/İ/i, Ş/ş/s, Ö/o ...).

-- ─────────────────────────────────────────────────────────────
-- 1) Stok kodu
-- ─────────────────────────────────────────────────────────────
create or replace function public.urun_hazirla()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
    v_kutu_no integer;
    v_manuel  text;
begin
    if public.urun_kategori_kutulu(new.kategori_id) then
        if new.kutu_id is null then
            raise exception 'Notebook yedek parçaları bir kutuya bağlanmalı. Kutu seçin.';
        end if;
    else
        new.kutu_id := null;
    end if;

    -- Elle girilen kod (büyük harfe çevrilir). Güncellemede değişmemişse manuel sayılmaz.
    v_manuel := nullif(upper(trim(coalesce(new.stok_kodu, ''))), '');
    if tg_op = 'UPDATE' and v_manuel = old.stok_kodu then
        v_manuel := null;
    end if;

    if tg_op = 'INSERT' or new.kutu_id is distinct from old.kutu_id then
        if new.kutu_id is not null then
            -- Sayaç kutu satırında artar (satır kilitlenir); silinen parçanın kodu başkasına verilmez.
            loop
                update public.kutular set son_sira = son_sira + 1 where id = new.kutu_id
                returning kutu_no, son_sira into v_kutu_no, new.kutu_sira;
                exit when v_manuel is not null or not exists (
                    select 1 from public.urunler
                    where stok_kodu = v_kutu_no || '-' || lpad(new.kutu_sira::text, 4, '0')
                );
            end loop;
            new.stok_kodu := coalesce(v_manuel, v_kutu_no || '-' || lpad(new.kutu_sira::text, 4, '0'));
        elsif v_manuel is not null then
            new.kutu_sira := null;
            new.stok_kodu := v_manuel;
        elsif tg_op = 'INSERT' or old.kutu_id is not null then
            new.kutu_sira := null;
            loop
                new.stok_kodu := public.stok_kodu_uret();
                exit when not exists (select 1 from public.urunler where stok_kodu = new.stok_kodu);
            end loop;
        else
            new.stok_kodu := old.stok_kodu;
        end if;
    else
        new.stok_kodu := coalesce(v_manuel, old.stok_kodu);
        new.kutu_sira := old.kutu_sira;
    end if;

    -- Stok adedi formdan değiştirilemez; yalnızca hareket trigger'ı (iç içe çağrı) değiştirir.
    if tg_op = 'UPDATE' and pg_trigger_depth() = 1 then
        new.stok_adedi := old.stok_adedi;
    end if;

    return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- 2) Vitrin araması
-- Uygulamadaki karşılığı: src/lib/schemas/ortak.ts → aramaMetni(). İkisi aynı dönüşümü yapmalı.
-- ─────────────────────────────────────────────────────────────
create or replace function public.arama_metni(p text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
    select translate(
        lower(translate(coalesce(p, ''), 'İIŞĞÜÖÇÂÎÛ', 'iisguocaiu')),
        'ışğüöçâîû',
        'isguocaiu'
    );
$$;

alter table public.urunler
    add column site_arama text generated always as (
        public.arama_metni(
            coalesce(site_ad, '') || ' ' || stok_kodu || ' ' || coalesce(marka, '') || ' ' || coalesce(model, '')
        )
    ) stored;

grant select (site_arama) on public.urunler to anon;
