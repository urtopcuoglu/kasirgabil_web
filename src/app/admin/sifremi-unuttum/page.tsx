// src/app/admin/sifremi-unuttum/page.tsx
// Şifremi unuttum: e-posta + doğrulama uygulamasındaki kod; doğruysa yeni şifre belirleme ekranına geçilir.
import type { Metadata } from "next";
import Link from "next/link";
import GirisKarti from "../_components/GirisKarti";
import SifirlamaFormu from "./SifirlamaFormu";

export const metadata: Metadata = {
    title: "Şifremi Unuttum",
};

export default function SifremiUnuttumSayfasi() {
    return (
        <GirisKarti baslik="Şifremi Unuttum">
            <p className="mb-4 text-center text-sm text-gray-600">
                E-posta adresinizi ve telefonunuzdaki doğrulama uygulamasında (Google / Microsoft Authenticator) görünen 6 haneli kodu
                girin. Kod doğruysa yeni şifrenizi belirleyeceksiniz.
            </p>
            <SifirlamaFormu />
            <p className="mt-4 text-center text-xs text-gray-500">
                Doğrulama uygulamanıza erişemiyorsanız yöneticinizden şifrenizi sıfırlamasını isteyin.
            </p>
            <p className="mt-2 text-center text-sm">
                <Link href="/admin/giris" className="font-medium text-[var(--color-secondary)] underline-offset-2 hover:underline">
                    Girişe dön
                </Link>
            </p>
        </GirisKarti>
    );
}
