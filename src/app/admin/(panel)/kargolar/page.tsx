// src/app/admin/(panel)/kargolar/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck, CalendarPlus, Eye, Plus, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { dbHataMesaji } from "@/lib/supabase/yetkili";
import { ODEME_TIPLERI, type Kargo, type KargoGonderici } from "@/lib/schemas/kargo";
import { gunBasi, sonrakiGunBasi, tarihSaatYaz, tarihYaz } from "@/lib/tarih";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { anaButonSinifi, FormHatasi, inputSinifi, SayfaBasligi } from "../../_components/form";
import {
    FiltreOzeti,
    FiltreSecimi,
    FiltreTarihi,
    GorunumSecici,
    gorunumOku,
    linkOlustur,
    secenekOku,
    tarihMi,
    uuidMi,
} from "../../_components/liste";
import OtomatikFiltreFormu from "../../_components/OtomatikFiltreFormu";
import OdemeTipiRozeti from "./OdemeTipiRozeti";

export const metadata: Metadata = {
    title: "Kargolar",
};

type Props = {
    searchParams: Promise<{
        q?: string;
        gonderici?: string;
        odeme?: string;
        durum?: string;
        baslangic?: string;
        bitis?: string;
        sirala?: string;
        gorunum?: string;
    }>;
};

const LIMIT = 200;
const ODEME_SECENEKLERI = ["", "UA", "GO"] as const;
const DURUMLAR = ["", "bekliyor", "verildi"] as const;
const SIRALAMALAR = ["yeni", "eski"] as const;

// PostgREST "or" filtresinde değer çift tırnak içine alınır; tırnak ve ters bölü kaçırılır.
// Önce LIKE joker karakterleri (% _ \) metin olarak aransın diye kaçırılır.
function orIlikeDegeri(q: string) {
    const likeGuvenli = q.replace(/[\\%_]/g, (k) => `\\${k}`);
    return `"%${likeGuvenli.replace(/["\\]/g, (k) => `\\${k}`)}%"`;
}



