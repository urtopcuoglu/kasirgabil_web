// src/app/admin/(panel)/donanim/DonanimArama.tsx
// Hızlı donanım puanı araması (teknik servis aracı ve ürün eşleştirme). onSec verilirse her sonucun yanında seçim butonu çıkar.
// Başka bir formun içinde de kullanılabilsin diye <form> değil; Enter tuşu ve "Ara" butonu aramayı başlatır.
"use client";

import { useState, useTransition } from "react";
import { Loader2, Search } from "lucide-react";
import { donanimAra } from "@/actions/donanim";
import { donanimEtiketi, DONANIM_TURLERI, DONANIM_TUR_LISTESI, type DonanimPuani, type DonanimTuru } from "@/lib/donanim-puanlari";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { inputSinifi } from "../../_components/form";
import { puanYaz, sayiYaz, TurRozeti, UbLinki } from "./DonanimParcalari";

type Props = {
    baslangic?: string;
    onSec?: (p: DonanimPuani) => void;
    secimEtiketi?: string;
    otomatikOdak?: boolean;
};

export default function DonanimArama({ baslangic = "", onSec, secimEtiketi = "Seç", otomatikOdak }: Props) {
    const [q, setQ] = useState(baslangic);
    const [tur, setTur] = useState<DonanimTuru | "">("");
    const [sonuc, setSonuc] = useState<{ aranan: string; liste: DonanimPuani[] } | null>(null);
    const [hata, setHata] = useState<string>();
    const [araniyor, startTransition] = useTransition();

    function ara() {
        const aranan = q.trim();
        setHata(undefined);
        if (aranan.length < 2) return setHata("En az 2 karakter yazın.");
        startTransition(async () => {
            const s = await donanimAra(aranan, tur || undefined);
            if ("hata" in s) return setHata(s.hata);
            setSonuc({ aranan, liste: s.sonuclar });
        });
    }

    return (
        <div className="space-y-3">
            <div role="search" className="flex flex-wrap gap-2">
                <div className="relative min-w-48 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="search"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key !== "Enter") return;
                            e.preventDefault();
                            ara();
                        }}
                        autoFocus={otomatikOdak}
                        placeholder="Model veya parça no (örn. i5 8250U, GTX 1050)"
                        aria-label="Donanım ara"
                        className={cn(inputSinifi, "py-1.5 pl-9")}
                    />
                </div>
                <select
                    value={tur}
                    onChange={(e) => setTur(e.target.value as DonanimTuru | "")}
                    aria-label="Donanım türü"
                    className={cn(inputSinifi, "w-auto py-1.5")}
                >
                    <option value="">Tüm türler</option>
                    {DONANIM_TUR_LISTESI.map((t) => (
                        <option key={t} value={t}>
                            {DONANIM_TURLERI[t]}
                        </option>
                    ))}
                </select>
                <Button type="button" variant="outline" className="h-[34px]" onClick={ara} disabled={araniyor}>
                    {araniyor ? <Loader2 className="animate-spin" /> : <Search />} Ara
                </Button>
            </div>

            {hata && <p className="text-xs text-[var(--color-primary)]">{hata}</p>}

            {sonuc && sonuc.liste.length === 0 && (
                <p className="text-sm text-gray-500">
                    “{sonuc.aranan}” için kayıt bulunamadı. Daha kısa yazmayı deneyin (örn. yalnızca model numarası).
                </p>
            )}

            {sonuc && sonuc.liste.length > 0 && (
                <ul className="max-h-96 divide-y overflow-y-auto rounded-md border">
                    {sonuc.liste.map((p) => (
                        <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm">
                            <TurRozeti tur={p.tur} />
                            <span className="min-w-0 flex-1 font-medium">{donanimEtiketi(p)}</span>
                            <span className="tabular-nums text-gray-600" title="Türündeki sırası">
                                {p.sira != null ? `#${sayiYaz(p.sira)}` : "—"}
                            </span>
                            <span className="w-14 text-right font-semibold tabular-nums" title="UserBenchmark puanı">
                                {puanYaz(p.puan)}
                            </span>
                            <span className="hidden w-24 text-right text-xs text-gray-500 sm:inline" title="Test sayısı">
                                {sayiYaz(p.ornek)} test
                            </span>
                            <UbLinki url={p.url} />
                            {onSec && (
                                <Button type="button" size="sm" variant="outline" onClick={() => onSec(p)}>
                                    {secimEtiketi}
                                </Button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
