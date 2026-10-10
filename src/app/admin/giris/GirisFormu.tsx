// src/app/admin/giris/GirisFormu.tsx
"use client";

import { useActionState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { girisYap, type GirisDurumu } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { anaButonSinifi, FormHatasi, inputSinifi } from "../_components/form";

const baslangic: GirisDurumu = {};

export default function GirisFormu() {
    const [durum, formAction, bekliyor] = useActionState(girisYap, baslangic);

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="email">E-posta</Label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    defaultValue={durum.email}
                    className={inputSinifi}
                />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="sifre">Şifre</Label>
                <input
                    id="sifre"
                    name="sifre"
                    type="password"
                    autoComplete="current-password"
                    required
                    className={inputSinifi}
                />
            </div>

            <FormHatasi mesaj={durum.hata} />

            <Button type="submit" disabled={bekliyor} className={`w-full ${anaButonSinifi}`}>
                {bekliyor ? <Loader2 className="animate-spin" /> : <LogIn />}
                {bekliyor ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
        </form>
    );
}
