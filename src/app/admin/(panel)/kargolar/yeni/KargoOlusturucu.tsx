// src/app/admin/(panel)/kargolar/yeni/KargoOlusturucu.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, Loader2, Printer, Save } from "lucide-react";
import { kargoOlustur } from "@/actions/kargo";
import { ODEME_TIPLERI, type KargoGonderici, type OdemeTipi } from "@/lib/schemas/kargo";
import type { RehberKisi } from "@/lib/schemas/rehber";
import { tarihSaatYaz } from "@/lib/tarih";
import { Button } from "@/components/ui/button";
import { Alan, anaButonSinifi, FormHatasi, inputSinifi } from "../../../_components/form";
import { A5YazdirmaStili } from "../../../_components/A5";
import KargoFisi, { type KargoFisiVerisi } from "../KargoFisi";
import YeniGondericiKarti from "./YeniGondericiKarti";

export type AliciSecenegi = Pick<RehberKisi, "id" | "ad_soyad_unvan" | "firma" | "telefon_1" | "telefon_2"> & {
    adres: string;
};

const YENI_GONDERICI = "__yeni__";

type Props = {
    gondericiler: KargoGonderici[];
    alicilar: AliciSecenegi[];
    baslangicAliciId?: string;
};

export default function KargoOlusturucu({ gondericiler: ilkGondericiler, alicilar, baslangicAliciId }: Props) {
    const router = useRouter();
    const [gondericiler, setGondericiler] = useState(ilkGondericiler);
    const [gondericiId, setGondericiId] = useState(
        (ilkGondericiler.find((g) => g.varsayilan) ?? ilkGondericiler[0])?.id ?? ""
    );
    const [yeniGondericiAcik, setYeniGondericiAcik] = useState(false);
    const [aliciId, setAliciId] = useState(baslangicAliciId ?? "");
    const [odemeTipi, setOdemeTipi] = useState<OdemeTipi | "">("");
    const [onizlemeAcik, setOnizlemeAcik] = useState(false);
    const [hata, setHata] = useState<string>();
    const [bekliyor, startTransition] = useTransition();

    const gonderici = gondericiler.find((g) => g.id === gondericiId);
    const alici = alicilar.find((a) => a.id === aliciId);
    const hazir = Boolean(gonderici && alici && odemeTipi);

    // Önizleme açıkken Esc ile kapat.
    useEffect(() => {
        if (!onizlemeAcik) return;
        const tus = (e: KeyboardEvent) => e.key === "Escape" && !bekliyor && setOnizlemeAcik(false);
        window.addEventListener("keydown", tus);
        return () => window.removeEventListener("keydown", tus);
    }, [onizlemeAcik, bekliyor]);

    const gondericiSecildi = (deger: string) => {
        if (deger === YENI_GONDERICI) setYeniGondericiAcik(true);
        else setGondericiId(deger);
    };

    const gondericiEklendi = (yeni: KargoGonderici) => {
        setGondericiler((onceki) => [...onceki, yeni]);
        setGondericiId(yeni.id);
        setYeniGondericiAcik(false);
    };

    const kaydet = (yazdir: boolean) => {
        if (!gonderici || !alici || !odemeTipi) return;
        setHata(undefined);
        startTransition(async () => {
            const sonuc = await kargoOlustur({
                gonderici_id: gonderici.id,
                alici_rehber_id: alici.id,
                odeme_tipi: odemeTipi,
            });
            if ("hata" in sonuc) {
                setHata(sonuc.hata);
                return;
            }
            router.push(yazdir ? `/admin/kargolar/${sonuc.id}?yazdir=1` : "/admin/kargolar");
        });
    };

    const fisVerisi: KargoFisiVerisi | null =
        gonderici && alici && odemeTipi
            ? {
                  gonderici,
                  alici: {
                      adi: alici.ad_soyad_unvan,
                      firma: alici.firma,
                      telefon: alici.telefon_1 ?? alici.telefon_2,
                      adres: alici.adres,
                  },
                  odeme_tipi: odemeTipi,
                  tarih: tarihSaatYaz(new Date().toISOString()),
              }
            : null;

    return (
        <>
            <div className="grid max-w-5xl gap-5 lg:grid-cols-2">
                {/* Gönderici */}
                <section className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
                    <h2 className="font-semibold text-[var(--color-secondary)]">Gönderici</h2>
                    <Alan etiket="Gönderici Seç" htmlFor="gonderici" zorunlu>
                        <select
                            id="gonderici"
                            value={gondericiId}
                            onChange={(e) => gondericiSecildi(e.target.value)}
                            className={inputSinifi}
                        >
                            {gondericiler.length === 0 && <option value="">— Gönderici yok —</option>}
                            {gondericiler.map((g) => (
                                <option key={g.id} value={g.id}>
                                    Firma: {g.firma_adi}
                                    {g.gonderici_adi !== g.firma_adi ? ` (${g.gonderici_adi})` : ""}
                                </option>
                            ))}
                            <option value={YENI_GONDERICI}>+ Yeni Firma veya Gönderici Bilgisi Ekle</option>
                        </select>
                    </Alan>

                    {yeniGondericiAcik ? (
                        <YeniGondericiKarti eklendi={gondericiEklendi} vazgec={() => setYeniGondericiAcik(false)} />
                    ) : (
                        gonderici && (
                            <BilgiKutusu
                                satirlar={[
                                    ["Firma", gonderici.firma_adi],
                                    ["Gönderici", gonderici.gonderici_adi],
                                    ["Telefon", gonderici.telefon],
                                    ["Adres", gonderici.adres],
                                    ["VKN", gonderici.vkn],
                                ]}
                            />
                        )
                    )}
                </section>

                {/* Alıcı ve ödeme */}
                <section className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
                    <h2 className="font-semibold text-[var(--color-secondary)]">Alıcı</h2>
                    <Alan etiket="Alıcı (Rehberden)" htmlFor="alici" zorunlu>
                        <select
                            id="alici"
                            value={aliciId}
                            onChange={(e) => setAliciId(e.target.value)}
                            className={inputSinifi}
                        >
                            <option value="">— Alıcı seçin —</option>
                            {alicilar.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.ad_soyad_unvan}
                                    {a.firma ? ` – ${a.firma}` : ""}
                                </option>
                            ))}
                        </select>
                    </Alan>
                    {alicilar.length === 0 && (
                        <p className="text-xs text-gray-500">
                            Rehberde adresi kayıtlı kimse yok.{" "}
                            <Link href="/admin/rehber/yeni" className="underline">
                                Rehbere ekleyin
                            </Link>
                            .
                        </p>
                    )}

                    {alici && (
                        <BilgiKutusu
                            satirlar={[
                                ["Ad Soyad", alici.ad_soyad_unvan],
                                ["Firma", alici.firma],
                                ["Telefon", alici.telefon_1 ?? alici.telefon_2],
                                ["Adres", alici.adres],
                            ]}
                            altBilgi={
                                <Link href={`/admin/rehber/${alici.id}`} className="underline">
                                    Bilgiler yanlışsa rehberde düzenleyin
                                </Link>
                            }
                        />
                    )}

                    <Alan etiket="Ödeme Tipi" htmlFor="odeme_tipi" zorunlu>
                        <select
                            id="odeme_tipi"
                            value={odemeTipi}
                            onChange={(e) => setOdemeTipi(e.target.value as OdemeTipi | "")}
                            className={inputSinifi}
                        >
                            <option value="">— Seçin —</option>
                            {Object.entries(ODEME_TIPLERI).map(([kod, { kisa, uzun }]) => (
                                <option key={kod} value={kod}>
                                    {kisa} – {uzun}
                                </option>
                            ))}
                        </select>
                    </Alan>
                </section>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
                <Button
                    type="button"
                    onClick={() => setOnizlemeAcik(true)}
                    disabled={!hazir || yeniGondericiAcik}
                    className={anaButonSinifi}
                >
                    <Eye /> Önizleme
                </Button>
                <Button type="button" variant="outline" asChild>
                    <Link href="/admin/kargolar">Vazgeç</Link>
                </Button>
            </div>

            {/* Önizleme penceresi */}
            {onizlemeAcik && fisVerisi && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Kargo şablonu önizleme"
                    className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 print:static print:bg-white print:p-0"
                >
                    <A5YazdirmaStili />
                    <div className="mx-auto mb-4 flex max-w-[210mm] flex-wrap items-center gap-2 rounded-xl bg-white p-3 shadow print:hidden">
                        <Button type="button" variant="outline" onClick={() => setOnizlemeAcik(false)} disabled={bekliyor}>
                            <ArrowLeft /> Geri
                        </Button>
                        <div className="ml-auto flex gap-2">
                            <Button type="button" variant="outline" onClick={() => kaydet(false)} disabled={bekliyor}>
                                {bekliyor ? <Loader2 className="animate-spin" /> : <Save />} Kaydet
                            </Button>
                            <Button type="button" onClick={() => kaydet(true)} disabled={bekliyor} className={anaButonSinifi}>
                                {bekliyor ? <Loader2 className="animate-spin" /> : <Printer />} Yazdır
                            </Button>
                        </div>
                        {hata && (
                            <div className="w-full">
                                <FormHatasi mesaj={hata} />
                            </div>
                        )}
                    </div>
                    <div className="overflow-x-auto pb-4">
                        <KargoFisi veri={fisVerisi} />
                    </div>
                </div>
            )}
        </>
    );
}

type BilgiKutusuProps = {
    satirlar: [string, string | null | undefined][];
    altBilgi?: React.ReactNode;
};

function BilgiKutusu({ satirlar, altBilgi }: BilgiKutusuProps) {
    return (
        <div className="rounded-md bg-gray-50 p-3 text-sm">
            <dl className="space-y-1">
                {satirlar
                    .filter(([, deger]) => deger)
                    .map(([etiket, deger]) => (
                        <div key={etiket} className="grid grid-cols-[80px_1fr] gap-2">
                            <dt className="text-gray-500">{etiket}</dt>
                            <dd className="whitespace-pre-line">{deger}</dd>
                        </div>
                    ))}
            </dl>
            {altBilgi && <p className="mt-2 text-xs text-gray-500">{altBilgi}</p>}
        </div>
    );
}
