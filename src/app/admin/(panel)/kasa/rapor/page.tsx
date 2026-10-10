// src/app/admin/(panel)/kasa/rapor/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { dbHataMesaji } from "@/lib/supabase/yetkili";
import {
    kasaOzeti,
    ODEME_YONTEMLERI,
    YONTEM_KODLARI,
    type KasaGunu,
    type KasaHareketi,
    type KasaKategori,
    type KasaTipi,
} from "@/lib/schemas/kasa";
import { bugunISO, gunEkle, paraYaz, tarihYaz } from "@/lib/tarih";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormHatasi, SayfaBasligi } from "../../../_components/form";
import { FiltreTarihi, tarihMi } from "../../../_components/liste";
import { FarkYazisi } from "../GunSonuPaneli";
import KasaSekmeleri from "../KasaSekmeleri";

export const metadata: Metadata = {
    title: "Kasa Raporu",
};

type Props = {
    searchParams: Promise<{ baslangic?: string; bitis?: string }>;
};

const LIMIT = 10000;

// Hazır aralıklar (Türkiye tarihine göre).
function araliklar(bugun: string) {
    const gun = new Date(`${bugun}T00:00:00Z`);
    const haftaBasi = gunEkle(bugun, -((gun.getUTCDay() + 6) % 7)); // pazartesi
    const ayBasi = `${bugun.slice(0, 8)}01`;
    const gecenAyBasi = new Date(Date.UTC(gun.getUTCFullYear(), gun.getUTCMonth() - 1, 1)).toISOString().slice(0, 10);
    return [
        { etiket: "Bugün", baslangic: bugun, bitis: bugun },
        { etiket: "Bu hafta", baslangic: haftaBasi, bitis: bugun },
        { etiket: "Bu ay", baslangic: ayBasi, bitis: bugun },
        { etiket: "Geçen ay", baslangic: gecenAyBasi, bitis: gunEkle(ayBasi, -1) },
        { etiket: "Son 30 gün", baslangic: gunEkle(bugun, -29), bitis: bugun },
    ];
}