export default async function KargolarSayfasi({ searchParams }: Props) {
    const p = await searchParams;
    const q = (p.q ?? "").trim();
    // Elle bozulmuş bir URL veritabanı hatasına yol açmasın diye değerler doğrulanarak okunur.
    const gonderici = uuidMi(p.gonderici) ? p.gonderici : undefined;
    const odeme = secenekOku(p.odeme, ODEME_SECENEKLERI, "");
    const durum = secenekOku(p.durum, DURUMLAR, "");
    const baslangic = tarihMi(p.baslangic) ? p.baslangic : undefined;
    const bitis = tarihMi(p.bitis) ? p.bitis : undefined;
    const sirala = secenekOku(p.sirala, SIRALAMALAR, "yeni");
    const gorunum = gorunumOku(p.gorunum);

    // Varsayılan değerler URL'e yazılmaz.
    const filtreler = {
        q: q || undefined,
        gonderici,
        odeme: odeme || undefined,
        durum: durum || undefined,
        baslangic,
        bitis,
        sirala: sirala === "yeni" ? undefined : sirala,
    };
    const aktifFiltre = Object.values(filtreler).filter(Boolean).length;

    const supabase = await createClient();

    let sorgu = supabase
        .from("kargolar")
        .select("*")
        .order("created_at", { ascending: sirala === "eski" })
        .limit(LIMIT);

    if (q) {
        const v = orIlikeDegeri(q);
        sorgu = sorgu.or(
            `alici_adi.ilike.${v},alici_firma.ilike.${v},alici_telefon.ilike.${v},gonderici_firma_adi.ilike.${v},gonderici_adi.ilike.${v}`
        );
    }
    if (gonderici) sorgu = sorgu.eq("gonderici_id", gonderici);
    if (odeme) sorgu = sorgu.eq("odeme_tipi", odeme);
    if (durum === "bekliyor") sorgu = sorgu.is("kargoya_verilis_tarihi", null);
    if (durum === "verildi") sorgu = sorgu.not("kargoya_verilis_tarihi", "is", null);
    if (baslangic) sorgu = sorgu.gte("created_at", gunBasi(baslangic));
    if (bitis) sorgu = sorgu.lt("created_at", sonrakiGunBasi(bitis));

    const [kargolarSonucu, gondericilerSonucu] = await Promise.all([
        sorgu,
        supabase.from("kargo_gondericileri").select("id, firma_adi, gonderici_adi").order("varsayilan", { ascending: false }).order("firma_adi"),
    ]);

    const kargolar = (kargolarSonucu.data ?? []) as Kargo[];
    const gondericiler = (gondericilerSonucu.data ?? []) as Pick<KargoGonderici, "id" | "firma_adi" | "gonderici_adi">[];
    const hata = kargolarSonucu.error ?? gondericilerSonucu.error;

    return (
        <div>
            <SayfaBasligi baslik="Kargolar" aciklama="Kaydedilen ve yazdırılan kargo şablonları.">
                <Button asChild className={anaButonSinifi}>
                    <Link href="/admin/kargolar/yeni">
                        <Plus /> Yeni Kargo Şablonu
                    </Link>
                </Button>
            </SayfaBasligi>

            {/* Filtre çubuğu */}
            <OtomatikFiltreFormu
                action="/admin/kargolar"
                className="mb-3 grid gap-3 rounded-xl border bg-white p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[minmax(0,2fr)_repeat(6,minmax(0,1fr))_auto]"
            >
                {gorunum === "kart" && <input type="hidden" name="gorunum" value="kart" />}
                <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-gray-500 sm:col-span-2 xl:col-span-1">
                    Ara
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                            <input
                                name="q"
                                type="search"
                                defaultValue={q}
                                placeholder="Alıcı, firma, telefon..."
                                className={cn(inputSinifi, "py-1.5 pl-9")}
                            />
                        </div>
                        <Button type="submit" variant="outline" className="h-[34px]">
                            Ara
                        </Button>
                    </div>
                </label>
                <FiltreSecimi
                    etiket="Gönderici"
                    name="gonderici"
                    deger={gonderici ?? ""}
                    secenekler={[
                        { deger: "", etiket: "Tümü" },
                        ...gondericiler.map((g) => ({
                            deger: g.id,
                            etiket: g.gonderici_adi !== g.firma_adi ? `${g.firma_adi} (${g.gonderici_adi})` : g.firma_adi,
                        })),
                    ]}
                />
                <FiltreSecimi
                    etiket="Ödeme Tipi"
                    name="odeme"
                    deger={odeme}
                    secenekler={[
                        { deger: "", etiket: "Tümü" },
                        ...Object.entries(ODEME_TIPLERI).map(([kod, { kisa, uzun }]) => ({ deger: kod, etiket: `${kisa} – ${uzun}` })),
                    ]}
                />
                <FiltreSecimi
                    etiket="Durum"
                    name="durum"
                    deger={durum}
                    secenekler={[
                        { deger: "", etiket: "Tümü" },
                        { deger: "bekliyor", etiket: "Kargoya verilmeyi bekleyen" },
                        { deger: "verildi", etiket: "Kargoya verilen" },
                    ]}
                />
                <FiltreTarihi etiket="Oluşturma (başlangıç)" name="baslangic" deger={baslangic} />
                <FiltreTarihi etiket="Oluşturma (bitiş)" name="bitis" deger={bitis} />
                <FiltreSecimi
                    etiket="Sıralama"
                    name="sirala"
                    deger={sirala}
                    secenekler={[
                        { deger: "yeni", etiket: "En yeni" },
                        { deger: "eski", etiket: "En eski" },
                    ]}
                />
                <div className="flex items-end">
                    <GorunumSecici
                        aktif={gorunum}
                        link={(g) => linkOlustur("/admin/kargolar", { ...filtreler, gorunum: g === "kart" ? "kart" : undefined })}
                    />
                </div>
            </OtomatikFiltreFormu>

            <FiltreOzeti
                sonucSayisi={kargolar.length}
                aktifFiltre={aktifFiltre}
                temizleLinki={linkOlustur("/admin/kargolar", { gorunum: gorunum === "kart" ? "kart" : undefined })}
            />

            {hata && <FormHatasi mesaj={dbHataMesaji(hata)} />}

            {!hata && kargolar.length === 0 && (
                <div className="rounded-xl border border-dashed bg-white p-10 text-center text-sm text-gray-500">
                    {aktifFiltre > 0 ? (
                        "Filtrelere uygun kargo bulunamadı."
                    ) : (
                        <>
                            Henüz kargo şablonu oluşturulmamış. Rehberdeki bir kişiden <strong>Kargo şablonu</strong>{" "}
                            butonuyla başlayabilirsiniz.
                        </>
                    )}
                </div>
            )}

            {kargolar.length > 0 &&
                (gorunum === "kart" ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {kargolar.map((k) => (
                            <KargoKarti key={k.id} kargo={k} />
                        ))}
                    </div>
                ) : (
                    <KargoTablosu kargolar={kargolar} />
                ))}

            {kargolar.length === LIMIT && (
                <p className="mt-4 text-center text-xs text-gray-500">
                    İlk {LIMIT} kargo gösteriliyor. Daha fazlası için filtreleri daraltın.
                </p>
            )}
        </div>
    );
}

