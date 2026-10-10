// src/app/admin/(panel)/teknik-servis/[id]/duzenle/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { musteriGetir } from "@/lib/musteri";
import { createClient } from "@/lib/supabase/server";
import type { Personel } from "@/lib/schemas/personel";
import type { ServisKaydi } from "@/lib/schemas/servis";
import { SayfaBasligi } from "../../../../_components/form";
import ServisFormu from "../../ServisFormu";

export const metadata: Metadata = {
    title: "Servis Kaydını Düzenle",
};

export default async function ServisDuzenleSayfasi({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data } = await supabase.from("teknik_servis_kayitlari").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    const kayit = data as ServisKaydi;

    // Aktif personel + (pasife alınmış olsa bile) kaydı teslim alan personel.
    const [{ data: personelData }, musteri] = await Promise.all([
        supabase
            .from("personel")
            .select("id, ad_soyad, aktif")
            .or(`aktif.eq.true,id.eq.${kayit.teslim_alan_personel_id}`)
            .order("ad_soyad"),
        musteriGetir(supabase, kayit.musteri_id),
    ]);

    return (
        <div>
            <SayfaBasligi baslik="Servis Kaydını Düzenle" aciklama={`Form No: ${kayit.form_no}`} />
            <ServisFormu kayit={kayit} musteri={musteri ?? undefined} personeller={(personelData ?? []) as Pick<Personel, "id" | "ad_soyad" | "aktif">[]} />
        </div>
    );
}
