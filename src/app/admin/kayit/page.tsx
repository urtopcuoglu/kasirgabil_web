// src/app/admin/kayit/page.tsx
// Panel kayıt talebi: personel ad soyad, telefon ve e-postasını bırakır; talep Personel sayfasına düşer.
import type { Metadata } from "next";
import Link from "next/link";
import GirisKarti from "../_components/GirisKarti";
import KayitFormu from "./KayitFormu";

export const metadata: Metadata = {
    title: "Kayıt Talebi",
};

export default function KayitSayfasi() {
    return (
        <GirisKarti baslik="Panel Kayıt Talebi">
            <KayitFormu />
            <p className="mt-4 text-center text-sm text-gray-500">
                Hesabınız var mı?{" "}
                <Link href="/admin/giris" className="font-medium text-[var(--color-secondary)] underline-offset-2 hover:underline">
                    Giriş yapın
                </Link>
            </p>
        </GirisKarti>
    );
}