// ─── Ortak parçalar ─────────────────────────────────────────

function VerilisDurumu({ tarih }: { tarih: string | null }) {
    return tarih ? (
        <>{tarihYaz(tarih)}</>
    ) : (
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Bekliyor</span>
    );
}

// ─── Liste (tablo) görünümü ─────────────────────────────────

function KargoTablosu({ kargolar }: { kargolar: Kargo[] }) {
    return (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                        <th className="px-4 py-3 font-medium">Gönderici</th>
                        <th className="px-4 py-3 font-medium">Alıcı</th>
                        <th className="px-4 py-3 font-medium">Oluşturma</th>
                        <th className="px-4 py-3 font-medium">Kargoya Veriliş</th>
                        <th className="px-4 py-3 font-medium">Ödeme Tipi</th>
                        <th className="px-4 py-3" />
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {kargolar.map((k) => (
                        <tr key={k.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                                <p className="font-medium">{k.gonderici_firma_adi}</p>
                                {k.gonderici_adi !== k.gonderici_firma_adi && (
                                    <p className="text-xs text-gray-500">{k.gonderici_adi}</p>
                                )}
                            </td>
                            <td className="px-4 py-3">
                                <p className="font-medium">{k.alici_adi}</p>
                                {k.alici_firma && <p className="text-xs text-gray-500">{k.alici_firma}</p>}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">{tarihSaatYaz(k.created_at)}</td>
                            <td className="whitespace-nowrap px-4 py-3">
                                <VerilisDurumu tarih={k.kargoya_verilis_tarihi} />
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
                                <OdemeTipiRozeti tip={k.odeme_tipi} />
                            </td>
                            <td className="px-4 py-3 text-right">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/kargolar/${k.id}`}>
                                        <Eye /> Detayları Gör
                                    </Link>
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─── Kart görünümü ──────────────────────────────────────────

function KargoKarti({ kargo: k }: { kargo: Kargo }) {
    return (
        <div className="flex flex-col rounded-xl border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
                <OdemeTipiRozeti tip={k.odeme_tipi} />
                <VerilisDurumu tarih={k.kargoya_verilis_tarihi} />
            </div>

            <div className="grid flex-1 grid-cols-[1fr_auto_1fr] items-start gap-2 text-sm">
                <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Gönderici</p>
                    <p className="truncate font-medium">{k.gonderici_firma_adi}</p>
                    {k.gonderici_adi !== k.gonderici_firma_adi && (
                        <p className="truncate text-xs text-gray-500">{k.gonderici_adi}</p>
                    )}
                </div>
                <ArrowRight className="mt-4 size-4 text-gray-300" />
                <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Alıcı</p>
                    <p className="truncate font-medium">{k.alici_adi}</p>
                    {k.alici_firma && <p className="truncate text-xs text-gray-500">{k.alici_firma}</p>}
                </div>
            </div>

            <p className="mt-3 line-clamp-2 text-xs text-gray-500" title={k.alici_adres}>
                {k.alici_adres}
            </p>

            <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
                <div className="space-y-0.5 text-xs text-gray-500">
                    <p className="flex items-center gap-1.5" title="Oluşturma">
                        <CalendarPlus className="size-3.5" /> {tarihSaatYaz(k.created_at)}
                    </p>
                    {k.kargoya_verilis_tarihi && (
                        <p className="flex items-center gap-1.5" title="Kargoya veriliş">
                            <CalendarCheck className="size-3.5" /> {tarihYaz(k.kargoya_verilis_tarihi)}
                        </p>
                    )}
                </div>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/kargolar/${k.id}`}>
                        <Eye /> Detayları Gör
                    </Link>
                </Button>
            </div>
        </div>
    );
}
