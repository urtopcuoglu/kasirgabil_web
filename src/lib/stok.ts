// src/lib/stok.ts
// Stok sayfalarının sunucu tarafı veri yükleyicileri.
import type { SupabaseClient } from "@supabase/supabase-js";
import { TEDARIKCI_KODU, type RehberKisi } from "@/lib/schemas/rehber";
import type { Kutu, UrunKategori } from "@/lib/schemas/stok";

// Ürün formundaki seçim listeleri: kategoriler, kutular ve tedarikçi kategorisindeki rehber kişileri.
export async function urunFormuVerisi(supabase: SupabaseClient) {
    const [kategoriler, kutular, tedarikciler] = await Promise.all([
        supabase.from("urun_kategorileri").select("id, ad, ust_id, kutu_sistemi"),
        supabase.from("kutular").select("id, kutu_no, marka, model").order("kutu_no"),
        supabase
            .from("rehber_kisiler")
            .select("id, ad_soyad_unvan, firma, rehber_kategorileri!inner(kod)")
            .eq("rehber_kategorileri.kod", TEDARIKCI_KODU)
            .order("ad_soyad_unvan"),
    ]);

    return {
        kategoriler: (kategoriler.data ?? []) as UrunKategori[],
        kutular: (kutular.data ?? []) as Pick<Kutu, "id" | "kutu_no" | "marka" | "model">[],
        tedarikciler: (tedarikciler.data ?? []) as Pick<RehberKisi, "id" | "ad_soyad_unvan" | "firma">[],
    };
}
