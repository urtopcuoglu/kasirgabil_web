// src/lib/site-urunleri.ts
// Vitrindeki ürünler sayfasının okumaları (anonim istemci; RLS yalnızca sitede yayındaki ürünleri,
// sütun yetkisi yalnızca vitrin alanlarını döndürür — migration 20261027120000_urun_site_yayini.sql).
import { cache } from "react";
import { revalidatePath } from "next/cache";
import { anonIstemci } from "@/lib/supabase/anon";
import { kategoriAgaci, type Urun, type UrunKategori } from "@/lib/schemas/stok";

export type SiteUrunu = Pick<
    Urun,
    "id" | "stok_kodu" | "marka" | "model" | "durum" | "site_ad" | "site_aciklama" | "site_kategori_id" | "site_gorseller" | "site_slug" | "site_stokta" | "created_at"
> & { site_ad: string; site_slug: string };

const SUTUNLAR = "id, stok_kodu, marka, model, durum, site_ad, site_aciklama, site_kategori_id, site_gorseller, site_slug, site_stokta, created_at";

export const SITE_SIRALAMALARI = {
    yeni: { etiket: "En yeni", sutun: "created_at", artan: false },
    eski: { etiket: "En eski", sutun: "created_at", artan: true },
    ad_artan: { etiket: "İsim (A → Z)", sutun: "site_ad", artan: true },
    ad_azalan: { etiket: "İsim (Z → A)", sutun: "site_ad", artan: false },
} as const;
export type SiteSiralamasi = keyof typeof SITE_SIRALAMALARI;

export type SiteUrunFiltresi = { marka?: string; model?: string; kategori?: string; sirala: SiteSiralamasi; sayfa: number; adet: number };

// Panelde ürün, stok veya görsel değişince vitrin sayfaları yenilenir.
export function vitrinUrunleriniYenile() {
    revalidatePath("/urunler");
    revalidatePath("/urun/[slug]", "page");
}

// Depodaki herkese açık adresten dosya yolunu çıkarır (silme için). Depoya ait değilse null.
export function depoYolu(adres: string) {
    const isaret = "/storage/v1/object/public/site/";
    const i = adres.indexOf(isaret);
    return i === -1 ? null : decodeURIComponent(adres.slice(i + isaret.length));
}

// Kategori ağacı (anon yalnızca ad ve üst kategoriyi okur; kutu sistemi vitrinde kullanılmaz).
export const siteKategoriAgaci = cache(async () => {
    const { data, error } = await anonIstemci().from("urun_kategorileri").select("id, ad, ust_id");
    if (error) console.error("[siteKategoriAgaci]", error.message);
    return kategoriAgaci(((data ?? []) as Omit<UrunKategori, "kutu_sistemi">[]).map((k) => ({ ...k, kutu_sistemi: false })));
});

// Filtre seçenekleri yalnızca yayındaki ürünlerden üretilir: markalar, seçili markanın modelleri ve
// ürünü olan kategoriler (üst kategorileriyle birlikte; üst kategori seçilince alt dallar da listelenir).
export async function siteFiltreSecenekleri(secilenMarka?: string) {
    const [{ data, error }, agac] = await Promise.all([
        anonIstemci().from("urunler").select("marka, model, site_kategori_id").eq("sitede", true),
        siteKategoriAgaci(),
    ]);
    if (error) console.error("[siteFiltreSecenekleri]", error.message);
    const satirlar = (data ?? []) as Pick<Urun, "marka" | "model" | "site_kategori_id">[];

    const benzersiz = (liste: (string | null)[]) =>
        [...new Set(liste.map((v) => v?.trim()).filter((v): v is string => !!v))].toSorted((a, b) => a.localeCompare(b, "tr"));

    const kullanilan = new Set(satirlar.map((s) => s.site_kategori_id).filter((v): v is string => !!v));
    const kategoriler = agac.sirali.filter((k) => agac.altlariyla(k.id).some((id) => kullanilan.has(id)));

    return {
        markalar: benzersiz(satirlar.map((s) => s.marka)),
        modeller: benzersiz(satirlar.filter((s) => !secilenMarka || s.marka?.trim() === secilenMarka).map((s) => s.model)),
        kategoriler,
        agac,
    };
}

export async function siteUrunleri({ marka, model, kategori, sirala, sayfa, adet }: SiteUrunFiltresi) {
    const { sutun, artan } = SITE_SIRALAMALARI[sirala];
    let sorgu = anonIstemci()
        .from("urunler")
        .select(SUTUNLAR, { count: "exact" })
        .eq("sitede", true)
        .order(sutun, { ascending: artan })
        .order("id")
        .range((sayfa - 1) * adet, sayfa * adet - 1);

    if (marka) sorgu = sorgu.eq("marka", marka);
    if (model) sorgu = sorgu.eq("model", model);
    if (kategori) sorgu = sorgu.in("site_kategori_id", (await siteKategoriAgaci()).altlariyla(kategori));

    const { data, count, error } = await sorgu;
    if (error) console.error("[siteUrunleri]", error.message);
    return { urunler: (data ?? []) as SiteUrunu[], toplam: count ?? 0 };
}

export const siteUrunu = cache(async (slug: string) => {
    const { data, error } = await anonIstemci().from("urunler").select(SUTUNLAR).eq("site_slug", slug).eq("sitede", true).maybeSingle();
    if (error) console.error("[siteUrunu]", error.message);
    return data as SiteUrunu | null;
});

// Detay sayfasının altındaki "benzer ürünler": aynı kategoriden yayındaki diğer ürünler.
export async function benzerUrunler(urun: SiteUrunu, adet = 4) {
    if (!urun.site_kategori_id) return [];
    const { data } = await anonIstemci()
        .from("urunler")
        .select(SUTUNLAR)
        .eq("sitede", true)
        .eq("site_kategori_id", urun.site_kategori_id)
        .neq("id", urun.id)
        .order("created_at", { ascending: false })
        .limit(adet);
    return (data ?? []) as SiteUrunu[];
}
