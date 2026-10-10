// src/app/admin/_components/icerik/GorselSecici.tsx
// Tek görsel alanı: önizleme + yükle / değiştir / kaldır.
"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { gorselYukle } from "@/lib/gorsel-yukle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
    id: string;
    deger: string;
    onChange: (url: string) => void;
    klasor: string; // depoda alt klasör (blog, slider, banka...)
    oran?: string; // önizleme kutusunun en/boy sınıfı
};

export default function GorselSecici({ id, deger, onChange, klasor, oran = "aspect-video" }: Props) {
    const girdi = useRef<HTMLInputElement>(null);
    const [yukleniyor, setYukleniyor] = useState(false);
    const [hata, setHata] = useState<string>();

    async function sec(e: React.ChangeEvent<HTMLInputElement>) {
        const dosya = e.target.files?.[0];
        e.target.value = "";
        if (!dosya) return;
        setHata(undefined);
        setYukleniyor(true);
        try {
            onChange(await gorselYukle(dosya, klasor));
        } catch (err) {
            setHata(err instanceof Error ? err.message : "Görsel yüklenemedi.");
        } finally {
            setYukleniyor(false);
        }
    }

    return (
        <div className="space-y-2">
            <div className={cn("relative overflow-hidden rounded-md border bg-gray-50", oran)}>
                {deger ? (
                    // Yüklenen görsel farklı alan adında olabilir; önizleme için düz img yeterli.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={deger} alt="" className="size-full object-contain" />
                ) : (
                    <div className="flex size-full items-center justify-center text-xs text-gray-400">Görsel yok</div>
                )}
                {yukleniyor && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                        <Loader2 className="size-6 animate-spin text-[var(--color-secondary)]" />
                    </div>
                )}
            </div>
            <input ref={girdi} id={id} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={sec} />
            <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" disabled={yukleniyor} onClick={() => girdi.current?.click()}>
                    <ImagePlus /> {deger ? "Değiştir" : "Görsel yükle"}
                </Button>
                {deger && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
                        <Trash2 /> Kaldır
                    </Button>
                )}
            </div>
            {hata && <p className="text-xs text-[var(--color-primary)]">{hata}</p>}
        </div>
    );
}
