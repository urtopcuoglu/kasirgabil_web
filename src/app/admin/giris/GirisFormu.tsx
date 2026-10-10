// src/app/admin/giris/GirisFormu.tsx
"use client";

import { useActionState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { girisYap, type GirisDurumu } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const baslangic: GirisDurumu = {};

const inputSinifi =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/20";

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

            {durum.hata && (
                <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-[var(--color-primary)]">
                    {durum.hata}
                </p>
            )}

            <Button
                type="submit"
                disabled={bekliyor}
                className="w-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90"
            >
                {bekliyor ? <Loader2 className="animate-spin" /> : <LogIn />}
                {bekliyor ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
        </form>
    );
}
