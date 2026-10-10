// src/app/admin/(panel)/rehber/KargoKopyalaButonu.tsx
// Kargo fişine yapıştırmak için ad, firma, telefon ve adresi tek seferde panoya kopyalar.
"use client";

import { useState } from "react";
import { Check, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RehberKisi } from "@/lib/schemas/rehber";

type Props = {
    kisi: Pick<RehberKisi, "ad_soyad_unvan" | "firma" | "telefon_1" | "telefon_2" | "adres">;
};

export default function KargoKopyalaButonu({ kisi }: Props) {
    const [kopyalandi, setKopyalandi] = useState(false);

    const kopyala = async () => {
        const metin = [kisi.ad_soyad_unvan, kisi.firma, kisi.telefon_1 ?? kisi.telefon_2, kisi.adres]
            .filter(Boolean)
            .join("\n");

        try {
            await navigator.clipboard.writeText(metin);
            setKopyalandi(true);
            setTimeout(() => setKopyalandi(false), 2000);
        } catch {
            window.alert("Panoya kopyalanamadı. Tarayıcı izinlerini kontrol edin.");
        }
    };

    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={kopyala}
            title="Kargo bilgisini kopyala"
            className="mr-auto text-gray-600"
        >
            {kopyalandi ? <Check className="text-green-600" /> : <Package />}
            {kopyalandi ? "Kopyalandı" : "Kargo bilgisi"}
        </Button>
    );
}
