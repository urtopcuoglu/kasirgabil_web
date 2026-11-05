// src/app/admin/(panel)/SatisAnalizi.tsx
// Özet sayfasının "Satış ve Kasa" bölümü (kasa izni olanlar görür). Üstteki dönem seçici bölümdeki her kartı ve
// grafiği aynı döneme göre yeniler; kartlardaki değişim eşit uzunluktaki önceki döneme göredir.
import Link from "next/link";
import {
    ArrowDownRight,
    ArrowUpRight,
    Banknote,
    BarChart3,
    CreditCard,
    FolderTree,
    HandCoins,
    Layers,
    Minus,
    PiggyBank,
    Receipt,
    ShoppingCart,
    Tag,
    TrendingDown,
    TrendingUp,
    Trophy,
    Wallet,
    Warehouse,
    Wrench,
    type LucideIcon,
} from "lucide-react";
import { DONEMLER, DONEM_LISTESI, type KasaAnalizi, type SiraKalemi } from "@/lib/kasa-analiz";
import { ODEME_YONTEMLERI, YONTEM_KODLARI } from "@/lib/schemas/kasa";
import { cn } from "@/lib/utils";
import { BolumluCubuk, DonemSecici, SutunGrafigi } from "./OzetGrafikleri";

const bas = (s: string) => s.charAt(0).toLocaleUpperCase("tr") + s.slice(1);
const tl = (v: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(v);

export default function SatisAnalizi({ a }: { a: KasaAnalizi }) {
    const { simdi, onceki } = a;
    const karsilastirma = DONEMLER[a.donem];
    const degisim = (yeni: number, eski: number, iyiYon: "yukari" | "asagi" = "yukari") => ({ yeni, eski, iyiYon, karsilastirma });

    const enCokKategori = a.kategoriler[0];
    const enAzKategori = a.kategoriler.length > 1 ? a.kategoriler.at(-1) : undefined;
    const enCokMarka = a.markalar[0];
    const enAzMarka = a.markalar.length > 1 ? a.markalar.at(-1) : undefined;
    const enCokUrun = a.urunler[0];
    const ortalamaSatis = simdi.satisSayisi ? simdi.satis / simdi.satisSayisi : 0;
    const oncekiOrtalama = onceki.satisSayisi ? onceki.satis / onceki.satisSayisi : 0;

    return (
        <section aria-labelledby="satis-analizi" className="space-y-4">
            {/* Filtre tek satırda, bölümün üstünde; altındaki her şeyi kapsar. */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 id="satis-analizi" className="font-semibold text-[var(--color-secondary)]">
                        Satış ve Kasa
                    </h2>
                    <p className="text-xs text-gray-500">
                        {karsilastirma.etiket} · değişimler {karsilastirma.ile} karşılaştırılır
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <DonemSecici deger={a.donem} secenekler={DONEM_LISTESI.map((d) => ({ deger: d, etiket: DONEMLER[d].etiket }))} />
                    <Link href="/admin/kasa" className="text-sm text-[var(--color-secondary)] hover:underline">
                        Kasa
                    </Link>
                </div>
            </div>

            {/* Ana göstergeler */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatKarti baslik="Toplam Satış" Ikon={ShoppingCart} deger={tl(simdi.satis)} alt={`${simdi.satisSayisi} satış işlemi`} degisim={degisim(simdi.satis, onceki.satis)} />
                <StatKarti baslik="Toplam Gelir" Ikon={TrendingUp} deger={tl(simdi.gelir)} alt="Satış, servis ve diğer gelirler" degisim={degisim(simdi.gelir, onceki.gelir)} />
                <StatKarti baslik="Toplam Gider" Ikon={TrendingDown} deger={tl(simdi.gider)} alt="Alış, kira, fatura, maaş..." degisim={degisim(simdi.gider, onceki.gider, "asagi")} />
                <StatKarti
                    baslik="Net (Gelir − Gider)"
                    Ikon={Wallet}
                    deger={tl(simdi.gelir - simdi.gider)}
                    alt={simdi.gelir - simdi.gider < 0 ? "Gider geliri aştı" : "Dönem sonucu"}
                    degisim={degisim(simdi.gelir - simdi.gider, onceki.gelir - onceki.gider)}
                    vurgu={simdi.gelir - simdi.gider < 0 ? "kotu" : undefined}
                />
            </div>

            {/* Grafikler */}
            <div className="grid gap-4 lg:grid-cols-2">
                <GrafikKarti baslik="Satışlar (₺)" Ikon={BarChart3} aciklama="Satış kategorisindeki gelirler">
                    <SutunGrafigi
                        seriler={["Satış"]}
                        veri={a.grafik.map((k) => ({ etiket: k.etiket, uzunEtiket: k.uzunEtiket, degerler: [k.satis] }))}
                        bosMesaj="Bu dönemde satış yok."
                    />
                </GrafikKarti>
                <GrafikKarti baslik="Gelir ve Gider (₺)" Ikon={Receipt} aciklama="Tüm kasa hareketleri">
                    <SutunGrafigi
                        seriler={["Gelir", "Gider"]}
                        veri={a.grafik.map((k) => ({ etiket: k.etiket, uzunEtiket: k.uzunEtiket, degerler: [k.gelir, k.gider] }))}
                    />
                </GrafikKarti>
            </div>

            {/* Nakit akışı */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatKarti baslik="Gelen Nakit" Ikon={Banknote} deger={tl(simdi.gelenNakit)} alt="Nakit tahsilat" degisim={degisim(simdi.gelenNakit, onceki.gelenNakit)} />
                <StatKarti
                    baslik="Gelen Kredi Kartı"
                    Ikon={CreditCard}
                    deger={tl(simdi.gelenKrediKarti)}
                    alt={`Banka kartı: ${tl(simdi.yontemler.banka_karti)}`}
                    degisim={degisim(simdi.gelenKrediKarti, onceki.gelenKrediKarti)}
                />
                <StatKarti baslik="Çıkan Nakit" Ikon={HandCoins} deger={tl(simdi.cikanNakit)} alt="Nakit ödenen giderler" degisim={degisim(simdi.cikanNakit, onceki.cikanNakit, "asagi")} />
                <GrafikKarti baslik="Gelir Ödeme Yöntemleri" Ikon={Layers}>
                    <BolumluCubuk parcalar={YONTEM_KODLARI.map((y) => ({ ad: ODEME_YONTEMLERI[y], deger: simdi.yontemler[y] }))} />
                </GrafikKarti>
            </div>

            {/* Kategori ve marka */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SiraKarti baslik="En Çok Satılan Kategori" Ikon={FolderTree} kalem={enCokKategori} />
                <SiraKarti baslik="En Az Satılan Kategori" Ikon={FolderTree} kalem={enAzKategori} azMi />
                <SiraKarti baslik="En Çok Satılan Marka" Ikon={Tag} kalem={enCokMarka} />
                <SiraKarti baslik="En Az Satılan Marka" Ikon={Tag} kalem={enAzMarka} azMi />
            </div>

            {/* Önerilen ek göstergeler */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatKarti
                    baslik="Ortalama Satış Tutarı"
                    Ikon={Receipt}
                    deger={tl(ortalamaSatis)}
                    alt={`${simdi.satisAdedi} adet ürün satıldı`}
                    degisim={degisim(ortalamaSatis, oncekiOrtalama)}
                />
                <StatKarti baslik="Servis Geliri" Ikon={Wrench} deger={tl(simdi.servis)} alt="Teknik servis tahsilatları" degisim={degisim(simdi.servis, onceki.servis)} />
                <StatKarti
                    baslik="Tahmini Brüt Kâr"
                    Ikon={PiggyBank}
                    deger={simdi.karKapsami ? tl(simdi.brutKar) : "—"}
                    alt={
                        simdi.karKapsami
                            ? `Marj %${Math.round((simdi.brutKar / simdi.karKapsami) * 100)} · alış fiyatı girilmiş ${tl(simdi.karKapsami)} satış`
                            : "Alış fiyatı girilmiş ürün satışı yok"
                    }
                    degisim={simdi.karKapsami ? degisim(simdi.brutKar, onceki.brutKar) : undefined}
                />
                <SiraKarti baslik="En Çok Satan Ürün" Ikon={Trophy} kalem={enCokUrun} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <StatKarti
                    baslik="Stok Değeri (Alış)"
                    Ikon={Warehouse}
                    deger={tl(a.stok.alis)}
                    alt={a.stok.alisFiyatsiz ? `${a.stok.alisFiyatsiz} üründe alış fiyatı yok; değere katılmadı` : "Stoktaki ürünlerin alış fiyatıyla değeri"}
                />
                <StatKarti
                    baslik="Stok Değeri (Satış)"
                    Ikon={Warehouse}
                    deger={tl(a.stok.satis)}
                    alt={
                        a.stok.satisFiyatsiz
                            ? `${a.stok.satisFiyatsiz} üründe satış fiyatı yok; değere katılmadı`
                            : a.stok.alis > 0 && !a.stok.alisFiyatsiz
                              ? `Alışa göre fark: ${tl(a.stok.satis - a.stok.alis)}`
                              : "Stoktaki ürünlerin satış fiyatıyla değeri"
                    }
                />
            </div>
        </section>
    );
}

// ─── Kartlar ────────────────────────────────────────────────

type Degisim = { yeni: number; eski: number; iyiYon: "yukari" | "asagi"; karsilastirma: (typeof DONEMLER)[keyof typeof DONEMLER] };

function StatKarti({
    baslik,
    Ikon,
    deger,
    alt,
    degisim,
    vurgu,
}: {
    baslik: string;
    Ikon: LucideIcon;
    deger: string;
    alt: string;
    degisim?: Degisim;
    vurgu?: "kotu";
}) {
    return (
        <section className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm text-gray-500">{baslik}</h3>
                <Ikon className="size-5 shrink-0 text-[var(--color-primary)]" aria-hidden />
            </div>
            <p className={cn("mt-2 truncate text-2xl font-bold text-[var(--color-secondary)]", vurgu === "kotu" && "text-[var(--color-primary)]")}>{deger}</p>
            <p className="mt-1 truncate text-xs text-gray-500" title={alt}>
                {alt}
            </p>
            {degisim && <DegisimSatiri {...degisim} />}
        </section>
    );
}

// Değişim: yön oku + yüzde + metin; renk yön × iyi yön (giderde artış kötüdür). Renk tek başına anlam taşımaz.
function DegisimSatiri({ yeni, eski, iyiYon, karsilastirma }: Degisim) {
    if (yeni === 0 && eski === 0) return <p className="mt-2 text-xs text-gray-400">Bu dönemde ve {karsilastirma.bulunma} kayıt yok</p>;
    if (eski === 0) return <p className="mt-2 text-xs text-gray-500">{bas(karsilastirma.bulunma)} kayıt yoktu</p>;
    const oran = ((yeni - eski) / Math.abs(eski)) * 100;
    const yuvarlak = Math.round(oran);
    if (yuvarlak === 0) {
        return (
            <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                <Minus className="size-3.5" aria-hidden /> {karsilastirma.ile} aynı
            </p>
        );
    }
    const artti = yuvarlak > 0;
    const iyi = artti === (iyiYon === "yukari");
    const Ikon = artti ? ArrowUpRight : ArrowDownRight;
    return (
        <p className={cn("mt-2 flex items-center gap-1 text-xs font-medium", iyi ? "text-[#006300]" : "text-[#d03b3b]")}>
            <Ikon className="size-3.5" aria-hidden />
            {artti ? "+" : "−"}%{Math.abs(yuvarlak).toLocaleString("tr-TR")}
            <span className="font-normal text-gray-500">{karsilastirma.yonelme} göre</span>
        </p>
    );
}

function SiraKarti({ baslik, Ikon, kalem, azMi }: { baslik: string; Ikon: LucideIcon; kalem?: SiraKalemi; azMi?: boolean }) {
    return (
        <section className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm text-gray-500">{baslik}</h3>
                <Ikon className="size-5 shrink-0 text-[var(--color-primary)]" aria-hidden />
            </div>
            {kalem ? (
                <>
                    <p className="mt-2 truncate text-xl font-bold text-[var(--color-secondary)]" title={kalem.aciklama ?? kalem.ad}>
                        {kalem.ad}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                        {tl(kalem.tutar)} · {kalem.adet} adet
                    </p>
                    {kalem.aciklama && kalem.aciklama !== kalem.ad && <p className="mt-0.5 truncate text-xs text-gray-400">{kalem.aciklama}</p>}
                </>
            ) : (
                <p className="mt-2 text-sm text-gray-500">
                    {azMi ? "Karşılaştırma için en az iki farklı satış gerekli." : "Bu dönemde ürüne bağlı satış yok."}
                </p>
            )}
        </section>
    );
}

function GrafikKarti({ baslik, Ikon, aciklama, children }: { baslik: string; Ikon: LucideIcon; aciklama?: string; children: React.ReactNode }) {
    return (
        <section className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                    <h3 className="font-semibold text-[var(--color-secondary)]">{baslik}</h3>
                    {aciklama && <p className="text-xs text-gray-500">{aciklama}</p>}
                </div>
                <Ikon className="size-5 shrink-0 text-[var(--color-primary)]" aria-hidden />
            </div>
            {children}
        </section>
    );
}
