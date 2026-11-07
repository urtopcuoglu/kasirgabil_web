// src/app/admin/kayit/KayitFormu.tsx
"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { talepGonder } from "@/actions/talepler";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { anaButonSinifi, FormHatasi, inputSinifi } from "../_components/form";

export default function KayitFormu() {
    const [hata, setHata] = useState<string>();
    const [gonderildi, setGonderildi] = useState(false);
    const [bekliyor, startTransition] = useTransition();

    function gonder(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setHata(undefined);
        startTransition(async () => {
            const sonuc = await talepGonder({
                ad_soyad: String(f.get("ad_soyad") ?? ""),
                telefon: String(f.get("telefon") ?? ""),
                eposta: String(f.get("eposta") ?? "").trim().toLowerCase(),
                web_sitesi: String(f.get("web_sitesi") ?? ""),
            });
            if (sonuc?.hata) setHata(sonuc.hata);
            else setGonderildi(true);
        });
    }

    if (gonderildi) {
        return (
            <div role="status" className="space-y-2 text-center">
                <CheckCircle2 className="mx-auto size-10 text-green-600" />
                <p className="font-medium">Talebiniz alındı.</p>
                <p className="text-sm text-gray-600">Yönetim talebinizi inceleyecek; onaylanırsa giriş bilgileriniz size iletilecek.</p>
            </div>
        );
    }

    return (
        <form onSubmit={gonder} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="ad_soyad">Ad Soyad</Label>
                <input id="ad_soyad" name="ad_soyad" autoComplete="name" required minLength={2} maxLength={100} className={inputSinifi} />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="telefon">Telefon</Label>
                <input
                    id="telefon"
                    name="telefon"
                    type="tel"
                    autoComplete="tel"
                    required
                    maxLength={25}
                    placeholder="05xx xxx xx xx"
                    className={inputSinifi}
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="eposta">E-posta</Label>
                <input id="eposta" name="eposta" type="email" autoComplete="email" required maxLength={120} className={inputSinifi} />
            </div>
            {/* Bot tuzağı: kullanıcılar görmez, doluysa talep kaydedilmez. */}
            <div className="hidden" aria-hidden="true">
                <label htmlFor="web_sitesi">Web sitesi</label>
                <input id="web_sitesi" name="web_sitesi" tabIndex={-1} autoComplete="off" />
            </div>

            <FormHatasi mesaj={hata} />

            <Button type="submit" disabled={bekliyor} className={`w-full ${anaButonSinifi}`}>
                {bekliyor ? <Loader2 className="animate-spin" /> : <Send />} Talep Gönder
            </Button>
        </form>
    );
}
