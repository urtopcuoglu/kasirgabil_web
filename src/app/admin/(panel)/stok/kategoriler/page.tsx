// src/app/admin/(panel)/stok/kategoriler/page.tsx
import type { Metadata } from "next";
import { dbHataMesaji, izinGerekli } from "@/lib/supabase/yetkili";
import { createClient } from "@/lib/supabase/server";
import type { UrunKategori } from "@/lib/schemas/stok";
import { FormHatasi, SayfaBasligi } from "../../../_components/form";
import StokSekmeleri from "../StokSekmeleri";
import KategoriDugumu, { KategoriAdiFormu } from "./KategoriDugumu";

export const metadata: Metadata = {
    title: "Ürün Kategorileri",
};

type KategoriSatiri = UrunKategori & { urunler: { count: number }[] };

export default async function UrunKategorileriSayfasi() {
    await izinGerekli("stok_yonet");
    const supabase = await createClient();
    const { data, error } = await supabase.from("urun_kategorileri").select("id, ad, ust_id, kutu_sistemi, urunler(count)");
    const kategoriler = (data ?? []) as KategoriSatiri[];

    const altlari = (ustId: string | null) =>
        kategoriler.filter((k) => k.ust_id === ustId).toSorted((a, b) => a.ad.localeCompare(b.ad, "tr"));

    // Ağacı derinlik öncelikli düz listeye çevirir (girintili gösterim için).
    const satirlar: { kategori: KategoriSatiri; derinlik: number; ustteKutulu: boolean }[] = [];
    const gez = (ustId: string | null, derinlik: number, ustteKutulu: boolean) => {
        for (const k of altlari(ustId)) {
            satirlar.push({ kategori: k, derinlik, ustteKutulu });
            gez(k.id, derinlik + 1, ustteKutulu || k.kutu_sistemi);
        }
    };
    gez(null, 0, false);

    return (
        <div className="max-w-3xl">
            <SayfaBasligi
                baslik="Stok"
                aciklama="Kategori ağacı. Kutu sistemi açık kategorideki (ve alt kategorilerindeki) ürünler bir kutuya bağlanır."
            />

            <StokSekmeleri aktif="/admin/stok/kategoriler" />

            {error && <FormHatasi mesaj={dbHataMesaji(error)} />}

            <div className="divide-y rounded-xl border bg-white shadow-sm">
                {satirlar.map(({ kategori, derinlik, ustteKutulu }) => (
                    <KategoriDugumu
                        key={kategori.id}
                        kategori={kategori}
                        derinlik={derinlik}
                        ustteKutulu={ustteKutulu}
                        urunSayisi={kategori.urunler[0]?.count ?? 0}
                        altSayisi={kategoriler.filter((k) => k.ust_id === kategori.id).length}
                    />
                ))}
                <div className="bg-gray-50 px-4 py-3">
                    <KategoriAdiFormu id={null} ustId={null} ilkDeger="" />
                </div>
            </div>
        </div>
    );
}
