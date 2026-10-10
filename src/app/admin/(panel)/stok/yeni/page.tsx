// src/app/admin/(panel)/stok/yeni/page.tsx
import type { Metadata } from "next";
import { izinGerekli } from "@/lib/supabase/yetkili";
import { createClient } from "@/lib/supabase/server";
import { urunFormuVerisi } from "@/lib/stok";
import { SayfaBasligi } from "../../../_components/form";
import { uuidMi } from "../../../_components/liste";
import UrunFormu from "../UrunFormu";

export const metadata: Metadata = {
    title: "Yeni Ürün",
};

export default async function YeniUrunSayfasi({ searchParams }: { searchParams: Promise<{ kutu?: string }> }) {
    await izinGerekli("stok_yonet");
    const { kutu } = await searchParams;
    const supabase = await createClient();
    const veri = await urunFormuVerisi(supabase);

    return (
        <div>
            <SayfaBasligi baslik="Yeni Ürün" aciklama="Stok kodu kayıt sırasında otomatik verilir." />
            <UrunFormu {...veri} baslangicKutuId={uuidMi(kutu) ? kutu : undefined} />
        </div>
    );
}
