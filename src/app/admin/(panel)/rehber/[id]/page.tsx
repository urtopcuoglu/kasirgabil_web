// src/app/admin/(panel)/rehber/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { RehberKategori, RehberKisi } from "@/lib/schemas/rehber";
import { SayfaBasligi } from "../../../_components/form";
import RehberFormu from "../RehberFormu";

export const metadata: Metadata = {
    title: "Kişi Düzenle",
};

export default async function RehberKisiDuzenleSayfasi({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const [kisiSonucu, kategorilerSonucu] = await Promise.all([
        supabase.from("rehber_kisiler").select("*").eq("id", id).maybeSingle(),
        supabase.from("rehber_kategorileri").select("id, ad, kod, sistem").order("ad"),
    ]);

    if (!kisiSonucu.data) notFound();
    const kisi = kisiSonucu.data as RehberKisi;

    return (
        <div>
            <SayfaBasligi baslik="Kişi Düzenle" aciklama={kisi.ad_soyad_unvan} />
            <RehberFormu kisi={kisi} kategoriler={(kategorilerSonucu.data ?? []) as RehberKategori[]} />
        </div>
    );
}
