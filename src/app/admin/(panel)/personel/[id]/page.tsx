// src/app/admin/(panel)/personel/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Personel } from "@/lib/schemas/personel";
import { SayfaBasligi } from "../../../_components/form";
import PersonelFormu from "../PersonelFormu";

export const metadata: Metadata = {
    title: "Personel Düzenle",
};

export default async function PersonelDuzenleSayfasi({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data } = await supabase.from("personel").select("*").eq("id", id).maybeSingle();

    if (!data) notFound();
    const personel = data as Personel;

    return (
        <div>
            <SayfaBasligi baslik="Personel Düzenle" aciklama={personel.ad_soyad} />
            <PersonelFormu personel={personel} />
        </div>
    );
}
