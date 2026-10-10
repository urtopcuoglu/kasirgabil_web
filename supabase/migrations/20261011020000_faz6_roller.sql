-- Faz 6: Rol bazlı yetki, kritik stok ve geliştirici hesabı
-- Panel kullanıcısının yetkisi, auth kullanıcısına bağlı AKTİF personel kaydının rolüdür.
-- Personele bağlı olmayan ya da pasif personele bağlı hesap hiçbir veriye erişemez.
--
--                          Yönetici   Teknisyen   Kasa
--   Teknik servis           tam        yazar       okur
--   Ücret kalemleri         tam        tam         okur
--   Stok (ürün/kutu/kat.)   tam        okur        okur
--   Stok hareketi           tam        ekler       (kasa satışıyla, trigger üzerinden)
--   Kasa                    tam        —           yazar (günü yeniden açamaz)
--   Rehber, kargolar        tam        yazar       yazar
--   İçerik / blog           tam        —           —
--   Personel                tam        okur        okur   (listelerde seçilebilsin diye)
--   Silme                   yalnızca yönetici (ücret kalemi hariç)

-- ─────────────────────────────────────────────────────────────
-- Yeni sütunlar
-- ─────────────────────────────────────────────────────────────

-- Geliştirici gibi operasyonda yer almayan hesaplar; personel seçim listelerinde görünmez.
alter table public.personel add column sistem_hesabi boolean not null default false;

-- Kritik stok: minimum stok girilmiş ve stok bu seviyeye inmişse.
alter table public.urunler
    add column min_stok integer check (min_stok >= 0),
    add column kritik boolean generated always as (min_stok is not null and stok_adedi <= min_stok) stored;

create index urunler_kritik_idx on public.urunler (kritik) where kritik;

-- Geliştirici hesabı (urt.info.bireysel@gmail.com) yönetici yetkisiyle bağlanır.
insert into public.personel (ad_soyad, rol, aktif, sistem_hesabi, auth_user_id)
select 'Geliştirici', 'yonetici', true, true, id from auth.users where email = 'urt.info.bireysel@gmail.com';

-- ─────────────────────────────────────────────────────────────
-- Oturumdaki kullanıcının rolü
-- security definer: politikalarda kullanılır, personel tablosunun kendi RLS'ine takılmaz.
-- ─────────────────────────────────────────────────────────────
create or replace function public.panel_rolu()
returns text
language sql
stable
security definer
set search_path = ''
as $$
    select rol from public.personel where auth_user_id = auth.uid() and aktif;
$$;

revoke execute on function public.panel_rolu() from public, anon;
grant  execute on function public.panel_rolu() to authenticated;

-- ─────────────────────────────────────────────────────────────
-- Politika üretici (yalnızca bu migration içinde)
-- ─────────────────────────────────────────────────────────────
create or replace function pg_temp.rol_politikalari(p_tablo text, p_okur text[], p_yazar text[], p_siler text[])
returns void
language plpgsql
as $$
declare
    v_kosul text;
begin
    execute format('drop policy if exists "panel_kullanicilari_tam_erisim" on public.%I', p_tablo);

    v_kosul := format('(select public.panel_rolu()) = any (%L::text[])', p_okur);
    execute format('create policy "rol_okur" on public.%I for select to authenticated using (%s)', p_tablo, v_kosul);

    v_kosul := format('(select public.panel_rolu()) = any (%L::text[])', p_yazar);
    execute format('create policy "rol_ekler" on public.%I for insert to authenticated with check (%s)', p_tablo, v_kosul);
    execute format('create policy "rol_gunceller" on public.%I for update to authenticated using (%s) with check (%s)', p_tablo, v_kosul, v_kosul);

    v_kosul := format('(select public.panel_rolu()) = any (%L::text[])', p_siler);
    execute format('create policy "rol_siler" on public.%I for delete to authenticated using (%s)', p_tablo, v_kosul);
end;
$$;

-- tablo, okuyabilen, ekleyip güncelleyebilen, silebilen
select pg_temp.rol_politikalari('personel',                '{yonetici,teknisyen,kasa}', '{yonetici}',                   '{yonetici}');
select pg_temp.rol_politikalari('rehber_kategorileri',     '{yonetici,teknisyen,kasa}', '{yonetici,teknisyen,kasa}',    '{yonetici}');
select pg_temp.rol_politikalari('rehber_kisiler',          '{yonetici,teknisyen,kasa}', '{yonetici,teknisyen,kasa}',    '{yonetici}');
select pg_temp.rol_politikalari('cihazlar',                '{yonetici,teknisyen,kasa}', '{yonetici,teknisyen,kasa}',    '{yonetici}');
select pg_temp.rol_politikalari('kargo_gondericileri',     '{yonetici,teknisyen,kasa}', '{yonetici,teknisyen,kasa}',    '{yonetici}');
select pg_temp.rol_politikalari('kargolar',                '{yonetici,teknisyen,kasa}', '{yonetici,teknisyen,kasa}',    '{yonetici}');
select pg_temp.rol_politikalari('teknik_servis_kayitlari', '{yonetici,teknisyen,kasa}', '{yonetici,teknisyen}',         '{yonetici}');
select pg_temp.rol_politikalari('servis_durum_gecmisi',    '{yonetici,teknisyen,kasa}', '{yonetici,teknisyen}',         '{yonetici}');
select pg_temp.rol_politikalari('servis_kalemleri',        '{yonetici,teknisyen,kasa}', '{yonetici,teknisyen}',         '{yonetici,teknisyen}');
select pg_temp.rol_politikalari('urun_kategorileri',       '{yonetici,teknisyen,kasa}', '{yonetici}',                   '{yonetici}');
select pg_temp.rol_politikalari('kutular',                 '{yonetici,teknisyen,kasa}', '{yonetici}',                   '{yonetici}');
select pg_temp.rol_politikalari('urunler',                 '{yonetici,teknisyen,kasa}', '{yonetici}',                   '{yonetici}');
select pg_temp.rol_politikalari('kasa_kategorileri',       '{yonetici,kasa}',           '{yonetici}',                   '{yonetici}');
select pg_temp.rol_politikalari('kasa_gunleri',            '{yonetici,kasa}',           '{yonetici,kasa}',              '{yonetici}');
select pg_temp.rol_politikalari('kasa_hareketleri',        '{yonetici,kasa}',           '{yonetici,kasa}',              '{yonetici}');

