// src/app/admin/(panel)/hesabim/TelefonTasi.tsx
// İki adımlı doğrulama durumu ve doğrulama uygulamasını yeni telefona taşıma.
"use client";

import { useState, useTransition } from "react";
import { Loader2, ShieldCheck, Smartphone } from "lucide-react";
import { yeniTelefonaTasi } from "@/actions/iki-adimli";
import { Button } from "@/components/ui/button";
import { FormHatasi } from "../../_components/form";

export default function TelefonTasi() {
    const [hata, setHata] = useState<string>();
    const [bekliyor, startTransition] = useTransition();

    const tasi = () => {
        if (!window.confirm("Mevcut doğrulama uygulaması kaydı silinecek ve yeni telefonda kurulum ekranı açılacak. Devam edilsin mi?")) return;
        setHata(undefined);
        startTransition(async () => {
            const sonuc = await yeniTelefonaTasi();
            if (sonuc?.hata) setHata(sonuc.hata);
        });
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm">
                    <ShieldCheck className="size-5 text-green-600" />
                    <span>
                        Durum: <span className="font-medium">Etkin</span>
                    </span>
                </p>
                <Button type="button" variant="outline" disabled={bekliyor} onClick={tasi}>
                    {bekliyor ? <Loader2 className="animate-spin" /> : <Smartphone />} Yeni telefona taşı
                </Button>
            </div>
            <p className="text-xs text-gray-500">Telefonunuzu kaybettiyseniz yöneticiden Personel sayfasında doğrulamanızı sıfırlamasını isteyin.</p>
            <FormHatasi mesaj={hata} />
        </div>
    );
}
