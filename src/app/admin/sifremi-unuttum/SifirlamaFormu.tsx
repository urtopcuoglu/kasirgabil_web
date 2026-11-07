// src/app/admin/sifremi-unuttum/SifirlamaFormu.tsx
"use client";

import { useActionState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { sifreSifirla, type SifirlamaDurumu } from "@/actions/sifre-sifirlama";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { anaButonSinifi, FormHatasi, inputSinifi } from "../_components/form";

const baslangic: SifirlamaDurumu = {};

export default function SifirlamaFormu() {
    const [durum, formAction, bekliyor] = useActionState(sifreSifirla, baslangic);

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="email">E-posta</Label>
                <input id="email" name="email" type="email" autoComplete="email" required defaultValue={durum.email} className={inputSinifi} />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="kod">Doğrulama kodu</Label>
                <input
                    id="kod"
                    name="kod"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9 ]{6,7}"
                    maxLength={7}
                    required
                    placeholder="123456"
                    className={`${inputSinifi} text-center font-mono text-lg tracking-[0.4em]`}
                />
            </div>

            <FormHatasi mesaj={durum.hata} />

            <Button type="submit" disabled={bekliyor} className={`w-full ${anaButonSinifi}`}>
                {bekliyor ? <Loader2 className="animate-spin" /> : <KeyRound />}
                {bekliyor ? "Doğrulanıyor..." : "Doğrula ve devam et"}
            </Button>
        </form>
    );
}
