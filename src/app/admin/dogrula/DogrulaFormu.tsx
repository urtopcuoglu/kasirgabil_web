// src/app/admin/dogrula/DogrulaFormu.tsx
"use client";

import { useActionState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { koduDogrula, type DogrulamaDurumu } from "@/actions/iki-adimli";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { anaButonSinifi, FormHatasi, inputSinifi } from "../_components/form";

const baslangic: DogrulamaDurumu = {};

export default function DogrulaFormu() {
    const [durum, formAction, bekliyor] = useActionState(koduDogrula, baslangic);

    return (
        <form action={formAction} className="space-y-4">
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
                    autoFocus
                    placeholder="123456"
                    className={`${inputSinifi} text-center font-mono text-lg tracking-[0.4em]`}
                />
            </div>

            <FormHatasi mesaj={durum.hata} />

            <Button type="submit" disabled={bekliyor} className={`w-full ${anaButonSinifi}`}>
                {bekliyor ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                {bekliyor ? "Doğrulanıyor..." : "Doğrula"}
            </Button>
        </form>
    );
}
