-- İki adımlı doğrulama (TOTP) tüm panel kullanıcıları için zorunludur.
-- Giriş yapmış (authenticated) kullanıcı, yalnızca şifreyle girdiğinde (aal1) hiçbir panel verisine erişemez;
-- doğrulama uygulamasını kurup kodu girdiğinde (aal2) erişir. Vitrin (anon) ve gizli anahtarlı sunucu işleri etkilenmez.
-- proxy.ts kullanıcıyı /admin/dogrula sayfasına yönlendirir; bu politikalar doğrudan API çağrılarını da engeller.

create or replace function public.mfa_tamam()
returns boolean
language sql
stable
set search_path = ''
as $$
    select coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2';
$$;

revoke all on function public.mfa_tamam() from public, anon;
grant execute on function public.mfa_tamam() to authenticated;

-- Tüm public tablolarına kısıtlayıcı (restrictive) politika: mevcut izin politikalarına ek olarak aranır.
-- Yeni tablo eklendiğinde aynı politika o tabloya da eklenmeli.
do $$
declare
    t record;
begin
    for t in select tablename from pg_tables where schemaname = 'public' loop
        execute format('drop policy if exists mfa_zorunlu on public.%I', t.tablename);
        execute format(
            'create policy mfa_zorunlu on public.%I as restrictive for all to authenticated '
            'using ((select public.mfa_tamam())) with check ((select public.mfa_tamam()))',
            t.tablename
        );
    end loop;
end $$;

-- Panelden yüklenen görseller (Storage).
drop policy if exists mfa_zorunlu on storage.objects;
create policy mfa_zorunlu on storage.objects as restrictive for all to authenticated
    using ((select public.mfa_tamam())) with check ((select public.mfa_tamam()));

-- RLS'i atlayan (security definer) ve oturumdaki personele bakan fonksiyonlar.
create or replace function public.panel_rolu()
returns text
language sql
stable
security definer
set search_path = ''
as $$
    select rol from public.personel where auth_user_id = auth.uid() and aktif and public.mfa_tamam();
$$;

create or replace function public.sohbet_cevrimici_bildir()
returns void
language sql
security definer
set search_path = ''
as $$
    insert into public.sohbet_cevrimici (personel_id, son_gorulme)
    select id, now() from public.personel where auth_user_id = auth.uid() and aktif and public.mfa_tamam()
    on conflict (personel_id) do update set son_gorulme = excluded.son_gorulme;
$$;
