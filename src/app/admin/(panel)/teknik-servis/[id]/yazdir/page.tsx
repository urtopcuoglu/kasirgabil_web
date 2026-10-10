// src/app/admin/(panel)/teknik-servis/[id]/yazdir/page.tsx
// Teknik servis formu (A5 yatay) önizleme ve yazdırma. Çıktıda yalnızca form kağıda basılır.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Personel } from "@/lib/schemas/personel";
import type { ServisKalemi, ServisKaydi } from "@/lib/schemas/servis";
import { tarihSaatYaz } from "@/lib/tarih";
import { A5YazdirmaStili } from "../../../../_components/A5";
import ServisFormuYazdir from "./ServisFormuYazdir";

export const metadata: Metadata = {
    title: "Servis Formu Yazdır",
};

type Kayit = ServisKaydi & {
    personel: Pick<Personel, "ad_soyad"> | null;
    servis_kalemleri: Pick<ServisKalemi, "aciklama" | "tutar" | "created_at">[];
};

export default async function ServisYazdirSayfasi({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data } = await supabase
        .from("teknik_servis_kayitlari")
        .select("*, personel(ad_soyad), servis_kalemleri(aciklama, tutar, created_at)")
        .eq("id", id)
        .order("created_at", { referencedTable: "servis_kalemleri", ascending: true })
        .maybeSingle();

    if (!data) notFound();
    const k = data as Kayit;

    return (
        <>
            <A5YazdirmaStili />
            <ServisFormuYazdir
                servisId={k.id}
                veri={{
                    form_no: k.form_no,
                    musteri_ad_soyad: k.musteri_ad_soyad,
                    musteri_telefon: k.musteri_telefon,
                    cihaz_marka_model: k.cihaz_marka_model,
                    seri_no: k.seri_no,
                    sikayet: k.sikayet,
                    giris_tarihi: tarihSaatYaz(k.giris_tarihi),
                    teslim_alan: k.personel?.ad_soyad ?? "",
                }}
                kalemler={k.servis_kalemleri.map((x) => ({ aciklama: x.aciklama, tutar: Number(x.tutar) }))}
            />
        </>
    );
}