-- Stok hareketleri: silinmez/düzenlenmez; teknisyen ekleyebilir, kasa yalnızca kasa satışı (trigger) ile.
drop policy "panel_kullanicilari_okur" on public.stok_hareketleri;
drop policy "panel_kullanicilari_ekler" on public.stok_hareketleri;
create policy "rol_okur" on public.stok_hareketleri
    for select to authenticated using ((select public.panel_rolu()) = any ('{yonetici,teknisyen,kasa}'::text[]));
create policy "rol_ekler" on public.stok_hareketleri
    for insert to authenticated with check ((select public.panel_rolu()) = any ('{yonetici,teknisyen}'::text[]));

-- Kasa düzeltme geçmişi: yalnızca okunur (security definer trigger yazar).
drop policy "panel_kullanicilari_okur" on public.kasa_hareket_gecmisi;
create policy "rol_okur" on public.kasa_hareket_gecmisi
    for select to authenticated using ((select public.panel_rolu()) = any ('{yonetici,kasa}'::text[]));

-- Site içerikleri ve blog: vitrin (anon) okumaya devam eder; panelde yalnızca yönetici.
drop policy "panel_kullanicilari_yazar" on public.site_icerikleri;
create policy "yonetici_gunceller" on public.site_icerikleri
    for update to authenticated
    using ((select public.panel_rolu()) = 'yonetici') with check ((select public.panel_rolu()) = 'yonetici');

drop policy "panel_kullanicilari_yazar" on public.blog_kategorileri;
create policy "yonetici_yazar" on public.blog_kategorileri
    for all to authenticated
    using ((select public.panel_rolu()) = 'yonetici') with check ((select public.panel_rolu()) = 'yonetici');

drop policy "panel_kullanicilari_tam_erisim" on public.blog_yazilari;
create policy "yonetici_tam_erisim" on public.blog_yazilari
    for all to authenticated
    using ((select public.panel_rolu()) = 'yonetici') with check ((select public.panel_rolu()) = 'yonetici');

-- Görsel deposu: yalnızca yönetici yükler / siler.
drop policy "site_gorselleri_panel_okur" on storage.objects;
drop policy "site_gorselleri_panel_ekler" on storage.objects;
drop policy "site_gorselleri_panel_gunceller" on storage.objects;
drop policy "site_gorselleri_panel_siler" on storage.objects;
create policy "site_gorselleri_yonetici_okur" on storage.objects
    for select to authenticated using (bucket_id = 'site' and (select public.panel_rolu()) = 'yonetici');
create policy "site_gorselleri_yonetici_ekler" on storage.objects
    for insert to authenticated with check (bucket_id = 'site' and (select public.panel_rolu()) = 'yonetici');
create policy "site_gorselleri_yonetici_gunceller" on storage.objects
    for update to authenticated
    using (bucket_id = 'site' and (select public.panel_rolu()) = 'yonetici')
    with check (bucket_id = 'site' and (select public.panel_rolu()) = 'yonetici');
create policy "site_gorselleri_yonetici_siler" on storage.objects
    for delete to authenticated using (bucket_id = 'site' and (select public.panel_rolu()) = 'yonetici');

-- ─────────────────────────────────────────────────────────────
-- Trigger'lar: kullanıcının doğrudan yazamadığı tabloları güncelledikleri için security definer
-- (teknisyenin stok hareketi ürünün adedini, kasanın satışı stok hareketini değiştirir).
-- ─────────────────────────────────────────────────────────────
alter function public.stok_hareketi_uygula() security definer;
alter function public.kasa_stoka_yansit()    security definer;
revoke execute on function public.stok_hareketi_uygula() from public, anon, authenticated;
revoke execute on function public.kasa_stoka_yansit()    from public, anon, authenticated;

-- Kapanmış günü yalnızca yönetici yeniden açabilir (tabloya doğrudan yazılsa bile).
create or replace function public.kasa_gunu_koru()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if old.kapandi and not new.kapandi and public.panel_rolu() is distinct from 'yonetici' then
        raise exception 'Kapatılmış günü yalnızca yönetici yeniden açabilir.';
    end if;
    return new;
end;
$$;

create trigger kasa_gunleri_koru
    before update on public.kasa_gunleri
    for each row execute function public.kasa_gunu_koru();
