// src/app/admin/dogrula/page.tsx
// İki adımlı doğrulama zorunludur (proxy.ts buraya yönlendirir): uygulaması kayıtlı kullanıcı 6 haneli kodu girer,
// kayıtlı değilse (ilk giriş ya da yönetici sıfırladıysa) uygulamayı burada kurar.
import type { Metadata } from "next";
import Image from "next/image";
import { cikisYap } from "@/actions/auth";
import { createClient } from "@/lib/supabase/server";
import DogrulaFormu from "./DogrulaFormu";
import UygulamaKurulumu from "./UygulamaKurulumu";

export const metadata: Metadata = {
    title: "Doğrulama",
};

export default async function DogrulaSayfasi() {
    const supabase = await createClient();
    const { data } = await supabase.auth.mfa.listFactors();
    const faktorVar = (data?.totp.length ?? 0) > 0;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-tertiary)] px-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-xl">
                <div className="mb-6 flex flex-col items-center gap-3">
                    <Image src="/logo/logo.png" alt="Kasırga Bilgisayar" width={150} height={50} priority />
                    <h1 className="text-lg font-semibold text-[var(--color-secondary)]">İki Adımlı Doğrulama</h1>
                </div>

                {faktorVar ? (
                    <>
                        <p className="mb-4 text-center text-sm text-gray-600">
                            Telefonunuzdaki doğrulama uygulamasında (Google / Microsoft Authenticator) görünen 6 haneli kodu girin.
                        </p>
                        <DogrulaFormu />
                    </>
                ) : (
                    <UygulamaKurulumu />
                )}

                <form action={cikisYap} className="mt-4 text-center">
                    <button type="submit" className="text-sm text-gray-500 underline-offset-2 hover:underline">
                        Farklı hesapla giriş yap
                    </button>
                </form>
            </div>
        </div>
    );
}
