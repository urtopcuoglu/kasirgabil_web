// src/app/admin/(panel)/icerik/kategoriler/BlogKategoriSatiri.tsx
"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Pencil, Plus, X } from "lucide-react";
import { blogKategoriKaydet, blogKategoriSil } from "@/actions/icerik";
import type { BlogKategori } from "@/lib/schemas/icerik";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { inputSinifi } from "../../../_components/form";
import SilButonu from "../../../_components/SilButonu";

export default function BlogKategoriSatiri({ kategori, yaziSayisi }: { kategori: BlogKategori; yaziSayisi: number }) {
    const [duzenleniyor, setDuzenleniyor] = useState(false);

    if (duzenleniyor) return <KategoriAdiFormu id={kategori.id} ilkDeger={kategori.ad} bitti={() => setDuzenleniyor(false)} />;

    return (
        <div className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
                <p className="font-medium">{kategori.ad}</p>
                <p className="text-xs text-gray-500">
                    <span className="font-mono">/blog?kategori={kategori.slug}</span> · {yaziSayisi} yazı
                </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setDuzenleniyor(true)} title="Yeniden adlandır">
                <Pencil />
            </Button>
            <SilButonu
                onay={
                    yaziSayisi > 0
                        ? `"${kategori.ad}" silinsin mi? Bu kategorideki ${yaziSayisi} yazı silinmez, kategorisiz kalır.`
                        : `"${kategori.ad}" silinsin mi?`
                }
                sil={blogKategoriSil.bind(null, kategori.id)}
            />
        </div>
    );
}

export function YeniBlogKategoriFormu() {
    return <KategoriAdiFormu id={null} ilkDeger="" />;
}

function KategoriAdiFormu({ id, ilkDeger, bitti }: { id: string | null; ilkDeger: string; bitti?: () => void }) {
    const [ad, setAd] = useState(ilkDeger);
    const [hata, setHata] = useState<string>();
    const [bekliyor, startTransition] = useTransition();

    const kaydet = (e: React.FormEvent) => {
        e.preventDefault();
        setHata(undefined);
        startTransition(async () => {
            const sonuc = await blogKategoriKaydet(id, ad);
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
                    placeholder={id ? undefined : "Yeni kategori adı (örn. Donanım Rehberi)"}
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
