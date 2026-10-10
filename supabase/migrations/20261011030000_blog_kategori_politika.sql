-- blog_kategorileri: okuma "herkes_okur" ile zaten açık; yönetici politikası yalnızca yazma işlemlerini kapsasın
-- (aynı işlem için iki permissive politika performans uyarısı veriyordu).
drop policy "yonetici_yazar" on public.blog_kategorileri;

create policy "yonetici_ekler" on public.blog_kategorileri
    for insert to authenticated with check ((select public.panel_rolu()) = 'yonetici');
create policy "yonetici_gunceller" on public.blog_kategorileri
    for update to authenticated
    using ((select public.panel_rolu()) = 'yonetici') with check ((select public.panel_rolu()) = 'yonetici');
create policy "yonetici_siler" on public.blog_kategorileri
    for delete to authenticated using ((select public.panel_rolu()) = 'yonetici');
