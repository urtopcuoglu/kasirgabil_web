// src/app/admin/(panel)/kasa/kategoriler/KasaKategoriSatiri.tsx
"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Lock, Pencil, Plus, X } from "lucide-react";
import { kasaKategoriKaydet, kasaKategoriSil } from "@/actions/kasa";
import type { KasaKategori, KasaTipi } from "@/lib/schemas/kasa";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { inputSinifi } from "../../../_components/form";
import SilButonu from "../../../_components/SilButonu";

export default function KasaKategoriSatiri({ kategori, hareketSayisi }: { kategori: KasaKategori; hareketSayisi: number }) {
    const [duzenleniyor, setDuzenleniyor] = useState(false);

    if (duzenleniyor) {
        return <KategoriAdiFormu id={kategori.id} tip={kategori.tip} ilkDeger={kategori.ad} bitti={() => setDuzenleniyor(false)} />;
    }

    return (
        <div className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-medium">
                    {kategori.ad}
                    {kategori.sistem && <Lock className="size-3.5 text-gray-400" aria-label="Sistem kategorisi" />}
                </p>
                <p className="text-xs text-gray-500">{hareketSayisi} hareket</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setDuzenleniyor(true)} title="Yeniden adlandır">
                <Pencil />
            </Button>
            {!kategori.sistem && hareketSayisi === 0 && (
                <SilButonu onay={`"${kategori.ad}" silinsin mi?`} sil={kasaKategoriSil.bind(null, kategori.id)} />
            )}
        </div>
    );
}

export function YeniKasaKategoriFormu({ tip }: { tip: KasaTipi }) {
    return <KategoriAdiFormu id={null} tip={tip} ilkDeger="" />;
}

function KategoriAdiFormu({ id, tip, ilkDeger, bitti }: { id: string | null; tip: KasaTipi; ilkDeger: string; bitti?: () => void }) {
    const [ad, setAd] = useState(ilkDeger);
    const [hata, setHata] = useState<string>();
    const [bekliyor, startTransition] = useTransition();

    const kaydet = (e: React.FormEvent) => {
        e.preventDefault();
        setHata(undefined);
        startTransition(async () => {
            const sonuc = await kasaKategoriKaydet(id, ad, tip);
            if (sonuc?.hata) {
                setHata(sonuc.hata);
                return;
            }
            if (id) bitti?.();
            else setAd("");
        });
    };

    return (
        <form onSubmit={kaydet} className={cn("px-4 py-3", !id && "bg-gray-50")}>
            <div className="flex items-center gap-2">
                <input
                    value={ad}
                    onChange={(e) => setAd(e.target.value)}
                    placeholder={id ? undefined : `Yeni ${tip} kategorisi`}
                    autoFocus={!!id}
                    aria-invalid={!!hata}
                    aria-label="Kategori adı"
                    className={inputSinifi}
                />
                <Button type="submit" size={id ? "icon" : "default"} disabled={bekliyor || !ad.trim()} title="Kaydet">
                    {bekliyor ? <Loader2 className="animate-spin" /> : id ? <Check /> : <Plus />}
                    {!id && "Ekle"}
                </Button>
                {id && (
                    <Button type="button" variant="ghost" size="icon" onClick={bitti} title="Vazgeç">
                        <X />
                    </Button>
                )}
            </div>
            {hata && <p className="mt-1 text-xs text-[var(--color-primary)]">{hata}</p>}
        </form>
    );
}
