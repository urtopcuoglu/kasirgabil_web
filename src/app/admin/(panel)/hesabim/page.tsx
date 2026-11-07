// src/app/admin/(panel)/hesabim/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ROLLER } from "@/lib/schemas/personel";
import { createClient } from "@/lib/supabase/server";
import { oturum } from "@/lib/supabase/yetkili";
import { SayfaBasligi } from "../../_components/form";
import TelefonTasi from "./TelefonTasi";
import SifreFormu from "./SifreFormu";

export const metadata: Metadata = {
    title: "Hesabım",
};

export default async function HesabimSayfasi() {
    const o = await oturum();
    if (!o) redirect("/admin/giris");

    const supabase = await createClient();
    const { data: faktorler } = await supabase.auth.mfa.listFactors();
    const mfaEtkin = (faktorler?.totp.length ?? 0) > 0;

    return (
        <div className="max-w-xl space-y-4">
            <SayfaBasligi baslik="Hesabım" aciklama="Panel giriş bilgileriniz." />

            {o.sifreDegismeli && (
                <p role="alert" className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Devam etmek için kendi şifrenizi belirleyin (geçici şifreyle giriş ya da şifre sıfırlama sonrası).
                </p>
            )}

            <section className="rounded-xl border bg-white p-5 shadow-sm">
                <dl className="space-y-1 text-sm">
                    <div className="grid grid-cols-[100px_1fr] gap-2">
                        <dt className="text-gray-500">Ad Soyad</dt>
                        <dd className="font-medium">{o.ad}</dd>
                    </div>
                    <div className="grid grid-cols-[100px_1fr] gap-2">
                        <dt className="text-gray-500">E-posta</dt>
                        <dd>{o.email}</dd>
                    </div>
                    {o.rol && (
                        <div className="grid grid-cols-[100px_1fr] gap-2">
                            <dt className="text-gray-500">Rol</dt>
                            <dd>{ROLLER[o.rol]}</dd>
                        </div>
                    )}
                </dl>
            </section>

            <section className="rounded-xl border bg-white p-5 shadow-sm">
                <h2 className="mb-4 font-semibold text-[var(--color-secondary)]">Şifre Değiştir</h2>
                <SifreFormu />
            </section>

            {mfaEtkin && (
                <section className="rounded-xl border bg-white p-5 shadow-sm">
                    <h2 className="mb-4 font-semibold text-[var(--color-secondary)]">İki Adımlı Doğrulama</h2>
                    <TelefonTasi />
                </section>
            )}
        </div>
    );
}
