// src/app/admin/(panel)/stok/SiteStokButonu.tsx
// Sitedeki ürünü stok adedinden bağımsız "tükendi" gösterir ya da geri açar. Sitede olmayan üründe pasiftir.
"use client";

import { useTransition } from "react";
import { Loader2, PackageCheck, PackageX } from "lucide-react";
import { siteStokKapat } from "@/actions/stok";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = { urunId: string; sitede: boolean; kapali: boolean };

export default function SiteStokButonu({ urunId, sitede, kapali }: Props) {
    const [bekliyor, startTransition] = useTransition();

    const etiket = !sitede ? "Ürün sitede değil" : kapali ? "Sitede stoğu aç" : "Sitede stoğu kapat";

    const tikla = () => {
        if (!kapali && !window.confirm("Ürün sitede stok adedinden bağımsız olarak \"Tükendi\" görünsün mü?")) return;
        startTransition(async () => {
            const sonuc = await siteStokKapat(urunId, !kapali);
            if (sonuc?.hata) window.alert(sonuc.hata);
        });
    };

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={tikla}
            disabled={!sitede || bekliyor}
            aria-label={etiket}
            aria-pressed={sitede ? kapali : undefined}
            title={etiket}
            className={cn(kapali ? "text-[var(--color-primary)] hover:bg-red-50" : "text-gray-500 hover:text-amber-700")}
        >
            {bekliyor ? <Loader2 className="animate-spin" /> : kapali ? <PackageX /> : <PackageCheck />}
        </Button>
    );
}
