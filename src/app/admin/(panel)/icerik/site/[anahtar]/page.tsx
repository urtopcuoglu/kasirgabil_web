// src/app/admin/(panel)/icerik/site/[anahtar]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { icerikAnahtariMi, SITE_ICERIKLERI, type SiteIcerikleri } from "@/lib/schemas/icerik";
import { Button } from "@/components/ui/button";
import { SayfaBasligi } from "../../../../_components/form";
import { BankaHesaplariFormu, HakkimizdaFormu, IletisimFormu, SliderFormu, YasalSayfaFormu } from "./SiteIcerikFormlari";

export const metadata: Metadata = {
    title: "Site İçeriğini Düzenle",
};

// Veritabanındaki kayıtta eksik alan varsa form boş değerle açılır.
const BOS: { [K in keyof SiteIcerikleri]: SiteIcerikleri[K] } = {
    iletisim: { telefonlar: [""], whatsapp: "", eposta: "", adres: "", harita_url: "", instagram: "", linkedin: "", sahibinden: "" },
    banka_hesaplari: { hesaplar: [] },
    hakkimizda: { biz_kimiz: "", misyon: "", vizyon: "", gorsel: "" },
    anasayfa_slider: { slaytlar: [] },
    kvkk: { baslik: "", icerik: "" },
    gizlilik: { baslik: "", icerik: "" },
    iade: { baslik: "", icerik: "" },
    mesafeli: { baslik: "", icerik: "" },
};

export default async function SiteIcerigiDuzenleSayfasi({ params }: { params: Promise<{ anahtar: string }> }) {
    const { anahtar } = await params;
    if (!icerikAnahtariMi(anahtar)) notFound();

    const supabase = await createClient();
    const { data } = await supabase.from("site_icerikleri").select("deger").eq("anahtar", anahtar).maybeSingle();
    const tanim = SITE_ICERIKLERI[anahtar];
    const deger = { ...BOS[anahtar], ...((data?.deger as object) ?? {}) };

    return (
        <div>
            <SayfaBasligi baslik={tanim.baslik} aciklama={tanim.aciklama}>
                <Button variant="outline" asChild>
                    <Link href="/admin/icerik/site">
                        <ArrowLeft /> Site İçerikleri
                    </Link>
                </Button>
                <Button variant="outline" asChild>
                    <a href={tanim.yol} target="_blank" rel="noopener noreferrer">
                        <ExternalLink /> Sitede gör
                    </a>
                </Button>
            </SayfaBasligi>

            {anahtar === "iletisim" && <IletisimFormu deger={deger as SiteIcerikleri["iletisim"]} />}
            {anahtar === "banka_hesaplari" && <BankaHesaplariFormu deger={deger as SiteIcerikleri["banka_hesaplari"]} />}
            {anahtar === "hakkimizda" && <HakkimizdaFormu deger={deger as SiteIcerikleri["hakkimizda"]} />}
            {anahtar === "anasayfa_slider" && <SliderFormu deger={deger as SiteIcerikleri["anasayfa_slider"]} />}
            {(anahtar === "kvkk" || anahtar === "gizlilik" || anahtar === "iade" || anahtar === "mesafeli") && (
                <YasalSayfaFormu anahtar={anahtar} deger={deger as SiteIcerikleri["kvkk"]} />
            )}
        </div>
    );
}
