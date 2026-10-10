// src/app/admin/(panel)/kargolar/yeni/page.tsx
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { dbHataMesaji } from "@/lib/supabase/yetkili";
import type { KargoGonderici } from "@/lib/schemas/kargo";
import { FormHatasi, SayfaBasligi } from "../../../_components/form";
import KargoOlusturucu, { type AliciSecenegi } from "./KargoOlusturucu";

export const metadata: Metadata = {
    title: "Kargo Şablonu",
};

type Props = {
    searchParams: Promise<{ alici?: string }>;
};

export default async function YeniKargoSayfasi({ searchParams }: Props) {
    const { alici } = await searchParams;
    const supabase = await createClient();

    const [gondericilerSonucu, alicilarSonucu] = await Promise.all([
        supabase
            .from("kargo_gondericileri")
            .select("id, firma_adi, gonderici_adi, telefon, adres, vkn, varsayilan")
            .order("varsayilan", { ascending: false })
            .order("firma_adi"),
        // Kargo için adres şart; adresi olmayan kişiler listelenmez.
        supabase
            .from("rehber_kisiler")
            .select("id, ad_soyad_unvan, firma, telefon_1, telefon_2, adres")
            .not("adres", "is", null)
            .neq("adres", "")
            .order("ad_soyad_unvan")
            .limit(1000),
    ]);

    const hata = gondericilerSonucu.error ?? alicilarSonucu.error;
    const alicilar = (alicilarSonucu.data ?? []) as AliciSecenegi[];

    return (
        <div>
            <SayfaBasligi baslik="Kargo Şablonu" aciklama="Gönderici ve ödeme tipini seçin, önizleyip kaydedin veya yazdırın." />
            {hata ? (
                <FormHatasi mesaj={dbHataMesaji(hata)} />
            ) : (
                <KargoOlusturucu
                    gondericiler={(gondericilerSonucu.data ?? []) as KargoGonderici[]}
                    alicilar={alicilar}
                    baslangicAliciId={alicilar.some((a) => a.id === alici) ? alici : undefined}
                />
            )}
        </div>
    );
}
