// src/app/admin/(panel)/stok/kategoriler/KategoriDugumu.tsx
"use client";

import { useState, useTransition } from "react";
import { Boxes, Check, Loader2, Pencil, Plus, X } from "lucide-react";
import { kategoriKaydet, kategoriKutuSistemi, kategoriSil } from "@/actions/stok";
import type { UrunKategori } from "@/lib/schemas/stok";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { inputSinifi } from "../../../_components/form";
import SilButonu from "../../../_components/SilButonu";

type Props = {
    kategori: UrunKategori;
    derinlik: number;
    urunSayisi: number;
    altSayisi: number;
    ustteKutulu: boolean; // üst kategorilerden biri kutu sisteminde
};

export default function KategoriDugumu({ kategori, derinlik, urunSayisi, altSayisi, ustteKutulu }: Props) {
    const [mod, setMod] = useState<"normal" | "adlandir" | "alt_ekle">("normal");
    const [hata, setHata] = useState<string>();
    const [bekliyor, startTransition] = useTransition();
    const girinti = { paddingLeft: `${16 + derinlik * 24}px` };

    const kutuDegistir = () => {
        setHata(undefined);
        startTransition(async () => {
            const sonuc = await kategoriKutuSistemi(kategori.id, !kategori.kutu_sistemi);
            if (sonuc?.hata) setHata(sonuc.hata);
        });
    };

    if (mod === "adlandir") {
        return (
            <div style={girinti} className="py-2 pr-4">
                <KategoriAdiFormu id={kategori.id} ustId={null} ilkDeger={kategori.ad} bitti={() => setMod("normal")} />
            </div>
        );
    }

    return (
        <div>
            <div style={girinti} className="flex items-center gap-2 py-2 pr-4">
                <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                        {derinlik > 0 && <span className="text-gray-300">└</span>}
                        {kategori.ad}
                        {(kategori.kutu_sistemi || ustteKutulu) && (
                            <span
                                className={cn(
                                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                                    kategori.kutu_sistemi ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"
                                )}
                                title={kategori.kutu_sistemi ? "Bu kategori ve alt kategorileri kutu sisteminde" : "Üst kategoriden kutu sistemi"}
                            >
                                <Boxes className="size-3" /> Kutu sistemi
                            </span>
                        )}
                    </p>
                    <p className="text-xs text-gray-500">
                        {urunSayisi} ürün{altSayisi > 0 && ` · ${altSayisi} alt kategori`}
                    </p>
                    {hata && <p className="text-xs text-[var(--color-primary)]">{hata}</p>}
                </div>
                {!ustteKutulu && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={kutuDegistir}
                        disabled={bekliyor}
                        title={kategori.kutu_sistemi ? "Kutu sistemini kapat" : "Kutu sistemini aç (notebook yedek parça gibi)"}
                        className={cn(kategori.kutu_sistemi && "text-blue-700")}
                    >
                        {bekliyor ? <Loader2 className="animate-spin" /> : <Boxes />}
                    </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => setMod("alt_ekle")} title="Alt kategori ekle">
                    <Plus />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setMod("adlandir")} title="Yeniden adlandır">
                    <Pencil />
                </Button>
                {urunSayisi === 0 && altSayisi === 0 && (
                    <SilButonu onay={`"${kategori.ad}" kategorisi silinsin mi?`} sil={kategoriSil.bind(null, kategori.id)} />
                )}
            </div>
            {mod === "alt_ekle" && (
                <div style={{ paddingLeft: `${16 + (derinlik + 1) * 24}px` }} className="bg-gray-50 py-2 pr-4">
                    <KategoriAdiFormu id={null} ustId={kategori.id} ilkDeger="" bitti={() => setMod("normal")} />
                </div>
            )}
        </div>
    );
}

type FormProps = {
    id: string | null; // null: ustId altına yeni kategori
    ustId: string | null;
    ilkDeger: string;
    bitti?: () => void;
};

export function KategoriAdiFormu({ id, ustId, ilkDeger, bitti }: FormProps) {
    const [ad, setAd] = useState(ilkDeger);
    const [hata, setHata] = useState<string>();
    const [bekliyor, startTransition] = useTransition();

    const kaydet = (e: React.FormEvent) => {
        e.preventDefault();
        setHata(undefined);
        startTransition(async () => {
            const sonuc = await kategoriKaydet(id, ustId, ad);
            if (sonuc?.hata) {
                setHata(sonuc.hata);
                return;
            }
            setAd("");
            bitti?.();
        });
    };

    return (
        <form onSubmit={kaydet}>
            <div className="flex items-center gap-2">
                <input
                    value={ad}
                    onChange={(e) => setAd(e.target.value)}
                    placeholder={id ? undefined : ustId ? "Alt kategori adı" : "Yeni ana kategori adı"}
                    autoFocus={!!bitti}
                    aria-invalid={!!hata}
                    aria-label="Kategori adı"
                    className={inputSinifi}
                />
                <Button type="submit" size={id ? "icon" : "default"} disabled={bekliyor || !ad.trim()} title="Kaydet">
                    {bekliyor ? <Loader2 className="animate-spin" /> : id ? <Check /> : <Plus />}
                    {!id && "Ekle"}
                </Button>
                {bitti && (
                    <Button type="button" variant="ghost" size="icon" onClick={bitti} title="Vazgeç">
                        <X />
                    </Button>
                )}
            </div>
            {hata && <p className="mt-1 text-xs text-[var(--color-primary)]">{hata}</p>}
        </form>
    );
}