export default async function KasaRaporSayfasi({ searchParams }: Props) {
    const p = await searchParams;
    const bugun = bugunISO();
    const hazir = araliklar(bugun);
    let baslangic = tarihMi(p.baslangic) ? p.baslangic! : hazir[2].baslangic;
    let bitis = tarihMi(p.bitis) ? p.bitis! : bugun;
    if (baslangic > bitis) [baslangic, bitis] = [bitis, baslangic];

    const supabase = await createClient();
    const [hareketSonucu, kategoriSonucu, gunSonucu] = await Promise.all([
        supabase
            .from("kasa_hareketleri")
            .select("tarih, tip, yontem, tutar, kategori_id")
            .gte("tarih", baslangic)
            .lte("tarih", bitis)
            .limit(LIMIT),
        supabase.from("kasa_kategorileri").select("id, ad, tip, kod, sistem"),
        supabase.from("kasa_gunleri").select("*").gte("tarih", baslangic).lte("tarih", bitis),
    ]);

    const hareketler = (hareketSonucu.data ?? []) as Pick<KasaHareketi, "tarih" | "tip" | "yontem" | "tutar" | "kategori_id">[];
    const kategoriler = (kategoriSonucu.data ?? []) as KasaKategori[];
    const gunler = new Map(((gunSonucu.data ?? []) as KasaGunu[]).map((g) => [g.tarih, g]));
    const ozet = kasaOzeti(hareketler);
    const hata = hareketSonucu.error ?? kategoriSonucu.error ?? gunSonucu.error;

    // Günlük kırılım (hareketi veya kapanışı olan günler, yeniden eskiye)
    const gunluk = new Map<string, { gelir: number; gider: number }>();
    for (const h of hareketler) {
        const g = gunluk.get(h.tarih) ?? { gelir: 0, gider: 0 };
        g[h.tip] += Number(h.tutar);
        gunluk.set(h.tarih, g);
    }
    for (const t of gunler.keys()) if (!gunluk.has(t)) gunluk.set(t, { gelir: 0, gider: 0 });
    const gunSatirlari = [...gunluk.entries()].toSorted(([a], [b]) => b.localeCompare(a));

    const kategoriKirilimi = (tip: KasaTipi) =>
        kategoriler
            .filter((k) => k.tip === tip && ozet.kategoriler.has(k.id))
            .map((k) => ({ ad: k.ad, tutar: ozet.kategoriler.get(k.id)! }))
            .toSorted((a, b) => b.tutar - a.tutar);

    return (
        <div>
            <SayfaBasligi baslik="Kasa" aciklama={`${tarihYaz(baslangic)} – ${tarihYaz(bitis)} arası rapor`} />

            <KasaSekmeleri aktif="/admin/kasa/rapor" />

            <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border bg-white p-3 shadow-sm">
                <div className="flex flex-wrap gap-1">
                    {hazir.map((a) => {
                        const aktif = a.baslangic === baslangic && a.bitis === bitis;
                        return (
                            <Button key={a.etiket} variant={aktif ? "default" : "outline"} size="sm" asChild>
                                <Link href={`/admin/kasa/rapor?baslangic=${a.baslangic}&bitis=${a.bitis}`}>{a.etiket}</Link>
                            </Button>
                        );
                    })}
                </div>
                <form action="/admin/kasa/rapor" className="ml-auto flex flex-wrap items-end gap-2">
                    <FiltreTarihi etiket="Başlangıç" name="baslangic" deger={baslangic} />
                    <FiltreTarihi etiket="Bitiş" name="bitis" deger={bitis} />
                    <Button type="submit" variant="outline" className="h-[34px]">
                        Göster
                    </Button>
                </form>
            </div>

            {hata && <FormHatasi mesaj={dbHataMesaji(hata)} />}

            <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <OzetKarti etiket="Toplam Gelir" deger={paraYaz(ozet.gelir)} renk="text-green-700" />
                <OzetKarti etiket="Toplam Gider" deger={paraYaz(ozet.gider)} renk="text-[var(--color-primary)]" />
                <OzetKarti etiket="Net" deger={paraYaz(ozet.net)} renk={ozet.net < 0 ? "text-[var(--color-primary)]" : undefined} />
                <OzetKarti etiket="Hareket Sayısı" deger={String(hareketler.length)} />
            </div>

            <div className="mb-4 grid gap-4 lg:grid-cols-3">
                <Kart baslik="Ödeme Yöntemi">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-500">
                            <tr>
                                <th className="pb-1 text-left font-medium">Yöntem</th>
                                <th className="pb-1 text-right font-medium">Gelir</th>
                                <th className="pb-1 text-right font-medium">Gider</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {YONTEM_KODLARI.map((y) => (
                                <tr key={y}>
                                    <td className="py-1.5">{ODEME_YONTEMLERI[y]}</td>
                                    <td className="py-1.5 text-right tabular-nums">{paraYaz(ozet.yontemler[y].gelir)}</td>
                                    <td className="py-1.5 text-right tabular-nums">{paraYaz(ozet.yontemler[y].gider)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Kart>
                <Kart baslik="Gelir Kategorileri">
                    <KategoriListesi satirlar={kategoriKirilimi("gelir")} toplam={ozet.gelir} renk="bg-green-500" />
                </Kart>
                <Kart baslik="Gider Kategorileri">
                    <KategoriListesi satirlar={kategoriKirilimi("gider")} toplam={ozet.gider} renk="bg-[var(--color-primary)]" />
                </Kart>
            </div>

            <section className="overflow-x-auto rounded-xl border bg-white shadow-sm">
                <h2 className="px-5 pt-5 font-semibold text-[var(--color-secondary)]">Günlük</h2>
                {gunSatirlari.length === 0 ? (
                    <p className="p-5 text-sm text-gray-500">Bu aralıkta hareket yok.</p>
                ) : (
                    <table className="mt-3 w-full text-left text-sm">
                        <thead className="border-y bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-2 font-medium">Tarih</th>
                                <th className="px-4 py-2 text-right font-medium">Gelir</th>
                                <th className="px-4 py-2 text-right font-medium">Gider</th>
                                <th className="px-4 py-2 text-right font-medium">Net</th>
                                <th className="px-4 py-2 font-medium">Gün Sonu</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {gunSatirlari.map(([tarih, g]) => {
                                const kapanis = gunler.get(tarih);
                                return (
                                    <tr key={tarih} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-4 py-2">
                                            <Link href={`/admin/kasa?tarih=${tarih}`} className="font-medium hover:underline">
                                                {tarihYaz(tarih)}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-2 text-right tabular-nums text-green-700">{paraYaz(g.gelir)}</td>
                                        <td className="px-4 py-2 text-right tabular-nums text-[var(--color-primary)]">{paraYaz(g.gider)}</td>
                                        <td className="px-4 py-2 text-right font-semibold tabular-nums">{paraYaz(g.gelir - g.gider)}</td>
                                        <td className="whitespace-nowrap px-4 py-2">
                                            {kapanis?.kapandi ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs">
                                                    <Lock className="size-3.5 text-gray-400" />
                                                    <FarkYazisi fark={Number(kapanis.sayilan_nakit ?? 0) - Number(kapanis.beklenen_nakit ?? 0)} />
                                                </span>
                                            ) : (
                                                <span className="text-xs text-amber-700">Kapatılmadı</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </section>

            {hareketler.length === LIMIT && (
                <p className="mt-4 text-center text-xs text-[var(--color-primary)]">
                    Aralıkta çok fazla hareket var; rapor ilk {LIMIT} hareketle hesaplandı. Aralığı daraltın.
                </p>
            )}
        </div>
    );
}

function Kart({ baslik, children }: { baslik: string; children: React.ReactNode }) {
    return (
        <section className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold text-[var(--color-secondary)]">{baslik}</h2>
            {children}
        </section>
    );
}

function OzetKarti({ etiket, deger, renk }: { etiket: string; deger: string; renk?: string }) {
    return (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{etiket}</p>
            <p className={cn("mt-1 text-2xl font-bold tabular-nums", renk)}>{deger}</p>
        </div>
    );
}

function KategoriListesi({ satirlar, toplam, renk }: { satirlar: { ad: string; tutar: number }[]; toplam: number; renk: string }) {
    if (satirlar.length === 0) return <p className="text-sm text-gray-500">Hareket yok.</p>;
    return (
        <ul className="space-y-2 text-sm">
            {satirlar.map((s) => (
                <li key={s.ad}>
                    <div className="flex justify-between gap-2">
                        <span>{s.ad}</span>
                        <span className="tabular-nums">{paraYaz(s.tutar)}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-gray-100">
                        <div className={cn("h-full rounded-full", renk)} style={{ width: `${toplam ? (s.tutar / toplam) * 100 : 0}%` }} />
                    </div>
                </li>
            ))}
        </ul>
    );
}
