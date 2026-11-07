// src/app/admin/giris/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import GirisKarti from "../_components/GirisKarti";
import GirisFormu from "./GirisFormu";

export const metadata: Metadata = {
    title: "Giriş",
};

const baglantiSinifi = "font-medium text-[var(--color-secondary)] underline-offset-2 hover:underline";

export default function GirisSayfasi() {
    return (
        <GirisKarti baslik="Yönetim Paneli">
            <GirisFormu />
            <div className="mt-4 flex flex-col items-center gap-2 text-sm">
                <Link href="/admin/sifremi-unuttum" className={baglantiSinifi}>
                    Şifremi unuttum
                </Link>
                <p className="text-gray-500">
                    Hesabınız yok mu?{" "}
                    <Link href="/admin/kayit" className={baglantiSinifi}>
                        Kayıt talebi oluşturun
                    </Link>
                </p>
            </div>
        </GirisKarti>
    );
}
