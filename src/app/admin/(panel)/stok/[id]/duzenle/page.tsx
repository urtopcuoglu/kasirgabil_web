// src/app/admin/(panel)/stok/[id]/duzenle/page.tsx
import type { Metadata } from "next";
import { izinGerekli } from "@/lib/supabase/yetkili";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { urunFormuVerisi } from "@/lib/stok";
import type { Urun } from "@/lib/schemas/stok";
import { SayfaBasligi } from "../../../../_components/form";
import UrunFormu from "../../UrunFormu";

export const metadata: Metadata = {
    title: "Ürünü Düzenle",
};

export default async function UrunDuzenleSayfasi({ params }: { params: Promise<{ id: string }> }) {
    await izinGerekli("stok_yonet");
    const { id } = await params;
    const supabase = await createClient();
    const [{ data }, veri] = await Promise.all([
        supabase.from("urunler").select("*").eq("id", id).maybeSingle(),
        urunFormuVerisi(supabase),
    ]);
    if (!data) notFound();
    const urun = data as Urun;

    return (
        <div>
            <SayfaBasligi
                baslik="Ürünü Düzenle"
                aciklama={`Stok kodu: ${urun.stok_kodu} · Kutu değişirse stok kodu yeni kutuya göre yeniden verilir.`}
            />
            <UrunFormu {...veri} urun={urun} />
        </div>
    );
}
