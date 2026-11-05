// src/app/admin/(panel)/donanim/EslesmeButonu.tsx
// Stoktaki ürünün donanım kaydını bağlar (öneriyi onaylar) veya bağlantıyı kaldırır.
"use client";

import { useTransition } from "react";
import { Check, Loader2, Unlink } from "lucide-react";
import { urunDonanimBagla } from "@/actions/donanim";
import { Button } from "@/components/ui/button";

export default function EslesmeButonu({ urunId, puanId, etiket }: { urunId: string; puanId: string | null; etiket?: string }) {
    const [bekliyor, startTransition] = useTransition();
    const kaldir = puanId === null;

    function uygula() {
        startTransition(async () => {
            const sonuc = await urunDonanimBagla(urunId, puanId);
            if (sonuc?.hata) alert(sonuc.hata);
        });
    }

    return (
        <Button type="button" size="sm" variant={kaldir ? "ghost" : "outline"} onClick={uygula} disabled={bekliyor}>
            {bekliyor ? <Loader2 className="animate-spin" /> : kaldir ? <Unlink /> : <Check />}
            {etiket ?? (kaldir ? "Kaldır" : "Onayla")}
        </Button>
    );
}
