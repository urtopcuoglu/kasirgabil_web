// src/app/admin/(panel)/stok/[id]/StokPaneli.tsx
"use client";

import { useState, useTransition } from "react";
import { Loader2, MinusCircle, Save } from "lucide-react";
import { stokHareketiEkle } from "@/actions/stok";
import { HAREKET_TIPLERI, type HareketTipi } from "@/lib/schemas/stok";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { anaButonSinifi, FormHatasi, inputSinifi } from "../../../_components/form";

export default function StokPaneli({ urunId, stokAdedi }: { urunId: string; stokAdedi: number }) {
    const [tip, setTip] = useState<HareketTipi>("cikis");
    const [miktar, setMiktar] = useState("1");
    const [aciklama, setAciklama] = useState("");
    const [hata, setHata] = useState<string>();
    const [bekliyor, startTransition] = useTransition();

    const calistir = (t: HareketTipi, adet: number, not: string) => {
        setHata(undefined);
        startTransition(async () => {
            const sonuc = await stokHareketiEkle(urunId, t, adet, not);
            if (sonuc?.hata) setHata(sonuc.hata);
            else {
                setAciklama("");
                setMiktar(t === "sayim" ? "" : "1");
            }
        });
    };

    const kaydet = (e: React.FormEvent) => {
        e.preventDefault();
        calistir(tip, Number(miktar), aciklama);
    };

    return (
        <div className="space-y-4">
            <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={bekliyor || stokAdedi === 0}
                onClick={() => calistir("cikis", 1, "Hızlı düşüm")}
            >
                {bekliyor ? <Loader2 className="animate-spin" /> : <MinusCircle />} 1 adet düş
            </Button>

            <form onSubmit={kaydet} className="space-y-3 border-t pt-4">
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="hareket_tipi">Hareket</Label>
                        <select
                            id="hareket_tipi"
                            value={tip}
                            onChange={(e) => {
                                const t = e.target.value as HareketTipi;
                                setTip(t);
                                setMiktar(t === "sayim" ? String(stokAdedi) : "1");
                            }}
                            className={inputSinifi}
                        >
                            {Object.entries(HAREKET_TIPLERI).map(([deger, etiket]) => (
                                <option key={deger} value={deger}>
                                    {etiket}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="hareket_miktar">{tip === "sayim" ? "Sayılan adet" : "Adet"}</Label>
                        <input
                            id="hareket_miktar"
                            type="number"
                            min={tip === "sayim" ? 0 : 1}
                            step={1}
                            value={miktar}
                            onChange={(e) => setMiktar(e.target.value)}
                            className={inputSinifi}
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="hareket_aciklama">Açıklama (opsiyonel)</Label>
                    <input
                        id="hareket_aciklama"
                        value={aciklama}
                        onChange={(e) => setAciklama(e.target.value)}
                        maxLength={300}
                        placeholder="Örn. Pazaryeri satışı, servis #12'de kullanıldı"
                        className={inputSinifi}
                    />
                </div>
                <FormHatasi mesaj={hata} />
                <Button type="submit" disabled={bekliyor || miktar === ""} className={`w-full ${anaButonSinifi}`}>
                    {bekliyor ? <Loader2 className="animate-spin" /> : <Save />} Hareketi Kaydet
                </Button>
            </form>
        </div>
    );
}
