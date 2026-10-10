// src/app/admin/(panel)/personel/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GIZLI_ANAHTAR_EKSIK, yoneticiIstemci } from "@/lib/supabase/admin";
import { oturum } from "@/lib/supabase/yetkili";
import type { Personel } from "@/lib/schemas/personel";
import { SayfaBasligi } from "../../../_components/form";
import PersonelFormu from "../PersonelFormu";
import PanelGirisi from "./PanelGirisi";

export const metadata: Metadata = {
    title: "Personel Düzenle",
};

export default async function PersonelDuzenleSayfasi({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data } = await supabase.from("personel").select("*").eq("id", id).maybeSingle();

    if (!data) notFound();
    const personel = data as Personel;

    // Giriş e-postası auth tarafındadır; yönetici istemcisi (gizli anahtar) varsa okunur.
    const yonetici = yoneticiIstemci();
    let girisEmail: string | null = null;
    if (yonetici && personel.auth_user_id) {
        const { data: kullanici } = await yonetici.auth.admin.getUserById(personel.auth_user_id);
        girisEmail = kullanici.user?.email ?? null;
    }
    const kendisi = !!personel.auth_user_id && personel.auth_user_id === (await oturum())?.kullaniciId;

    return (
        <div className="space-y-6">
            <div>
                <SayfaBasligi baslik="Personel Düzenle" aciklama={personel.ad_soyad} />
                <PersonelFormu personel={personel} />
            </div>

            <section className="max-w-2xl rounded-xl border bg-white p-5 shadow-sm sm:p-6">
                <h2 className="mb-1 font-semibold text-[var(--color-secondary)]">Panel Girişi</h2>
                <p className="mb-4 text-sm text-gray-500">
                    Personel, rolünün izin verdiği bölümleri görür. Geçici şifreyle ilk girişte kendi şifresini belirler.
                </p>
                <PanelGirisi
                    personelId={personel.id}
                    aktif={personel.aktif}
                    girisVar={!!personel.auth_user_id}
                    girisEmail={girisEmail}
                    kendisi={kendisi}
                    anahtarVar={!!yonetici}
                    anahtarMesaji={GIZLI_ANAHTAR_EKSIK}
                />
            </section>
        </div>
    );
}
