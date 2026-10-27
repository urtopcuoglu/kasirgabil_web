-- Ürünlerin web sitesinde yayınlanması
-- Stoktaki ürün "Siteye ekle" ile vitrindeki ürünler sayfasına çıkar. Sitede fiyat gösterilmez;
-- ziyaretçi WhatsApp veya canlı destekten iletişime geçer. Stok durumu stok adedinden gelir,
-- panelden "sitede stoğu kapat" ile adet ne olursa olsun tükendi gösterilebilir.

alter table public.urunler
    add column sitede            boolean not null default false,
    add column site_ad           text,
    add column site_aciklama     text,
    add column site_kategori_id  uuid references public.urun_kategorileri (id) on delete restrict,
    add column site_gorseller    text[] not null default '{}',
    add column site_slug         text,
    add column site_stok_kapali  boolean not null default false,
    add column site_stokta       boolean generated always as (stok_adedi > 0 and not site_stok_kapali) stored,
    -- Yayındaki ürünün vitrin bilgileri eksiksiz olmalı.
    add constraint urunler_site_bilgileri check (
        not sitede or (
            length(trim(coalesce(site_ad, ''))) > 0
            and length(trim(coalesce(site_aciklama, ''))) > 0
            and site_kategori_id is not null
            and cardinality(site_gorseller) between 1 and 6
            and site_slug is not null
        )
    );

create unique index urunler_site_slug_tekil on public.urunler (site_slug) where site_slug is not null;
create index urunler_site_kategori_idx on public.urunler (site_kategori_id);
create index urunler_sitede_idx on public.urunler (created_at desc) where sitede;

-- ─────────────────────────────────────────────────────────────
-- Vitrin (anon) erişimi: yalnızca yayındaki ürünler ve yalnızca vitrin sütunları.
-- Alış fiyatı, tedarikçi, seri no gibi alanlar anonim istemciye hiç açılmaz (sütun yetkisi).
-- ─────────────────────────────────────────────────────────────
revoke all on public.urunler from anon;
grant select (id, stok_kodu, marka, model, durum, sitede, site_ad, site_aciklama, site_kategori_id,
              site_gorseller, site_slug, site_stokta, created_at)
    on public.urunler to anon;

create policy "sitedekiler_herkese_acik" on public.urunler
    for select to anon using (sitede);

-- Kategori adları vitrinde filtre ve sayfa yolu için okunur.
revoke all on public.urun_kategorileri from anon;
grant select (id, ad, ust_id) on public.urun_kategorileri to anon;

create policy "herkese_acik_okunur" on public.urun_kategorileri
    for select to anon using (true);
