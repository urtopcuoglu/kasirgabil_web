// src/app/admin/(panel)/kasa/BaglantiSecici.tsx
// Kasa hareketine servis / ürün / rehber kişisi bağlamak için aramalı seçici.
"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { baglantiAra } from "@/actions/kasa";
import type { BaglantiSecenegi, BaglantiTuru } from "@/lib/schemas/kasa";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { inputSinifi } from "../../_components/form";

type Props = {
    id: string;
    tur: BaglantiTuru;
    secili: BaglantiSecenegi | null;
    onSec: (secenek: BaglantiSecenegi | null) => void;
    yerTutucu: string;
};

export default function BaglantiSecici({ id, tur, secili, onSec, yerTutucu }: Props) {
    const [acik, setAcik] = useState(false);
    const [q, setQ] = useState("");
    const [sonuc, setSonuc] = useState<{ q: string; liste: BaglantiSecenegi[] }>({ q: "", liste: [] });
    const aranan = q.trim();

    useEffect(() => {
        if (aranan.length < 2) return;
        let iptal = false;
        const zamanlayici = setTimeout(async () => {
            const liste = await baglantiAra(tur, aranan);
            if (!iptal) setSonuc({ q: aranan, liste });
        }, 250);
        return () => {
            iptal = true;
            clearTimeout(zamanlayici);
        };
    }, [tur, aranan]);

    const liste = aranan.length >= 2 && sonuc.q === aranan ? sonuc.liste : [];
    const yukleniyor = aranan.length >= 2 && sonuc.q !== aranan;

    if (secili) {
        return (
            <div className="flex items-start justify-between gap-2 rounded-md border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/5 px-3 py-2 text-sm">
                <div className="min-w-0">
                    <p className="truncate font-medium">{secili.etiket}</p>
                    {secili.alt && <p className="truncate text-xs text-gray-500">{secili.alt}</p>}
                </div>
                <button
                    type="button"
                    onClick={() => onSec(null)}
                    className="shrink-0 rounded p-0.5 text-gray-500 hover:bg-gray-200"
                    aria-label="Bağlantıyı kaldır"
                >
                    <X className="size-4" />
                </button>
            </div>
        );
    }

    return (
        <Popover
            open={acik}
            onOpenChange={(a) => {
                setAcik(a);
                if (a) setQ("");
            }}
        >
            <PopoverTrigger asChild>
                <button id={id} type="button" className={cn(inputSinifi, "flex items-center gap-2 text-left text-gray-400")}>
                    <Search className="size-4 shrink-0" />
                    <span className="truncate">{yerTutucu}</span>
                </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[min(380px,calc(100vw-2rem))] p-0">
                <div className="border-b p-2">
                    <input
                        autoFocus
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                if (liste[0]) {
                                    onSec(liste[0]);
                                    setAcik(false);
                                }
                            }
                        }}
                        placeholder="En az 2 karakter yazın..."
                        aria-label={yerTutucu}
                        className={cn(inputSinifi, "py-1.5")}
                    />
                </div>
                <div className="max-h-72 overflow-y-auto p-1">
                    {liste.map((s) => (
                        <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                                onSec(s);
                                setAcik(false);
                            }}
                            className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-100"
                        >
                            <span className="block truncate font-medium">{s.etiket}</span>
                            {s.alt && <span className="block truncate text-xs text-gray-500">{s.alt}</span>}
                        </button>
                    ))}
                    {yukleniyor && <p className="px-3 py-2 text-sm text-gray-500">Aranıyor...</p>}
                    {!yukleniyor && aranan.length >= 2 && liste.length === 0 && (
                        <p className="px-3 py-2 text-sm text-gray-500">Kayıt bulunamadı.</p>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
