// src/app/admin/(panel)/kasa/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { tekBaglanti } from "@/lib/kasa";
import { createClient } from "@/lib/supabase/server";
import type { KasaHareketi, KasaKategori } from "@/lib/schemas/kasa";
import { bugunISO, tarihYaz } from "@/lib/tarih";
import { FormHatasi, SayfaBasligi } from "../../../_components/form";
import HareketFormu from "../HareketFormu";

export const metadata: Metadata = {
    title: "Kasa Hareketini Düzenle",
};

export default async function KasaHareketiDuzenleSayfasi({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const [{ data }, { data: kategoriler }] = await Promise.all([
        supabase.from("kasa_hareketleri").select("*").eq("id", id).maybeSingle(),
        supabase.from("kasa_kategorileri").select("id, ad, tip, kod, sistem").order("ad"),
    ]);
    if (!data) notFound();
    const hareket = data as KasaHareketi;

    const [{ data: gun }, servis, urun, rehber] = await Promise.all([
        supabase.from("kasa_gunleri").select("kapandi").eq("tarih", hareket.tarih).maybeSingle(),
        tekBaglanti(supabase, "servis", hareket.servis_id),
        tekBaglanti(supabase, "urun", hareket.urun_id),
        tekBaglanti(supabase, "rehber", hareket.rehber_kisi_id),
    ]);

    return (
        <div className="max-w-3xl">
            <SayfaBasligi
                baslik="Kasa Hareketini Düzenle"
                aciklama={`${tarihYaz(hareket.tarih)} · Değişiklikten önceki hali düzeltme geçmişine kaydedilir.`}
            />
            {gun?.kapandi ? (
                <FormHatasi mesaj="Bu hareketin günü kapatılmış. Düzenlemek için önce günü yeniden açın." />
            ) : (
                <div className="rounded-xl border bg-white p-5 shadow-sm sm:p-6">
                    <HareketFormu
                        kategoriler={(kategoriler ?? []) as KasaKategori[]}
                        tarih={hareket.tarih}
                        bugun={bugunISO()}
                        hareket={hareket}
                        baslangic={{ servis, urun, rehber }}
                    />
                </div>
            )}
        </div>
    );
}
