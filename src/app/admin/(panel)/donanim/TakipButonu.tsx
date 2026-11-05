// src/app/admin/(panel)/donanim/TakipButonu.tsx
// Parçayı takip listesine ekler / çıkarır (sıra ve puan değişimleri Takip Listesi sekmesinde izlenir).
"use client";

import { useOptimistic, useTransition } from "react";
import { Star } from "lucide-react";
import { donanimTakip } from "@/actions/donanim";
import { cn } from "@/lib/utils";

export default function TakipButonu({ puanId, takipte, pasif }: { puanId: string; takipte: boolean; pasif?: boolean }) {
    const [bekliyor, startTransition] = useTransition();
    const [durum, setDurum] = useOptimistic(takipte);

    function degistir() {
        startTransition(async () => {
            setDurum(!durum);
            const sonuc = await donanimTakip(puanId, !durum);
            if (sonuc?.hata) alert(sonuc.hata);
        });
    }

    const etiket = durum ? "Takipten çıkar" : "Takip et";
    return (
        <button
            type="button"
            onClick={degistir}
            disabled={pasif || bekliyor}
            title={pasif ? "Takip listesini düzenleme yetkiniz yok" : etiket}
            aria-label={etiket}
            aria-pressed={durum}
            className="rounded p-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
            <Star className={cn("size-4", durum ? "fill-amber-400 text-amber-500" : "text-gray-400")} />
        </button>
    );
}
