-- Canlı sohbet zaman aşımı: personel yazdıktan sonra ziyaretçi yanıt vermezse
--   3 dakikada uyarı mesajı, 5 dakikada kapanış mesajıyla sohbet kapatılır.
-- Ziyaretçi yazarsa ya da personel yeni mesaj gönderirse süre baştan başlar.
-- Uyarı ve kapanış "sistem" mesajı olarak sohbete düşer; pg_cron her dakika kontrol eder.

alter table public.sohbet_mesajlari drop constraint sohbet_mesajlari_gonderen_check;
alter table public.sohbet_mesajlari add constraint sohbet_mesajlari_gonderen_check check (gonderen in ('ziyaretci', 'personel', 'sistem'));

alter table public.sohbetler
    add column son_personel_mesaj_at timestamptz,
    add column zaman_asimi_uyari_at  timestamptz; -- bu bekleme için uyarı gönderildiyse dolu (son_personel_mesaj_at'ten sonra)

-- Mevcut sohbetler için son personel mesajı zamanı.
update public.sohbetler s
   set son_personel_mesaj_at = (select max(created_at) from public.sohbet_mesajlari m where m.sohbet_id = s.id and m.gonderen = 'personel');

-- Personel mesajında personel_id oturumdan alınır; ziyaretçi ve sistem mesajında boştur.
create or replace function public.sohbet_mesaji_hazirla()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.metin := trim(new.metin);
    if new.gonderen = 'personel' then
        new.personel_id := (select id from public.personel where auth_user_id = auth.uid() and aktif);
        if (select durum from public.sohbetler where id = new.sohbet_id) = 'kapali' then
            raise exception 'Bu sohbet kapatılmış.';
        end if;
    else
        new.personel_id := null;
    end if;
    return new;
end;
$$;

create or replace function public.sohbet_mesaji_eklendi()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.sohbetler
       set son_mesaj_at = new.created_at,
           son_ziyaretci_mesaj_at = case when new.gonderen = 'ziyaretci' then new.created_at else son_ziyaretci_mesaj_at end,
           son_personel_mesaj_at = case when new.gonderen = 'personel' then new.created_at else son_personel_mesaj_at end,
           -- Personel yanıt verdiyse sohbeti okumuş demektir.
           personel_okudu_at = case when new.gonderen = 'personel' then new.created_at else personel_okudu_at end
     where id = new.sohbet_id;

    perform realtime.send(jsonb_build_object('gonderen', new.gonderen), 'mesaj', 'sohbet-' || new.sohbet_id, false);
    perform realtime.send(jsonb_build_object('sohbet_id', new.sohbet_id, 'gonderen', new.gonderen), 'mesaj', 'sohbet-panel', true);
    return null;
end;
$$;

-- Her dakika çalışır. Ziyaretçiden yanıt bekleyen açık sohbetler: son personel mesajı, son ziyaretçi mesajından yeni.
create or replace function public.sohbet_zaman_asimi()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_sohbet record;
begin
    -- 5 dakika: uyarısı gönderilmiş sohbetleri kapat.
    for v_sohbet in
        select id from public.sohbetler
         where durum = 'acik'
           and son_personel_mesaj_at > coalesce(son_ziyaretci_mesaj_at, '-infinity')
           and son_personel_mesaj_at < now() - interval '5 minutes'
           and zaman_asimi_uyari_at > son_personel_mesaj_at
    loop
        insert into public.sohbet_mesajlari (sohbet_id, gonderen, metin)
        values (v_sohbet.id, 'sistem', 'Uzun süre yanıt alamadığımız için sohbet sonlandırıldı. Dilediğiniz zaman yeni bir sohbet başlatabilirsiniz.');
        update public.sohbetler set durum = 'kapali' where id = v_sohbet.id;
    end loop;

    -- 3 dakika: uyarı.
    for v_sohbet in
        select id from public.sohbetler
         where durum = 'acik'
           and son_personel_mesaj_at > coalesce(son_ziyaretci_mesaj_at, '-infinity')
           and son_personel_mesaj_at < now() - interval '3 minutes'
           and (zaman_asimi_uyari_at is null or zaman_asimi_uyari_at < son_personel_mesaj_at)
    loop
        insert into public.sohbet_mesajlari (sohbet_id, gonderen, metin)
        values (v_sohbet.id, 'sistem', 'Hâlâ orada mısınız? 2 dakika içinde yanıt vermezseniz sohbet otomatik olarak sonlandırılacak.');
        update public.sohbetler set zaman_asimi_uyari_at = now() where id = v_sohbet.id;
    end loop;
end;
$$;

revoke execute on function public.sohbet_zaman_asimi() from public, anon, authenticated;

create extension if not exists pg_cron;

select cron.schedule('sohbet-zaman-asimi', '* * * * *', 'select public.sohbet_zaman_asimi()');
