// src/app/admin/(panel)/kargolar/KargoFisi.tsx
// A5 yatay (210 × 148 mm) kargo gönderi formu. Önizleme, detay sayfası ve yazdırmada aynı bileşen kullanılır.
import Image from "next/image";
import { ODEME_TIPLERI, type OdemeTipi } from "@/lib/schemas/kargo";

export type KargoFisiVerisi = {
    gonderici: {
        firma_adi: string;
        gonderici_adi: string;
        telefon: string;
        adres: string;
        vkn: string | null;
    };
    alici: {
        adi: string;
        firma: string | null;
        telefon: string | null;
        adres: string;
    };
    odeme_tipi: OdemeTipi;
    tarih: string; // ekranda gösterilecek hazır metin
    no?: string; // kaydedilmemiş önizlemede yok
};

export default function KargoFisi({ veri }: { veri: KargoFisiVerisi }) {
    const odeme = ODEME_TIPLERI[veri.odeme_tipi];
    const gondericiAdiFarkli = veri.gonderici.gonderici_adi !== veri.gonderici.firma_adi;

    return (
        <div className="kargo-fisi mx-auto flex h-[148mm] w-[210mm] shrink-0 flex-col overflow-hidden bg-white p-[7mm] text-black shadow-lg [print-color-adjust:exact] print:shadow-none">
            {/* Başlık: logo | form adı, tarih, no | ödeme tipi */}
            <div className="flex items-center gap-[5mm] border-b-2 border-[var(--color-secondary)] pb-[3mm]">
                <Image src="/logo/logo.png" alt="Kasırga Bilgisayar" width={150} height={50} loading="eager" className="h-[12mm] w-auto" />
                <div className="flex-1">
                    <p className="text-[12pt] font-bold tracking-wide text-[var(--color-secondary)]">KARGO GÖNDERİ FORMU</p>
                    <p className="text-[8pt] text-gray-600">
                        {veri.tarih}
                        {veri.no && <> · No: {veri.no}</>}
                    </p>
                </div>
                <div className="rounded-md border-2 border-[var(--color-primary)] px-[4mm] py-[1.5mm] text-center">
                    <p className="text-[7pt] font-semibold uppercase tracking-wider text-gray-600">Ödeme Tipi</p>
                    <p className="text-[15pt] font-bold leading-tight text-[var(--color-primary)]">{odeme.kisa}</p>
                    <p className="text-[8pt] font-semibold text-[var(--color-primary)]">{odeme.uzun}</p>
                </div>
            </div>

            {/* Gönderici (dar) | Alıcı (geniş) */}
            <div className="mt-[4mm] grid min-h-0 flex-1 grid-cols-[2fr_3fr] gap-[4mm]">
                <section className="flex flex-col rounded-md border border-gray-400">
                    <h2 className="bg-[var(--color-secondary)] px-[3mm] py-[1.5mm] text-[9pt] font-bold tracking-wider text-white">
                        GÖNDERİCİ
                    </h2>
                    <dl className="space-y-[1.5mm] px-[3mm] py-[2.5mm] text-[9pt]">
                        <Satir etiket="Firma" deger={veri.gonderici.firma_adi} kalin />
                        {gondericiAdiFarkli && <Satir etiket="Gönderen" deger={veri.gonderici.gonderici_adi} />}
                        <Satir etiket="Telefon" deger={veri.gonderici.telefon} />
                        <Satir etiket="Adres" deger={veri.gonderici.adres} />
                        {veri.gonderici.vkn && (
                            <Satir etiket={veri.gonderici.vkn.length === 11 ? "TCKN" : "VKN"} deger={veri.gonderici.vkn} />
                        )}
                    </dl>
                </section>

                {/* Alıcı: kargo görevlisinin en çok baktığı alan, daha büyük yazılır */}
                <section className="flex flex-col rounded-md border-2 border-black">
                    <h2 className="bg-black px-[3mm] py-[1.5mm] text-[10pt] font-bold tracking-wider text-white">ALICI</h2>
                    <dl className="space-y-[2mm] px-[3mm] py-[3mm] text-[12.5pt]">
                        <Satir etiket="Ad Soyad" deger={veri.alici.adi} kalin />
                        {veri.alici.firma && <Satir etiket="Firma" deger={veri.alici.firma} />}
                        {veri.alici.telefon && <Satir etiket="Telefon" deger={veri.alici.telefon} kalin />}
                        <Satir etiket="Adres" deger={veri.alici.adres} />
                    </dl>
                </section>
            </div>

            <p className="mt-[2.5mm] text-center text-[7pt] text-gray-500">
                Kasırga Bilgisayar · Güvenin Başkenti
            </p>
        </div>
    );
}

function Satir({ etiket, deger, kalin }: { etiket: string; deger: string; kalin?: boolean }) {
    return (
        <div className="grid grid-cols-[22mm_1fr] gap-[2mm]">
            <dt className="text-[0.8em] font-medium uppercase text-gray-500">{etiket}</dt>
            <dd className={kalin ? "font-bold" : undefined} style={{ whiteSpace: "pre-line" }}>
                {deger}
            </dd>
        </div>
    );
}

// Bu bileşeni içeren sayfada yazdırma A5 yatay ve kenar boşluksuz yapılır.
export function A5YazdirmaStili() {
    return <style>{`@page { size: A5 landscape; margin: 0; }`}</style>;
}
