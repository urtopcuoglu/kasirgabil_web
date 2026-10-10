// src/app/admin/(panel)/hesabim/SifreFormu.tsx
"use client";

import { useActionState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { sifreDegistir, type SifreDurumu } from "@/actions/kullanici";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { anaButonSinifi, FormHatasi, inputSinifi } from "../../_components/form";

const baslangic: SifreDurumu = {};

export default function SifreFormu() {
    const [durum, formAction, bekliyor] = useActionState(sifreDegistir, baslangic);

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="sifre">Yeni şifre</Label>
                <input id="sifre" name="sifre" type="password" autoComplete="new-password" required minLength={8} className={inputSinifi} />
                <p className="text-xs text-gray-500">En az 8 karakter; en az bir harf ve bir rakam.</p>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="tekrar">Yeni şifre (tekrar)</Label>
                <input id="tekrar" name="tekrar" type="password" autoComplete="new-password" required className={inputSinifi} />
            </div>
            <FormHatasi mesaj={durum.hata} />
            {durum.tamam && (
                <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                    Şifreniz değiştirildi.
                </p>
            )}
            <Button type="submit" disabled={bekliyor} className={anaButonSinifi}>
                {bekliyor ? <Loader2 className="animate-spin" /> : <KeyRound />} Şifreyi Değiştir
            </Button>
        </form>
    );
}
