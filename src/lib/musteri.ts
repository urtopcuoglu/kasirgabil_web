// src/lib/musteri.ts
// Servis müşterisi (rehber kişisi) + kayıtlı cihazları ve servis geçmişi.
// Sunucu bileşenlerinde doğrudan, servis formunda musteriAra action'ı üzerinden kullanılır.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { MusteriSecenegi } from "@/lib/schemas/servis";

export const MUSTERI_SECIMI =
    "id, ad_soyad_unvan, telefon_1, telefon_2, cihazlar(id, marka_model, seri_no, servisler:teknik_servis_kayitlari(id, form_no, giris_tarihi, durum))";

// En son servise gelen cihaz en üstte; her cihazın servisleri yeniden eskiye.
export function cihazlariSirala(m: MusteriSecenegi): MusteriSecenegi {
    const sonGiris = (c: MusteriSecenegi["cihazlar"][number]) => c.servisler[0]?.giris_tarihi ?? "";
    const cihazlar = m.cihazlar.map((c) => ({
        ...c,
        servisler: c.servisler.toSorted((a, b) => b.giris_tarihi.localeCompare(a.giris_tarihi)),
    }));
    return { ...m, cihazlar: cihazlar.toSorted((a, b) => sonGiris(b).localeCompare(sonGiris(a))) };
}

export async function musteriGetir(supabase: SupabaseClient, id: string): Promise<MusteriSecenegi | null> {
    const { data } = await supabase.from("rehber_kisiler").select(MUSTERI_SECIMI).eq("id", id).maybeSingle();
    return data ? cihazlariSirala(data as MusteriSecenegi) : null;
}
