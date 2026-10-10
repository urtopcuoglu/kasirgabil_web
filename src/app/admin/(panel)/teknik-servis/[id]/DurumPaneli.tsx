// src/app/admin/(panel)/teknik-servis/[id]/DurumPaneli.tsx
"use client";

import { useState, useTransition } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { servisDurumDegistir } from "@/actions/servis";
import { DURUM_KODLARI, SERVIS_DURUMLARI, type ServisDurumu } from "@/lib/schemas/servis";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { anaButonSinifi, FormHatasi, inputSinifi } from "../../../_components/form";

type Props = {
    servisId: string;
    mevcutDurum: ServisDurumu;
};

export default function DurumPaneli({ servisId, mevcutDurum }: Props) {
    const [durum, setDurum] = useState<ServisDurumu>(mevcutDurum);
    const [aciklama, setAciklama] = useState("");
    const [hata, setHata] = useState<string>();
    const [bekliyor, startTransition] = useTransition();

    // Durum aynı kalsa bile açıklama yazılırsa geçmişe not olarak eklenir.
    const gonderilebilir = durum !== mevcutDurum || aciklama.trim() !== "";

    const kaydet = (e: React.FormEvent) => {
        e.preventDefault();
        setHata(undefined);
        startTransition(async () => {
            const sonuc = await servisDurumDegistir(servisId, durum, aciklama);
            if (sonuc?.hata) setHata(sonuc.hata);
            else setAciklama("");
        });
    };

    return (
        <form onSubmit={kaydet} className="space-y-3">
            <div className="space-y-1.5">
                <Label htmlFor="yeni_durum">Durumu Değiştir</Label>
                <select
                    id="yeni_durum"
                    value={durum}
                    onChange={(e) => setDurum(e.target.value as ServisDurumu)}
                    className={inputSinifi}
                >
                    {DURUM_KODLARI.map((d) => (
                        <option key={d} value={d}>
                            {SERVIS_DURUMLARI[d].etiket}
                            {d === mevcutDurum ? " (mevcut)" : ""}
                        </option>
                    ))}
                </select>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="durum_aciklama">Açıklama (opsiyonel)</Label>
                <textarea
                    id="durum_aciklama"
                    rows={2}
                    value={aciklama}
                    onChange={(e) => setAciklama(e.target.value)}
                    maxLength={500}
                    placeholder="Örn. Ekran siparişi verildi. Sadece panelde görünür."
                    className={inputSinifi}
                />
            </div>
            <FormHatasi mesaj={hata} />
            <Button type="submit" disabled={bekliyor || !gonderilebilir} className={`w-full ${anaButonSinifi}`}>
                {bekliyor ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                {durum === mevcutDurum ? "Not Ekle" : "Durumu Güncelle"}
            </Button>
        </form>
    );
}
