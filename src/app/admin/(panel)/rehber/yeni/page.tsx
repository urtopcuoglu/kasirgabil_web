// src/app/admin/(panel)/rehber/yeni/page.tsx
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { RehberKategori } from "@/lib/schemas/rehber";
import { SayfaBasligi } from "../../../_components/form";
import RehberFormu from "../RehberFormu";

export const metadata: Metadata = {
    title: "Yeni Kişi",
};

export default async function YeniRehberKisiSayfasi() {
    const supabase = await createClient();
    const { data } = await supabase.from("rehber_kategorileri").select("id, ad, kod, sistem").order("ad");

    return (
        <div>
            <SayfaBasligi baslik="Yeni Kişi" />
            <RehberFormu kategoriler={(data ?? []) as RehberKategori[]} />
        </div>
    );
}
