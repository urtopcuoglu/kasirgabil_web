// src/app/admin/(panel)/stok/[id]/DonanimPuaniKarti.tsx
// Ürün sayfasındaki UserBenchmark kartı: bağlı donanımı veya otomatik öneriyi gösterir; yetkili kullanıcı
// öneriyi onaylar, aramayla başka kayıt seçer ya da bağlantıyı kaldırır.
"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Pencil, Unlink, X } from "lucide-react";
import { urunDonanimBagla } from "@/actions/donanim";
import type { DonanimPuani } from "@/lib/donanim-puanlari";
import { Button } from "@/components/ui/button";
import DonanimArama from "../../donanim/DonanimArama";
import { DonanimOzeti } from "../../donanim/DonanimParcalari";

type Props = {
    urunId: string;
    aramaOnerisi: string; // "Değiştir" açılınca arama kutusuna yazılan metin (marka + model)
    bagli: DonanimPuani | null;
    oneri: DonanimPuani | null;
    duzenlenebilir: boolean;
};

export default function DonanimPuaniKarti({ urunId, aramaOnerisi, bagli, oneri, duzenlenebilir }: Props) {
    const [aramaAcik, setAramaAcik] = useState(false);
    const [hata, setHata] = useState<string>();
    const [bekliyor, startTransition] = useTransition();

    function bagla(puanId: string | null) {
        setHata(undefined);
        startTransition(async () => {
            const sonuc = await urunDonanimBagla(urunId, puanId);
            if (sonuc?.hata) return setHata(sonuc.hata);
            setAramaAcik(false);
        });
    }

    const gosterilen = bagli ?? oneri;

    return (
        <div className="space-y-3">
            {gosterilen ? (
                <>
                    {!bagli && (
                        <p className="rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800">
                            Otomatik öneri (ürün adındaki model numarasından). Doğruysa onaylayın.
                        </p>
                    )}
                    <DonanimOzeti p={gosterilen} />
                </>
            ) : (
                <p className="text-sm text-gray-500">Bu ürün için eşleşen işlemci, ekran kartı veya depolama kaydı bulunamadı.</p>
            )}

            {duzenlenebilir && !aramaAcik && (
                <div className="flex flex-wrap gap-2">
                    {!bagli && oneri && (
                        <Button type="button" size="sm" variant="outline" onClick={() => bagla(oneri.id)} disabled={bekliyor}>
                            {bekliyor ? <Loader2 className="animate-spin" /> : <Check />} Öneriyi onayla
                        </Button>
                    )}
                    <Button type="button" size="sm" variant="outline" onClick={() => setAramaAcik(true)} disabled={bekliyor}>
                        <Pencil /> {gosterilen ? "Değiştir" : "Elle eşleştir"}
                    </Button>
                    {bagli && (
                        <Button type="button" size="sm" variant="ghost" onClick={() => bagla(null)} disabled={bekliyor}>
                            <Unlink /> Kaldır
                        </Button>
                    )}
                </div>
            )}

            {aramaAcik && (
                <div className="space-y-2 rounded-md border border-dashed p-3">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-600">Donanım kaydı seçin</p>
                        <button type="button" onClick={() => setAramaAcik(false)} aria-label="Kapat" className="rounded p-0.5 hover:bg-gray-100">
                            <X className="size-4" />
                        </button>
                    </div>
                    <DonanimArama baslangic={aramaOnerisi} onSec={(p) => bagla(p.id)} secimEtiketi="Bağla" otomatikOdak />
                </div>
            )}

            {hata && <p className="text-xs text-[var(--color-primary)]">{hata}</p>}
        </div>
    );
}
