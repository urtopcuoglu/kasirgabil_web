// src/app/admin/(panel)/rehber/kategoriler/KategoriSatiri.tsx
"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Lock, Pencil, Plus, X } from "lucide-react";
import { rehberKategoriKaydet, rehberKategoriSil } from "@/actions/rehber";
import type { RehberKategori } from "@/lib/schemas/rehber";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { inputSinifi } from "../../../_components/form";
import SilButonu from "../../../_components/SilButonu";

type Props = {
    kategori: RehberKategori;
    kisiSayisi: number;
};

export default function KategoriSatiri({ kategori, kisiSayisi }: Props) {
    const [duzenleniyor, setDuzenleniyor] = useState(false);

    if (duzenleniyor) {
        return (
            <KategoriAdiFormu
                id={kategori.id}
                ilkDeger={kategori.ad}
                bitti={() => setDuzenleniyor(false)}
            />
        );
    }

    return (
        <div className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-medium">
                    {kategori.ad}
                    {kategori.sistem && <Lock className="size-3.5 text-gray-400" aria-label="Sistem kategorisi" />}
                </p>
                <p className="text-xs text-gray-500">{kisiSayisi} kişi</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setDuzenleniyor(true)} title="Yeniden adlandır">
                <Pencil />
            </Button>
            {!kategori.sistem && (
                <SilButonu
                    onay={
                        kisiSayisi > 0
                            ? `"${kategori.ad}" silinsin mi? Bu kategorideki ${kisiSayisi} kişi silinmez, kategorisiz kalır.`
                            : `"${kategori.ad}" silinsin mi?`
                    }
                    sil={rehberKategoriSil.bind(null, kategori.id)}
                />
            )}
        </div>
    );
}

export function YeniKategoriFormu() {
    return <KategoriAdiFormu id={null} ilkDeger="" />;
}

type FormProps = {
    id: string | null;
    ilkDeger: string;
    bitti?: () => void;
};

function KategoriAdiFormu({ id, ilkDeger, bitti }: FormProps) {
    const [ad, setAd] = useState(ilkDeger);
    const [hata, setHata] = useState<string>();
    const [bekliyor, startTransition] = useTransition();

    const kaydet = (e: React.FormEvent) => {
        e.preventDefault();
        setHata(undefined);
        startTransition(async () => {
            const sonuc = await rehberKategoriKaydet(id, ad);
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
                    placeholder={id ? undefined : "Yeni kategori adı"}
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
