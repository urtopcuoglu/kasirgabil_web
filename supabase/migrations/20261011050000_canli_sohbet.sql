-- Canlı sohbet: vitrindeki sohbet penceresi ile paneldeki Sohbetler sayfası.
--
-- Ziyaretçi oturum açmaz. Sohbet başlatınca bir erişim anahtarı alır (tarayıcıda saklanır) ve tüm
-- okuma/yazma işlemlerini bu anahtarla security definer fonksiyonlar üzerinden yapar; tablolara doğrudan erişemez.
--
-- Anlık bildirim (Realtime Broadcast), her yeni mesajda trigger ile gönderilir. Mesaj içeriği yayınlanmaz, yalnızca "yeni mesaj var" sinyali:
--   'sohbet-<id>'  herkese açık kanal → ziyaretçi sinyali alınca mesajları anahtarıyla çeker
--   'sohbet-panel' özel kanal (RLS)   → panel listeyi ve okunmamış sayısını yeniler
--
-- Panelde sohbetleri tüm roller görür ve yanıtlar (src/lib/izinler.ts: sohbet), silme yalnızca yönetici.
-- Telegram bildirimi eklenecekse sohbet_mesaji_eklendi() trigger'ı uygun yerdir.

create table public.sohbetler (
    id                      uuid primary key default gen_random_uuid(),
    anahtar                 uuid not null unique default gen_random_uuid(), -- ziyaretçinin erişim anahtarı
    ad                      text not null check (length(trim(ad)) between 2 and 60),
    telefon                 text check (length(telefon) <= 25),
    eposta                  text check (length(eposta) <= 120 and eposta like '%_@_%'),
    sayfa                   text check (length(sayfa) <= 200), -- sohbetin başlatıldığı sayfa
    durum                   text not null default 'acik' check (durum in ('acik', 'kapali')),
    son_mesaj_at            timestamptz not null default now(),
    son_ziyaretci_mesaj_at  timestamptz,
    personel_okudu_at       timestamptz,
    okunmamis               boolean generated always as (son_ziyaretci_mesaj_at > coalesce(personel_okudu_at, '-infinity')) stored,
    kapanma_at              timestamptz,
    arama                   text generated always as (
                                ad || ' ' || coalesce(eposta, '') || ' ' || coalesce(regexp_replace(telefon, '[^0-9]', '', 'g'), '')
                            ) stored,
    created_at              timestamptz not null default now(),
    constraint sohbetler_iletisim_bilgisi check (telefon is not null or eposta is not null)
);

create index sohbetler_son_mesaj_idx on public.sohbetler (son_mesaj_at desc);
create index sohbetler_okunmamis_idx on public.sohbetler (son_mesaj_at desc) where okunmamis and durum = 'acik';

create table public.sohbet_mesajlari (
    id          uuid primary key default gen_random_uuid(),
    sohbet_id   uuid not null references public.sohbetler (id) on delete cascade,
    gonderen    text not null check (gonderen in ('ziyaretci', 'personel')),
    personel_id uuid references public.personel (id) on delete set null,
    metin       text not null check (length(trim(metin)) between 1 and 2000),
    created_at  timestamptz not null default now()
);

create index sohbet_mesajlari_sohbet_idx   on public.sohbet_mesajlari (sohbet_id, created_at);
create index sohbet_mesajlari_personel_idx on public.sohbet_mesajlari (personel_id);

