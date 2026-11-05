// src/app/admin/(panel)/donanim/GuncelleButonu.tsx
// UserBenchmark CSV'lerini hemen indirip puanları günceller (haftalık otomatik güncellemeyi beklemeden).
"use client";

import { useState, useTransition } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { donanimGuncelle } from "@/actions/donanim";
import { Button } from "@/components/ui/button";

export default function GuncelleButonu() {
    const [bekliyor, startTransition] = useTransition();
    const [mesaj, setMesaj] = useState<{ hata: boolean; metin: string }>();

    function guncelle() {
        setMesaj(undefined);
        startTransition(async () => {
            const sonuc = await donanimGuncelle();
            if (!("ozet" in sonuc)) return setMesaj({ hata: true, metin: sonuc.hata });
            const toplam = Object.values(sonuc.ozet).reduce((t, n) => t + (n ?? 0), 0).toLocaleString("tr-TR");
            setMesaj(
                sonuc.basarili
                    ? { hata: false, metin: `${toplam} kayıt güncellendi.` }
                    : { hata: true, metin: `Kısmen güncellendi (${toplam} kayıt). ${sonuc.hata ?? ""}` },
            );
        });
    }

    return (
        <div className="flex flex-col items-end gap-1">
            <Button type="button" variant="outline" onClick={guncelle} disabled={bekliyor}>
                {bekliyor ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                {bekliyor ? "Güncelleniyor..." : "Şimdi Güncelle"}
            </Button>
            {mesaj && (
                <p role="status" className={mesaj.hata ? "max-w-xs text-right text-xs text-[var(--color-primary)]" : "text-xs text-green-700"}>
                    {mesaj.metin}
                </p>
            )}
        </div>
    );
}
