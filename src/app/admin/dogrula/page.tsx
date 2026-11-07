// src/app/admin/dogrula/page.tsx
// İki adımlı doğrulama zorunludur (proxy.ts buraya yönlendirir): uygulaması kayıtlı kullanıcı 6 haneli kodu girer,
// kayıtlı değilse (ilk giriş ya da yönetici sıfırladıysa) uygulamayı burada kurar.
import type { Metadata } from "next";
import { cikisYap } from "@/actions/auth";
import { createClient } from "@/lib/supabase/server";
import GirisKarti from "../_components/GirisKarti";
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
        <GirisKarti baslik="İki Adımlı Doğrulama">
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
        </GirisKarti>
    );
}
