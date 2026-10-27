// src/app/(site)/urunler/page.tsx
// Panelde "Siteye ekle" ile yayınlanan ürünler. Fiyat gösterilmez; kartlarda WhatsApp ve canlı destek butonları var.
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, PackageSearch, ShoppingBag } from "lucide-react";
import { siteIcerigi } from "@/lib/icerik";
import { SITE_SIRALAMALARI, siteFiltreSecenekleri, siteUrunleri, type SiteSiralamasi } from "@/lib/site-urunleri";
import UrunFiltreleri from "@/app/component_page/UrunFiltreleri";
import UrunKarti from "@/app/component_page/UrunKarti";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Ürünler | Kasırga Bilgisayar",
    description: "Kasırga Bilgisayar'ın sıfır ve ikinci el bilgisayar, notebook, yedek parça ve çevre birimi ürünleri.",
};

const ADET = 24;

type Props = { searchParams: Promise<{ kategori?: string; marka?: string; model?: string; sirala?: string; sayfa?: string }> };

// Kısa ve düz metin kabul edilir (elle bozulmuş adreslere karşı).
const metinOku = (v?: string) => (v && v.length <= 100 ? v.trim() : "");

export default async function UrunlerSayfasi({ searchParams }: Props) {
    const p = await searchParams;
    const marka = metinOku(p.marka);
    const model = metinOku(p.model);
    const kategori = p.kategori && /^[0-9a-f-]{36}$/i.test(p.kategori) ? p.kategori : "";
    const sirala: SiteSiralamasi = p.sirala && p.sirala in SITE_SIRALAMALARI ? (p.sirala as SiteSiralamasi) : "yeni";
    const sayfa = Math.max(1, Number.parseInt(p.sayfa ?? "1", 10) || 1);

    const [{ urunler, toplam }, secenekler, iletisim] = await Promise.all([
        siteUrunleri({ marka, model, kategori, sirala, sayfa, adet: ADET }),
        siteFiltreSecenekleri(marka || undefined),
        siteIcerigi("iletisim"),
    ]);
    const sayfaSayisi = Math.max(1, Math.ceil(toplam / ADET));
    const kategoriAdi = (id: string | null) => (id ? secenekler.agac.yol(id).split(" › ").pop() : undefined);

    const link = (s: number) => {
        const q = new URLSearchParams();
        if (kategori) q.set("kategori", kategori);
        if (marka) q.set("marka", marka);
        if (model) q.set("model", model);
        if (sirala !== "yeni") q.set("sirala", sirala);
        if (s > 1) q.set("sayfa", String(s));
        const metin = q.toString();
        return metin ? `/urunler?${metin}` : "/urunler";
    };
    const filtreli = !!(kategori || marka || model);

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-zinc-800">
            <div className="bg-gradient-to-r from-[#2C2262] to-[#362C68] px-4 py-16 text-white">
                <div className="container mx-auto flex flex-col items-center justify-center gap-3 text-center">
                    <div className="flex items-center gap-4">
                        <ShoppingBag size={48} className="drop-shadow-md" />
                        <h1 className="text-4xl font-bold drop-shadow-md">Ürünler</h1>
                    </div>
                    <p className="max-w-2xl text-white/80">
                        Fiyat ve stok bilgisi için ürün üzerindeki WhatsApp veya Canlı Destek butonundan bize hemen ulaşın.
                    </p>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-4 py-10">
                <UrunFiltreleri
                    secili={{ kategori, marka, model, sirala }}
                    kategoriler={secenekler.kategoriler.map((k) => ({ deger: k.id, etiket: `${"  ".repeat(k.derinlik)}${k.ad}` }))}
                    markalar={secenekler.markalar}
                    modeller={secenekler.modeller}
                    siralamalar={Object.entries(SITE_SIRALAMALARI).map(([deger, { etiket }]) => ({ deger, etiket }))}
                />

                <p className="mb-4 mt-6 text-sm text-gray-500 dark:text-zinc-400">{toplam} ürün</p>

                {urunler.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-white py-16 text-center text-gray-500 dark:bg-zinc-900">
                        <PackageSearch size={40} className="text-gray-300" />
                        {filtreli ? (
                            <>
                                Seçtiğiniz filtrelere uygun ürün bulunamadı.
                                <Link href="/urunler" className="font-medium text-[var(--color-primary)] hover:underline">
                                    Tüm ürünleri göster
                                </Link>
                            </>
                        ) : (
                            "Yakında ürünlerimiz burada olacak."
                        )}
                    </div>
                ) : (
                    <ul className="grid gap-5 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                        {urunler.map((u) => (
                            <li key={u.id}>
                                <UrunKarti urun={u} kategori={kategoriAdi(u.site_kategori_id)} whatsapp={iletisim?.whatsapp} />
                            </li>
                        ))}
                    </ul>
                )}

                {sayfaSayisi > 1 && (
                    <nav aria-label="Sayfalar" className="mt-10 flex items-center justify-center gap-2">
                        <SayfaLinki href={link(sayfa - 1)} pasif={sayfa <= 1} etiket="Önceki sayfa">
                            <ChevronLeft size={18} />
                        </SayfaLinki>
                        <span className="px-3 text-sm text-gray-600 dark:text-zinc-300">
                            {sayfa} / {sayfaSayisi}
                        </span>
                        <SayfaLinki href={link(sayfa + 1)} pasif={sayfa >= sayfaSayisi} etiket="Sonraki sayfa">
                            <ChevronRight size={18} />
                        </SayfaLinki>
                    </nav>
                )}
            </div>
        </div>
    );
}

function SayfaLinki({ href, pasif, etiket, children }: { href: string; pasif: boolean; etiket: string; children: React.ReactNode }) {
    const sinif = "flex size-10 items-center justify-center rounded-full border bg-white dark:bg-zinc-900";
    if (pasif) return <span className={cn(sinif, "opacity-40")}>{children}</span>;
    return (
        <Link href={href} aria-label={etiket} className={cn(sinif, "hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]")}>
            {children}
        </Link>
    );
}
