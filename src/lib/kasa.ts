// src/lib/kasa.ts
// Kasa sayfalarının sunucu tarafı yardımcıları (sayfalarda doğrudan, formda baglantiAra action'ı üzerinden).
import type { SupabaseClient } from "@supabase/supabase-js";
import { aramaDeseni } from "@/app/admin/_components/liste";
import type { BaglantiSecenegi, BaglantiTuru } from "@/lib/schemas/kasa";
import { SERVIS_DURUMLARI, type ServisDurumu } from "@/lib/schemas/servis";
import { paraYaz } from "@/lib/tarih";

const LIMIT = 8;

type ServisSatiri = {
    id: string;
    form_no: string;
    musteri_id: string;
    musteri_ad_soyad: string;
    cihaz_marka_model: string;
    durum: ServisDurumu;
    servis_kalemleri: { tutar: number }[];
    kasa_hareketleri: { tip: "gelir" | "gider"; tutar: number }[];
};

// Servis toplamı (ücret kalemleri) ile kasaya girilen tahsilatların farkı. İade (gider) kalanı artırır.
export function servisKalani(s: Pick<ServisSatiri, "servis_kalemleri" | "kasa_hareketleri">) {
    const toplam = s.servis_kalemleri.reduce((t, k) => t + Number(k.tutar), 0);
    const odenen = s.kasa_hareketleri.reduce((t, h) => t + (h.tip === "gelir" ? Number(h.tutar) : -Number(h.tutar)), 0);
    return { toplam, odenen, kalan: toplam - odenen };
}

// q ile arama ya da id ile tek kayıt (düzenleme / URL'den ön seçim).
export async function baglantiSecenekleri(
    supabase: SupabaseClient,
    tur: BaglantiTuru,
    { q, id }: { q?: string; id?: string }
): Promise<BaglantiSecenegi[]> {
    if (tur === "servis") {
        let sorgu = supabase
            .from("teknik_servis_kayitlari")
            .select(
                "id, form_no, musteri_id, musteri_ad_soyad, cihaz_marka_model, durum, servis_kalemleri(tutar), kasa_hareketleri(tip, tutar)"
            )
            .order("giris_tarihi", { ascending: false })
            .limit(LIMIT);
        sorgu = id ? sorgu.eq("id", id) : sorgu.ilike("arama", aramaDeseni(q ?? ""));
        const { data } = await sorgu;
        return ((data ?? []) as ServisSatiri[]).map((s) => {
            const { toplam, kalan } = servisKalani(s);
            return {
                id: s.id,
                etiket: `#${s.form_no} · ${s.musteri_ad_soyad}`,
                alt: `${s.cihaz_marka_model} · ${SERVIS_DURUMLARI[s.durum].etiket}${toplam > 0 ? ` · Kalan: ${paraYaz(kalan)}` : ""}`,
                musteriId: s.musteri_id,
                musteriAd: s.musteri_ad_soyad,
                kalan,
            };
        });
    }

    if (tur === "urun") {
        let sorgu = supabase
            .from("urunler")
            .select("id, stok_kodu, ad, satis_fiyati, stok_adedi")
            .order("stok_kodu")
            .limit(LIMIT);
        sorgu = id ? sorgu.eq("id", id) : sorgu.ilike("arama", aramaDeseni(q ?? ""));
        const { data } = await sorgu;
        return (data ?? []).map((u) => ({
            id: u.id as string,
            etiket: `${u.stok_kodu} · ${u.ad}`,
            alt: `Stok: ${u.stok_adedi}${u.satis_fiyati != null ? ` · ${paraYaz(Number(u.satis_fiyati))}` : ""}`,
            satisFiyati: u.satis_fiyati != null ? Number(u.satis_fiyati) : null,
            stokAdedi: u.stok_adedi as number,
        }));
    }

    let sorgu = supabase.from("rehber_kisiler").select("id, ad_soyad_unvan, firma, telefon_1").order("ad_soyad_unvan").limit(LIMIT);
    sorgu = id ? sorgu.eq("id", id) : sorgu.ilike("arama", aramaDeseni(q ?? ""));
    const { data } = await sorgu;
    return (data ?? []).map((r) => ({
        id: r.id as string,
        etiket: r.ad_soyad_unvan as string,
        alt: [r.firma, r.telefon_1].filter(Boolean).join(" · ") || undefined,
    }));
}

export async function tekBaglanti(supabase: SupabaseClient, tur: BaglantiTuru, id: string | null | undefined) {
    if (!id) return null;
    return (await baglantiSecenekleri(supabase, tur, { id }))[0] ?? null;
}