-- Panelde son görülme: paneli açık olan (sohbet izinli) personel "çevrimiçi" sayılır (panel her dakika bildirir).
create table public.sohbet_cevrimici (
    personel_id  uuid primary key references public.personel (id) on delete cascade,
    son_gorulme  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Trigger'lar
-- ─────────────────────────────────────────────────────────────

-- Personel mesajında personel_id oturumdan alınır (istemciden gelen değere güvenilmez).
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

create trigger sohbet_mesajlari_hazirla
    before insert on public.sohbet_mesajlari
    for each row execute function public.sohbet_mesaji_hazirla();

-- Sohbetin son mesaj zamanlarını günceller ve Realtime sinyallerini gönderir.
-- security definer: ziyaretçi ve personel güncellemesi RLS'e takılmasın, realtime.send çağrılabilsin.
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
           -- Personel yanıt verdiyse sohbeti okumuş demektir.
           personel_okudu_at = case when new.gonderen = 'personel' then new.created_at else personel_okudu_at end
     where id = new.sohbet_id;

    perform realtime.send(jsonb_build_object('gonderen', new.gonderen), 'mesaj', 'sohbet-' || new.sohbet_id, false);
    perform realtime.send(jsonb_build_object('sohbet_id', new.sohbet_id, 'gonderen', new.gonderen), 'mesaj', 'sohbet-panel', true);
    return null;
end;
$$;

create trigger sohbet_mesajlari_eklendi
    after insert on public.sohbet_mesajlari
    for each row execute function public.sohbet_mesaji_eklendi();

-- Kapatılınca tarih tutulur; ziyaretçiye ve panele sinyal gider.
create or replace function public.sohbet_durum_degisti()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if new.durum is distinct from old.durum then
        new.kapanma_at := case when new.durum = 'kapali' then now() end;
        perform realtime.send(jsonb_build_object('durum', new.durum), 'durum', 'sohbet-' || new.id, false);
        perform realtime.send(jsonb_build_object('sohbet_id', new.id), 'durum', 'sohbet-panel', true);
    end if;
    return new;
end;
$$;

create trigger sohbetler_durum
    before update of durum on public.sohbetler
    for each row execute function public.sohbet_durum_degisti();

-- Trigger fonksiyonları API'den çağrılamasın.
revoke execute on function public.sohbet_mesaji_hazirla() from public, anon, authenticated;
revoke execute on function public.sohbet_mesaji_eklendi() from public, anon, authenticated;
revoke execute on function public.sohbet_durum_degisti() from public, anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- Ziyaretçi fonksiyonları (anon)
-- ─────────────────────────────────────────────────────────────

-- Personel çevrimiçi mi? (son 2 dakikada panelde sohbet izni olan biri bildirim göndermiş mi)
create or replace function public.sohbet_cevrimici_mi()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (select 1 from public.sohbet_cevrimici where son_gorulme > now() - interval '2 minutes');
$$;

-- Yeni sohbet. Hız sınırı: aynı telefon/e-postadan 1 saatte en fazla 3, tüm siteden 10 dakikada en fazla 20 sohbet.
create or replace function public.sohbet_baslat(p_ad text, p_telefon text, p_eposta text, p_mesaj text, p_sayfa text)
returns table (id uuid, anahtar uuid)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
    v_telefon text := nullif(trim(p_telefon), '');
    v_eposta  text := lower(nullif(trim(p_eposta), ''));
    v_sohbet  public.sohbetler;
begin
    if (select count(*) from public.sohbetler s
         where s.created_at > now() - interval '1 hour'
           and (s.eposta = v_eposta or regexp_replace(s.telefon, '[^0-9]', '', 'g') = regexp_replace(v_telefon, '[^0-9]', '', 'g'))) >= 3
       or (select count(*) from public.sohbetler s where s.created_at > now() - interval '10 minutes') >= 20 then
        raise exception 'Çok fazla sohbet başlatıldı. Lütfen bir süre sonra tekrar deneyin.';
    end if;

    insert into public.sohbetler (ad, telefon, eposta, sayfa)
    values (trim(p_ad), v_telefon, v_eposta, left(nullif(trim(p_sayfa), ''), 200))
    returning * into v_sohbet;

    insert into public.sohbet_mesajlari (sohbet_id, gonderen, metin) values (v_sohbet.id, 'ziyaretci', p_mesaj);

    return query select v_sohbet.id, v_sohbet.anahtar;
end;
$$;

-- Ziyaretçi mesajı. Hız sınırı: aynı sohbette 1 dakikada en fazla 15 mesaj.
create or replace function public.sohbet_mesaj_gonder(p_anahtar uuid, p_metin text)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
    v_sohbet public.sohbetler;
begin
    select * into v_sohbet from public.sohbetler where anahtar = p_anahtar;
    if v_sohbet.id is null then
        raise exception 'Sohbet bulunamadı.';
    end if;
    if v_sohbet.durum = 'kapali' then
        raise exception 'Bu sohbet sonlandırıldı. Yeni bir sohbet başlatabilirsiniz.';
    end if;
    if (select count(*) from public.sohbet_mesajlari
         where sohbet_id = v_sohbet.id and gonderen = 'ziyaretci' and created_at > now() - interval '1 minute') >= 15 then
        raise exception 'Çok hızlı mesaj gönderiyorsunuz. Lütfen biraz bekleyin.';
    end if;

    insert into public.sohbet_mesajlari (sohbet_id, gonderen, metin) values (v_sohbet.id, 'ziyaretci', p_metin);
end;
$$;

-- Ziyaretçinin sohbeti: durum ve mesajlar (personelin yalnızca adı görünür).
create or replace function public.sohbet_getir(p_anahtar uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
    select jsonb_build_object(
        'id', s.id,
        'durum', s.durum,
        'mesajlar', coalesce((
            select jsonb_agg(jsonb_build_object(
                       'id', m.id,
                       'gonderen', m.gonderen,
                       'personel', split_part(p.ad_soyad, ' ', 1),
                       'metin', m.metin,
                       'created_at', m.created_at
                   ) order by m.created_at)
              from public.sohbet_mesajlari m
              left join public.personel p on p.id = m.personel_id
             where m.sohbet_id = s.id
        ), '[]'::jsonb)
    )
    from public.sohbetler s
    where s.anahtar = p_anahtar;
$$;

revoke execute on function public.sohbet_cevrimici_mi() from public;
revoke execute on function public.sohbet_baslat(text, text, text, text, text) from public;
revoke execute on function public.sohbet_mesaj_gonder(uuid, text) from public;
revoke execute on function public.sohbet_getir(uuid) from public;
grant  execute on function public.sohbet_cevrimici_mi() to anon, authenticated;
grant  execute on function public.sohbet_baslat(text, text, text, text, text) to anon, authenticated;
grant  execute on function public.sohbet_mesaj_gonder(uuid, text) to anon, authenticated;
grant  execute on function public.sohbet_getir(uuid) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- Panel: çevrimiçi bildirimi
-- ─────────────────────────────────────────────────────────────
create or replace function public.sohbet_cevrimici_bildir()
returns void
language sql
volatile
security definer
set search_path = ''
as $$
    insert into public.sohbet_cevrimici (personel_id, son_gorulme)
    select id, now() from public.personel where auth_user_id = auth.uid() and aktif
    on conflict (personel_id) do update set son_gorulme = excluded.son_gorulme;
$$;

revoke execute on function public.sohbet_cevrimici_bildir() from public, anon;
grant  execute on function public.sohbet_cevrimici_bildir() to authenticated;

-- ─────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────
alter table public.sohbetler        enable row level security;
alter table public.sohbet_mesajlari enable row level security;
alter table public.sohbet_cevrimici enable row level security; -- politika yok: yalnızca fonksiyonlar erişir

create policy "rol_okur" on public.sohbetler
    for select to authenticated using ((select public.panel_rolu()) = any ('{yonetici,teknisyen,kasa}'::text[]));
create policy "rol_gunceller" on public.sohbetler
    for update to authenticated
    using ((select public.panel_rolu()) = any ('{yonetici,teknisyen,kasa}'::text[]))
    with check ((select public.panel_rolu()) = any ('{yonetici,teknisyen,kasa}'::text[]));
create policy "yonetici_siler" on public.sohbetler
    for delete to authenticated using ((select public.panel_rolu()) = 'yonetici');

create policy "rol_okur" on public.sohbet_mesajlari
    for select to authenticated using ((select public.panel_rolu()) = any ('{yonetici,teknisyen,kasa}'::text[]));
create policy "rol_ekler" on public.sohbet_mesajlari
    for insert to authenticated
    with check (gonderen = 'personel' and (select public.panel_rolu()) = any ('{yonetici,teknisyen,kasa}'::text[]));

-- Panelin dinlediği özel Realtime kanalı.
create policy "sohbet_panel_dinler" on realtime.messages
    for select to authenticated
    using (
        realtime.topic() = 'sohbet-panel'
        and realtime.messages.extension = 'broadcast'
        and (select public.panel_rolu()) = any ('{yonetici,teknisyen,kasa}'::text[])
    );
