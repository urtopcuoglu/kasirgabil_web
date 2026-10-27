// src/app/admin/(panel)/stok/SiteGorselleri.tsx
// Ürünün web sitesi görselleri: çoklu yükleme, kaldırma ve kapak seçimi (ilk görsel kapaktır).
"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
import { gorselYukle } from "@/lib/gorsel-yukle";
import { SITE_GORSEL_BOYUTU, SITE_GORSEL_KLASORU, SITE_GORSEL_SAYISI } from "@/lib/schemas/stok";
import { cn } from "@/lib/utils";

type Props = {
    id: string;
    gorseller: string[];
    onChange: (gorseller: string[]) => void;
    gecersiz?: boolean;
};

export default function SiteGorselleri({ id, gorseller, onChange, gecersiz }: Props) {
    const girdi = useRef<HTMLInputElement>(null);
    const [yukleniyor, setYukleniyor] = useState(0);
    const [hata, setHata] = useState<string>();
    const kalan = SITE_GORSEL_SAYISI - gorseller.length;

    async function sec(e: React.ChangeEvent<HTMLInputElement>) {
        const dosyalar = [...(e.target.files ?? [])];
        e.target.value = "";
        if (dosyalar.length === 0) return;
        setHata(dosyalar.length > kalan ? `En fazla ${SITE_GORSEL_SAYISI} görsel eklenebilir; fazlası alınmadı.` : undefined);

        const secilen = dosyalar.slice(0, kalan);
        setYukleniyor(secilen.length);
        // Hepsi paralel yüklenir; başarısız olanın hatası gösterilir, diğerleri eklenir.
        const sonuclar = await Promise.allSettled(secilen.map((d) => gorselYukle(d, SITE_GORSEL_KLASORU, SITE_GORSEL_BOYUTU)));
        setYukleniyor(0);

        const yuklenen = sonuclar.flatMap((s) => (s.status === "fulfilled" ? [s.value] : []));
        const basarisiz = sonuclar.find((s): s is PromiseRejectedResult => s.status === "rejected");
        if (basarisiz) setHata(basarisiz.reason instanceof Error ? basarisiz.reason.message : "Görsel yüklenemedi.");
        if (yuklenen.length) onChange([...gorseller, ...yuklenen]);
    }

    const kaldir = (adres: string) => onChange(gorseller.filter((g) => g !== adres));
    const kapakYap = (adres: string) => onChange([adres, ...gorseller.filter((g) => g !== adres)]);

    return (
        <div className="space-y-2">
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {gorseller.map((g, i) => (
                    <li key={g} className={cn("group relative aspect-square overflow-hidden rounded-md border bg-gray-50", i === 0 && "ring-2 ring-green-600")}>
                        {/* Depodaki görsel; önizleme için düz img yeterli. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={g} alt="" className="size-full object-contain" />
                        {i === 0 ? (
                            <span className="absolute bottom-1 left-1 rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">Kapak</span>
                        ) : (
                            <button
                                type="button"
                                onClick={() => kapakYap(g)}
                                title="Kapak yap"
                                aria-label="Kapak yap"
                                className="absolute bottom-1 left-1 rounded bg-white/90 p-1 text-gray-600 shadow-sm hover:text-green-700"
                            >
                                <Star className="size-3.5" />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => kaldir(g)}
                            title="Kaldır"
                            aria-label="Görseli kaldır"
                            className="absolute right-1 top-1 rounded bg-white/90 p-1 text-gray-600 shadow-sm hover:text-[var(--color-primary)]"
                        >
                            <X className="size-3.5" />
                        </button>
                    </li>
                ))}
                {Array.from({ length: yukleniyor }, (_, i) => (
                    <li key={`yukleniyor-${i}`} className="flex aspect-square items-center justify-center rounded-md border bg-gray-50">
                        <Loader2 className="size-5 animate-spin text-[var(--color-secondary)]" />
                    </li>
                ))}
                {kalan > 0 && !yukleniyor && (
                    <li>
                        <button
                            type="button"
                            onClick={() => girdi.current?.click()}
                            className={cn(
                                "flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed text-xs text-gray-500 transition hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)]",
                                gecersiz && "border-[var(--color-primary)] text-[var(--color-primary)]"
                            )}
                        >
                            <ImagePlus className="size-5" />
                            Görsel ekle
                        </button>
                    </li>
                )}
            </ul>
            <input
                ref={girdi}
                id={id}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={sec}
            />
            <p className="text-xs text-gray-500">
                JPG, PNG veya WEBP · görsel başına en fazla {SITE_GORSEL_BOYUTU / 1024 / 1024} MB · en fazla {SITE_GORSEL_SAYISI} görsel. İşaretli
                görsel kapaktır.
            </p>
            {hata && <p className="text-xs text-[var(--color-primary)]">{hata}</p>}
        </div>
    );
}
