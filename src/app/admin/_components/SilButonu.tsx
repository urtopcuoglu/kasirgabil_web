// src/app/admin/_components/SilButonu.tsx
"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IslemSonucu } from "@/actions/personel";

type Props = {
    onay: string;
    sil: () => Promise<IslemSonucu>;
    etiket?: string;
};

export default function SilButonu({ onay, sil, etiket }: Props) {
    const [bekliyor, startTransition] = useTransition();

    const tikla = () => {
        if (!window.confirm(onay)) return;
        startTransition(async () => {
            const sonuc = await sil();
            if (sonuc?.hata) window.alert(sonuc.hata);
        });
    };

    return (
        <Button
            type="button"
            variant="ghost"
            size={etiket ? "sm" : "icon"}
            onClick={tikla}
            disabled={bekliyor}
            aria-label={etiket ?? "Sil"}
            title={etiket ?? "Sil"}
            className="text-gray-500 hover:bg-red-50 hover:text-[var(--color-primary)]"
        >
            {bekliyor ? <Loader2 className="animate-spin" /> : <Trash2 />}
            {etiket}
        </Button>
    );
}
