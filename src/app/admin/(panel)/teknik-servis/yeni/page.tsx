// src/app/admin/(panel)/teknik-servis/yeni/page.tsx
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Personel } from "@/lib/schemas/personel";
import { SayfaBasligi } from "../../../_components/form";
import ServisFormu from "../ServisFormu";

export const metadata: Metadata = {
    title: "Yeni Servis Kaydı",
};

export default async function YeniServisSayfasi() {
    const supabase = await createClient();
    // Pasif personel yeni kayıtta seçilemez.
    const { data } = await supabase.from("personel").select("id, ad_soyad, aktif").eq("aktif", true).order("ad_soyad");

    return (
        <div>
            <SayfaBasligi baslik="Yeni Servis Kaydı" aciklama="Form numarası kayıt açılınca otomatik verilir." />
            <ServisFormu personeller={(data ?? []) as Pick<Personel, "id" | "ad_soyad" | "aktif">[]} />
        </div>
    );
}
