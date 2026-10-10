// src/app/admin/(panel)/kargolar/[id]/VerilisTarihiFormu.tsx
"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { kargoyaVerilisTarihiKaydet } from "@/actions/kargo";
import { bugunISO } from "@/lib/tarih";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { inputSinifi } from "../../../_components/form";

type Props = {
    id: string;
    tarih: string | null;
};

export default function VerilisTarihiFormu({ id, tarih }: Props) {
    const [deger, setDeger] = useState(tarih ?? "");
    const [hata, setHata] = useState<string>();
    const [kaydedildi, setKaydedildi] = useState(false);
    const [bekliyor, startTransition] = useTransition();

    const kaydet = (yeni: string) => {
        setDeger(yeni);
        setHata(undefined);
        setKaydedildi(false);
        startTransition(async () => {
            const sonuc = await kargoyaVerilisTarihiKaydet(id, yeni);
            if (sonuc?.hata) setHata(sonuc.hata);
            else setKaydedildi(true);
        });
    };

    const degisti = deger !== (tarih ?? "");

    return (
        <div className="space-y-2">
            <Label htmlFor="verilis_tarihi">Kargoya Veriliş Tarihi</Label>
            <div className="flex gap-2">
                <input
                    id="verilis_tarihi"
                    type="date"
                    value={deger}
                    max={bugunISO()}
                    onChange={(e) => {
                        setDeger(e.target.value);
                        setKaydedildi(false);
                    }}
                    className={inputSinifi}
                />
                <Button type="button" size="icon" onClick={() => kaydet(deger)} disabled={bekliyor || !degisti} title="Kaydet">
                    {bekliyor ? <Loader2 className="animate-spin" /> : <Check />}
                </Button>
            </div>
            <div className="flex gap-3 text-xs">
                {!deger && (
                    <button type="button" onClick={() => kaydet(bugunISO())} className="text-[var(--color-secondary)] underline">
                        Bugün kargoya verildi
                    </button>
                )}
                {deger && (
                    <button type="button" onClick={() => kaydet("")} className="text-gray-500 underline">
                        Tarihi temizle
                    </button>
                )}
                {kaydedildi && !degisti && <span className="text-green-600">Kaydedildi</span>}
            </div>
            {hata && <p className="text-xs text-[var(--color-primary)]">{hata}</p>}
        </div>
    );
}
