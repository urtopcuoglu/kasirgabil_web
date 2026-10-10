// src/app/admin/giris/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import GirisFormu from "./GirisFormu";

export const metadata: Metadata = {
    title: "Giriş",
};

export default function GirisSayfasi() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-tertiary)] px-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-xl">
                <div className="mb-6 flex flex-col items-center gap-3">
                    <Image src="/logo/logo.png" alt="Kasırga Bilgisayar" width={150} height={50} priority />
                    <h1 className="text-lg font-semibold text-[var(--color-secondary)]">Yönetim Paneli</h1>
                </div>
                <GirisFormu />
            </div>
        </div>
    );
}
