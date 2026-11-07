// src/app/(site)/urun/[slug]/page.tsx
// Ürün detay sayfası: galeri, açıklama, stok durumu ve iletişim butonları (fiyat gösterilmez).
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { siteIcerigi } from "@/lib/icerik";
import { benzerUrunler, siteKategoriAgaci, siteUrunu } from "@/lib/site-urunleri";
import { URUN_DURUMLARI } from "@/lib/schemas/stok";
import UrunGaleri from "@/app/component_page/UrunGaleri";
import UrunIletisimButonlari from "@/app/component_page/UrunIletisimButonlari";
import UrunKarti, { StokRozeti } from "@/app/component_page/UrunKarti";
import { cn } from "@/lib/utils";
import { jsonLd, mutlakAdres } from "@/lib/site-adresi";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const urun = await siteUrunu((await params).slug);
    if (!urun) return { title: "Ürün bulunamadı | Kasırga Bilgisayar" };
    return {
        title: `${urun.site_ad} | Kasırga Bilgisayar`,
        description: urun.site_aciklama?.replace(/\s+/g, " ").slice(0, 160),
        alternates: { canonical: `/urun/${urun.site_slug}` },
        openGraph: { images: urun.site_gorseller.slice(0, 1) },
    };
}

export default async function UrunDetaySayfasi({ params }: Props) {
    const urun = await siteUrunu((await params).slug);
    if (!urun) notFound();

    const [agac, iletisim, benzerler] = await Promise.all([siteKategoriAgaci(), siteIcerigi("iletisim"), benzerUrunler(urun)]);
    const kategoriYolu = urun.site_kategori_id ? agac.yol(urun.site_kategori_id).split(" › ") : [];
    const kategoriAdi = kategoriYolu.at(-1);
    const durum = URUN_DURUMLARI[urun.durum];

    const ozellikler = [
        { etiket: "Marka", deger: urun.marka },
        { etiket: "Model", deger: urun.model },
        { etiket: "Durum", deger: durum.etiket },
        { etiket: "Kategori", deger: kategoriYolu.join(" › ") },
        { etiket: "Ürün Kodu", deger: urun.stok_kodu },
    ].filter((o) => o.deger);

    // Arama motorları için yapısal veri (fiyat gösterilmediği için Offer eklenmez).
    const yapisalVeri = [
        {
            "@context": "https://schema.org",
            "@type": "Product",
            name: urun.site_ad,
            description: urun.site_aciklama ?? undefined,
            image: urun.site_gorseller,
            sku: urun.stok_kodu,
            url: mutlakAdres(`/urun/${urun.site_slug}`),
            brand: urun.marka ? { "@type": "Brand", name: urun.marka } : undefined,
            model: urun.model ?? undefined,
            category: kategoriYolu.join(" > ") || undefined,
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
                { name: "Anasayfa", item: mutlakAdres("/") },
                { name: "Ürünler", item: mutlakAdres("/urunler") },
                ...(urun.site_kategori_id && kategoriAdi ? [{ name: kategoriAdi, item: mutlakAdres(`/urunler?kategori=${urun.site_kategori_id}`) }] : []),
                { name: urun.site_ad, item: mutlakAdres(`/urun/${urun.site_slug}`) },
            ].map((o, i) => ({ "@type": "ListItem", position: i + 1, ...o })),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-800">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(yapisalVeri) }} />
            <div className="container mx-auto max-w-7xl px-4 py-8">
                <nav aria-label="Sayfa yolu" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-gray-500 dark:text-zinc-400">
                    <Link href="/" className="hover:text-[var(--color-primary)]">
                        Anasayfa
                    </Link>
                    <ChevronRight size={14} />
                    <Link href="/urunler" className="hover:text-[var(--color-primary)]">
                        Ürünler
                    </Link>
                    {urun.site_kategori_id && kategoriAdi && (
                        <>
                            <ChevronRight size={14} />
                            <Link href={`/urunler?kategori=${urun.site_kategori_id}`} className="hover:text-[var(--color-primary)]">
                                {kategoriAdi}
                            </Link>
                        </>
                    )}
                    <ChevronRight size={14} />
                    <span className="line-clamp-1 text-gray-700 dark:text-zinc-200">{urun.site_ad}</span>
                </nav>

                <div className="grid gap-8 lg:grid-cols-2">
                    <UrunGaleri gorseller={urun.site_gorseller} ad={urun.site_ad} />

                    <div className="flex flex-col gap-5">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", durum.renk)}>{durum.etiket}</span>
                                <StokRozeti stokta={urun.site_stokta} />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-zinc-100">{urun.site_ad}</h1>
                            {(urun.marka || urun.model) && (
                                <p className="text-gray-500 dark:text-zinc-400">{[urun.marka, urun.model].filter(Boolean).join(" · ")}</p>
                            )}
                        </div>

                        <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
                            <p className="text-sm text-gray-600 dark:text-zinc-300">
                                {urun.site_stokta
                                    ? "Fiyat bilgisi ve sipariş için bize yazın; hemen dönüş yapalım."
                                    : "Bu ürün şu an stokta yok. Tekrar ne zaman geleceğini öğrenmek için bize yazın."}
                            </p>
                            <UrunIletisimButonlari urunAdi={urun.site_ad} stokKodu={urun.stok_kodu} whatsapp={iletisim?.whatsapp} buyuk />
                        </div>

                        <dl className="divide-y overflow-hidden rounded-2xl border border-gray-200 bg-white text-sm dark:divide-zinc-700 dark:border-zinc-700 dark:bg-zinc-900">
                            {ozellikler.map((o) => (
                                <div key={o.etiket} className="grid grid-cols-[110px_1fr] gap-3 px-4 py-2.5">
                                    <dt className="text-gray-500 dark:text-zinc-400">{o.etiket}</dt>
                                    <dd className="font-medium text-gray-800 dark:text-zinc-100">{o.deger}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>

                <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
                    <h2 className="mb-3 text-lg font-semibold text-[var(--color-secondary)] dark:text-zinc-100">Ürün Açıklaması</h2>
                    <p className="whitespace-pre-line leading-relaxed text-gray-700 dark:text-zinc-300">{urun.site_aciklama}</p>
                </section>

                {benzerler.length > 0 && (
                    <section className="mt-12">
                        <h2 className="mb-5 text-xl font-semibold text-gray-900 dark:text-zinc-100">Benzer Ürünler</h2>
                        <ul className="grid gap-5 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                            {benzerler.map((b) => (
                                <li key={b.id}>
                                    <UrunKarti urun={b} kategori={kategoriAdi} whatsapp={iletisim?.whatsapp} />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </div>
    );
}
