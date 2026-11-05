// src/app/admin/(panel)/stok/AramaliSecici.tsx
// Aramalı açılır liste (kutu, marka, model seçimi). Arama Türkçe büyük/küçük harf duyarsızdır.
// "ekle" verilirse listede olmayan yazılan değer yeni seçenek olarak eklenebilir; "altBilgi" listenin altına
// sabit bir bağlantı/aksiyon koyar (örn. "Yeni kutu aç").
"use client";

import { useState } from "react";
import { Check, ChevronDown, Plus, Search, X } from "lucide-react";
import { adAnahtari, aramaMetni } from "@/lib/schemas/ortak";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { inputSinifi } from "../../_components/form";

export type SeciciSecenegi = {
    deger: string;
    etiket: string;
    aciklama?: string; // satırın altında küçük yazı
    arama?: string; // etiket dışında aranacak metin
};

type Props = {
    id: string; // label htmlFor için
    secenekler: SeciciSecenegi[];
    deger: string;
    onSec: (deger: string) => void;
    yerTutucu: string;
    aramaYerTutucu?: string;
    ekle?: { etiket: (metin: string) => string; enAz?: number };
    temizlenebilir?: boolean;
    altBilgi?: React.ReactNode;
    gecersiz?: boolean;
    pasif?: boolean;
};

const EN_FAZLA = 100;

export default function AramaliSecici({
    id,
    secenekler,
    deger,
    onSec,
    yerTutucu,
    aramaYerTutucu = "Ara...",
    ekle,
    temizlenebilir,
    altBilgi,
    gecersiz,
    pasif,
}: Props) {
    const [acik, setAcik] = useState(false);
    const [arama, setArama] = useState("");

    const aranan = aramaMetni(arama.trim());
    const eslesenler = aranan
        ? secenekler.filter((s) => aramaMetni(`${s.etiket} ${s.arama ?? ""} ${s.aciklama ?? ""}`).includes(aranan))
        : secenekler;
    const gosterilen = eslesenler.slice(0, EN_FAZLA);
    const yazilan = arama.trim().replace(/\s+/g, " ");
    const birebirVar = secenekler.some((s) => adAnahtari(s.etiket) === adAnahtari(yazilan));
    const eklenebilir = !!ekle && yazilan.length >= (ekle.enAz ?? 1) && !birebirVar;
    const seciliEtiket = secenekler.find((s) => s.deger === deger)?.etiket ?? deger;

    function ac(yeni: boolean) {
        setAcik(yeni);
        if (yeni) setArama("");
    }

    function sec(v: string) {
        onSec(v);
        setAcik(false);
    }

    return (
        <Popover open={acik} onOpenChange={ac}>
            <div className="relative">
                <PopoverTrigger asChild>
                    <button
                        id={id}
                        type="button"
                        disabled={pasif}
                        className={cn(
                            inputSinifi,
                            "flex items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:bg-gray-50",
                            temizlenebilir && deger && "pr-14",
                            gecersiz && "border-[var(--color-primary)]",
                        )}
                    >
                        <span className={cn("truncate", !deger && "text-gray-400")}>{deger ? seciliEtiket : yerTutucu}</span>
                        <ChevronDown className="size-4 shrink-0 text-gray-400" />
                    </button>
                </PopoverTrigger>
                {temizlenebilir && deger && !pasif && (
                    <button
                        type="button"
                        onClick={() => onSec("")}
                        aria-label="Seçimi temizle"
                        className="absolute right-8 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X className="size-3.5" />
                    </button>
                )}
            </div>
            <PopoverContent align="start" className="w-[min(420px,calc(100vw-2rem))] p-0">
                <div className="border-b p-2">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                        <input
                            autoFocus
                            value={arama}
                            onChange={(e) => setArama(e.target.value)}
                            onKeyDown={(e) => {
                                // Enter: ilk sonucu seçer, sonuç yoksa yazılanı ekler (formu göndermez).
                                if (e.key !== "Enter") return;
                                e.preventDefault();
                                if (gosterilen[0]) sec(gosterilen[0].deger);
                                else if (eklenebilir) sec(yazilan);
                            }}
                            placeholder={aramaYerTutucu}
                            aria-label={aramaYerTutucu}
                            className={cn(inputSinifi, "py-1.5 pl-9")}
                        />
                    </div>
                </div>

                <div className="max-h-72 overflow-y-auto p-1">
                    {gosterilen.map((s) => (
                        <button
                            key={s.deger}
                            type="button"
                            onClick={() => sec(s.deger)}
                            className={cn(
                                "flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-gray-100",
                                s.deger === deger && "bg-[var(--color-secondary)]/5",
                            )}
                        >
                            <Check className={cn("size-4 shrink-0", s.deger === deger ? "text-[var(--color-secondary)]" : "invisible")} />
                            <span className="min-w-0 flex-1">
                                <span className="font-medium">{s.etiket}</span>
                                {s.aciklama && <span className="block truncate text-xs text-gray-500">{s.aciklama}</span>}
                            </span>
                        </button>
                    ))}
                    {eslesenler.length > EN_FAZLA && (
                        <p className="px-3 py-1.5 text-xs text-gray-500">
                            {eslesenler.length - EN_FAZLA} sonuç daha var; aramayı daraltın.
                        </p>
                    )}
                    {gosterilen.length === 0 && !eklenebilir && (
                        <p className="px-3 py-2 text-sm text-gray-500">{aranan ? "Eşleşen kayıt yok." : "Henüz kayıt yok."}</p>
                    )}

                    {eklenebilir && (
                        <button
                            type="button"
                            onClick={() => sec(yazilan)}
                            className="mt-1 flex w-full items-center gap-2 rounded border-t px-3 py-2 text-left text-sm text-[var(--color-secondary)] hover:bg-gray-50"
                        >
                            <Plus className="size-4 shrink-0" />
                            <span>{ekle.etiket(yazilan)}</span>
                        </button>
                    )}
                </div>
                {altBilgi && <div className="border-t p-1">{altBilgi}</div>}
            </PopoverContent>
        </Popover>
    );
}
