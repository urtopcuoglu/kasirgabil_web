// src/app/admin/(panel)/kasa/kategoriler/page.tsx
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { dbHataMesaji } from "@/lib/supabase/yetkili";
import { HAREKET_TIPLERI, type KasaKategori, type KasaTipi } from "@/lib/schemas/kasa";
import { FormHatasi, SayfaBasligi } from "../../../_components/form";
import KasaSekmeleri from "../KasaSekmeleri";
import KasaKategoriSatiri, { YeniKasaKategoriFormu } from "./KasaKategoriSatiri";

export const metadata: Metadata = {
    title: "Kasa Kategorileri",
};

type KategoriSatiri = KasaKategori & { kasa_hareketleri: { count: number }[] };

export default async function KasaKategorileriSayfasi() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("kasa_kategorileri")
        .select("id, ad, tip, kod, sistem, kasa_hareketleri(count)")
        .order("sistem", { ascending: false })
        .order("ad");
    const kategoriler = (data ?? []) as KategoriSatiri[];

    return (
        <div>
            <SayfaBasligi baslik="Kasa" aciklama="Gelir ve gider kategorileri. Kilitli olanlar sistem kategorisidir (satış, servis, alış) ve silinemez." />

            <KasaSekmeleri aktif="/admin/kasa/kategoriler" />

            {error && <FormHatasi mesaj={dbHataMesaji(error)} />}

            <div className="grid gap-4 lg:grid-cols-2">
                {(Object.keys(HAREKET_TIPLERI) as KasaTipi[]).map((tip) => (
                    <section key={tip}>
                        <h2 className="mb-2 font-semibold text-[var(--color-secondary)]">{HAREKET_TIPLERI[tip]} Kategorileri</h2>
                        <div className="divide-y rounded-xl border bg-white shadow-sm">
                            {kategoriler
                                .filter((k) => k.tip === tip)
                                .map((k) => (
                                    <KasaKategoriSatiri key={k.id} kategori={k} hareketSayisi={k.kasa_hareketleri[0]?.count ?? 0} />
                                ))}
                            <YeniKasaKategoriFormu tip={tip} />
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
