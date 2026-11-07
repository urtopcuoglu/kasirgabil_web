// src/app/sitemap.ts
// Site haritası: sabit sayfalar + sitede yayındaki ürünler + yayındaki blog yazıları.
// Anonim istemci kullanılır; RLS yalnızca herkese açık kayıtları döndürür. Saatte bir yenilenir.
import type { MetadataRoute } from "next";
import { anonIstemci } from "@/lib/supabase/anon";
import { mutlakAdres } from "@/lib/site-adresi";

export const revalidate = 3600;

const SABIT_SAYFALAR: { yol: string; oncelik: number; siklik: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { yol: "/", oncelik: 1, siklik: "daily" },
    { yol: "/urunler", oncelik: 0.9, siklik: "daily" },
    { yol: "/services", oncelik: 0.8, siklik: "monthly" },
    { yol: "/services/teknik-servis", oncelik: 0.8, siklik: "monthly" },
    { yol: "/services/tamir-ve-bakim", oncelik: 0.7, siklik: "monthly" },
    { yol: "/services/web-tasarim-cozumleri", oncelik: 0.6, siklik: "monthly" },
    { yol: "/services/kurumsal-destek", oncelik: 0.6, siklik: "monthly" },
    { yol: "/services/sifir-ve-ikinci-el-alisveris", oncelik: 0.6, siklik: "monthly" },
    { yol: "/blog", oncelik: 0.7, siklik: "weekly" },
    { yol: "/public/about", oncelik: 0.5, siklik: "yearly" },
    { yol: "/public/contact", oncelik: 0.6, siklik: "yearly" },
    { yol: "/kvkk", oncelik: 0.2, siklik: "yearly" },
    { yol: "/gizlilik-politikasi", oncelik: 0.2, siklik: "yearly" },
    { yol: "/iade-ve-degisim-politikasi", oncelik: 0.2, siklik: "yearly" },
    { yol: "/mesafeli-satis-sozlesmesi", oncelik: 0.2, siklik: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const istemci = anonIstemci();
    const [urunler, yazilar] = await Promise.all([
        istemci.from("urunler").select("site_slug, site_gorseller, created_at").eq("sitede", true).order("created_at", { ascending: false }).limit(5000),
        istemci.from("blog_yazilari").select("slug, yayin_tarihi, updated_at, kapak_gorsel_url").order("yayin_tarihi", { ascending: false }).limit(5000),
    ]);
    if (urunler.error) console.error("[sitemap] ürünler", urunler.error.message);
    if (yazilar.error) console.error("[sitemap] blog", yazilar.error.message);

    return [
        ...SABIT_SAYFALAR.map((s) => ({ url: mutlakAdres(s.yol), changeFrequency: s.siklik, priority: s.oncelik })),
        ...((urunler.data ?? []) as { site_slug: string; site_gorseller: string[]; created_at: string }[]).map((u) => ({
            url: mutlakAdres(`/urun/${u.site_slug}`),
            lastModified: u.created_at,
            changeFrequency: "weekly" as const,
            priority: 0.8,
            images: u.site_gorseller.slice(0, 1),
        })),
        ...((yazilar.data ?? []) as { slug: string; yayin_tarihi: string | null; updated_at: string; kapak_gorsel_url: string | null }[]).map((y) => ({
            url: mutlakAdres(`/blog/${y.slug}`),
            lastModified: y.updated_at ?? y.yayin_tarihi ?? undefined,
            changeFrequency: "monthly" as const,
            priority: 0.6,
            images: y.kapak_gorsel_url ? [y.kapak_gorsel_url] : undefined,
        })),
    ];
}
