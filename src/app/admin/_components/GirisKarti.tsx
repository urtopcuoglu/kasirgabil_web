// src/app/admin/_components/GirisKarti.tsx
// Oturum açmadan görülen panel sayfalarının (giriş, doğrulama, kayıt talebi, şifremi unuttum) ortak kartı.
import Image from "next/image";

export default function GirisKarti({ baslik, children }: { baslik: string; children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-tertiary)] px-4 py-8">
            <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-xl">
                <div className="mb-6 flex flex-col items-center gap-3">
                    <Image src="/logo/logo.png" alt="Kasırga Bilgisayar" width={150} height={50} priority />
                    <h1 className="text-lg font-semibold text-[var(--color-secondary)]">{baslik}</h1>
                </div>
                {children}
            </div>
        </div>
    );
}
