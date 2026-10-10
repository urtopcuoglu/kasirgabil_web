// src/lib/icerik.ts
// Vitrinin site içeriği ve blog okumaları (anonim istemci; RLS yalnızca yayındaki yazıları döndürür).
import { cache } from "react";
import { anonIstemci } from "@/lib/supabase/anon";
import type { BlogKategori, BlogYazisi, SiteIcerikAnahtari, SiteIcerikleri } from "@/lib/schemas/icerik";

export const siteIcerigi = cache(async <K extends SiteIcerikAnahtari>(anahtar: K): Promise<SiteIcerikleri[K] | null> => {
    const { data, error } = await anonIstemci().from("site_icerikleri").select("deger").eq("anahtar", anahtar).maybeSingle();
    if (error) console.error("[siteIcerigi]", anahtar, error.message);
    return (data?.deger as SiteIcerikleri[K] | undefined) ?? null;
});

export type BlogKarti = Pick<BlogYazisi, "id" | "baslik" | "slug" | "ozet" | "kapak_gorsel_url" | "yayin_tarihi"> & {
    blog_kategorileri: Pick<BlogKategori, "ad" | "slug"> | null;
};

export async function blogYazilari({ kategoriSlug, sayfa = 1, adet = 12 }: { kategoriSlug?: string; sayfa?: number; adet?: number }) {
    // Kategori filtresinde inner join: kategorisi eşleşmeyen yazılar sonuçtan düşer.
    const kategoriBirlesimi = kategoriSlug ? "blog_kategorileri!inner(ad, slug)" : "blog_kategorileri(ad, slug)";
    let sorgu = anonIstemci()
        .from("blog_yazilari")
        .select(`id, baslik, slug, ozet, kapak_gorsel_url, yayin_tarihi, ${kategoriBirlesimi}`, { count: "exact" })
        .order("yayin_tarihi", { ascending: false })
        .range((sayfa - 1) * adet, sayfa * adet - 1);
    if (kategoriSlug) sorgu = sorgu.eq("blog_kategorileri.slug", kategoriSlug);

    const { data, count, error } = await sorgu;
    if (error) console.error("[blogYazilari]", error.message);
    return { yazilar: (data ?? []) as unknown as BlogKarti[], toplam: count ?? 0 };
}

export const blogYazisi = cache(async (slug: string) => {
    const { data } = await anonIstemci()
        .from("blog_yazilari")
        .select("*, blog_kategorileri(ad, slug)")
        .eq("slug", slug)
        .maybeSingle();
    return data as (BlogYazisi & { blog_kategorileri: Pick<BlogKategori, "ad" | "slug"> | null }) | null;
});

export async function blogKategorileri() {
    const { data } = await anonIstemci().from("blog_kategorileri").select("id, ad, slug").order("ad");
    return (data ?? []) as BlogKategori[];
}
