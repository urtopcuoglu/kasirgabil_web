// src/app/admin/(panel)/stok/markalar/MarkaModelIslemleri.tsx
// Marka & Model panelinin satır içi işlemleri: yeni kayıt ekleme ve yeniden adlandırma (birleştirme).
"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Pencil, Plus, X } from "lucide-react";
import type { IslemSonucu } from "@/actions/personel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { inputSinifi } from "../../../_components/form";

export function AdEkleFormu({
    ekle,
    yerTutucu,
    etiket,
    enFazla,
}: {
    ekle: (ad: string) => Promise<IslemSonucu>;
    yerTutucu: string;
    etiket: string;
    enFazla: number;
}) {
    const [ad, setAd] = useState("");
    const [hata, setHata] = useState<string>();
    const [bekliyor, startTransition] = useTransition();

    function gonder(e: React.FormEvent) {
        e.preventDefault();
        setHata(undefined);
        startTransition(async () => {
            const sonuc = await ekle(ad);
            if (sonuc?.hata) return setHata(sonuc.hata);
            setAd("");
        });
    }

    return (
        <form onSubmit={gonder} className="space-y-1">
            <div className="flex gap-2">
                <input
                    value={ad}
                    onChange={(e) => setAd(e.target.value)}
                    maxLength={enFazla}
                    placeholder={yerTutucu}
                    aria-label={yerTutucu}
                    className={cn(inputSinifi, "py-1.5")}
                />
                <Button type="submit" variant="outline" className="h-[34px] shrink-0" disabled={bekliyor || !ad.trim()}>
                    {bekliyor ? <Loader2 className="animate-spin" /> : <Plus />} {etiket}
                </Button>
            </div>
            {hata && <p className="text-xs text-[var(--color-primary)]">{hata}</p>}
        </form>
    );
}

// Kalem ikonuyla satır içi düzenleme. Ürün/kutularda kullanılıyorsa kaydetmeden önce kaç kaydın değişeceği sorulur.
export function YenidenAdlandir({
    ad,
    kaydet,
    enFazla,
    etkilenen,
}: {
    ad: string;
    kaydet: (ad: string) => Promise<IslemSonucu>;
    enFazla: number;
    etkilenen: { urun: number; kutu: number }; // adı değişecek ürün ve kutu sayısı
}) {
    const [duzenleniyor, setDuzenleniyor] = useState(false);
    const [yeni, setYeni] = useState(ad);
    const [hata, setHata] = useState<string>();
    const [bekliyor, startTransition] = useTransition();

    function iptal() {
        setDuzenleniyor(false);
        setYeni(ad);
        setHata(undefined);
    }

    function gonder(e: React.FormEvent) {
        e.preventDefault();
        const temiz = yeni.trim().replace(/\s+/g, " ");
        if (!temiz || temiz === ad) return iptal();

        // Yeni ad mevcut bir kayda denk geliyorsa veritabanı ikisini birleştirir (sayfada not olarak belirtilir).
        if (
            (etkilenen.urun > 0 || etkilenen.kutu > 0) &&
            !window.confirm(
                `${etkilenen.urun} ürün${etkilenen.kutu ? ` ve ${etkilenen.kutu} kutu` : ""} üzerindeki ad da “${temiz}” olarak değişecek. Devam edilsin mi?`,
            )
        ) {
            return;
        }

        setHata(undefined);
        startTransition(async () => {
            const sonuc = await kaydet(temiz);
            if (sonuc?.hata) return setHata(sonuc.hata);
            setDuzenleniyor(false);
        });
    }

    if (!duzenleniyor) {
        return (
            <Button type="button" variant="ghost" size="icon" onClick={() => setDuzenleniyor(true)} aria-label={`${ad} adını değiştir`} title="Yeniden adlandır / birleştir">
                <Pencil />
            </Button>
        );
    }

    return (
        <form onSubmit={gonder} className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
                <input
                    autoFocus
                    value={yeni}
                    onChange={(e) => setYeni(e.target.value)}
                    onKeyDown={(e) => e.key === "Escape" && iptal()}
                    maxLength={enFazla}
                    aria-label="Yeni ad"
                    className={cn(inputSinifi, "w-44 py-1")}
                />
                <Button type="submit" variant="ghost" size="icon" disabled={bekliyor} aria-label="Kaydet" title="Kaydet">
                    {bekliyor ? <Loader2 className="animate-spin" /> : <Check />}
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={iptal} aria-label="Vazgeç" title="Vazgeç">
                    <X />
                </Button>
            </div>
            {hata && <p className="max-w-xs text-right text-xs text-[var(--color-primary)]">{hata}</p>}
        </form>
    );
}
