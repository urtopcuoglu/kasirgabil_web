// src/actions/donanim.ts
// Donanım puanları (UserBenchmark): elle güncelleme, takip listesi, arama ve stoktaki ürünle eşleştirme.
"use server";

import { revalidatePath } from "next/cache";
import { DONANIM_SUTUNLARI, DONANIM_TUR_LISTESI, donanimPuanlariniGuncelle, type DonanimPuani, type DonanimTuru, type GuncellemeSonucu } from "@/lib/donanim-puanlari";
import { aramaMetni } from "@/lib/schemas/ortak";
import { dbHataMesaji, izinliIstemci, yetkiliIstemci, OTURUM_HATASI } from "@/lib/supabase/yetkili";
import type { IslemSonucu } from "./personel";

const DONANIM = "/admin/donanim";

export async function donanimGuncelle(): Promise<GuncellemeSonucu | { hata: string }> {
    const yetki = await izinliIstemci("donanim");
    if ("hata" in yetki) return yetki;
    const sonuc = await donanimPuanlariniGuncelle(yetki.supabase, "elle");
    revalidatePath(DONANIM, "layout");
    return sonuc;
}

export async function donanimTakip(puanId: string, takipte: boolean): Promise<IslemSonucu> {
    const yetki = await izinliIstemci("donanim");
    if ("hata" in yetki) return yetki;
    const { supabase } = yetki;

    const { error } = takipte
        ? await supabase.from("donanim_takip").upsert({ puan_id: puanId }, { onConflict: "puan_id", ignoreDuplicates: true })
        : await supabase.from("donanim_takip").delete().eq("puan_id", puanId);
    if (error) return { hata: dbHataMesaji(error) };
    revalidatePath(DONANIM, "layout");
}

// Hızlı arama (teknik servis aracı, ürün eşleştirme): model, marka veya parça no. Türkçe harf duyarsız.
export async function donanimAra(q: string, tur?: DonanimTuru): Promise<{ sonuclar: DonanimPuani[] } | { hata: string }> {
    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };
    const aranan = aramaMetni(String(q ?? "").trim()).slice(0, 100);
    if (aranan.length < 2) return { sonuclar: [] };

    let sorgu = supabase
        .from("donanim_puanlari")
        .select(DONANIM_SUTUNLARI)
        .order("ornek", { ascending: false, nullsFirst: false })
        .limit(20);
    // Kelimeler ayrı ayrı aranır: "i7 8550" → "Core i7-8550U" bulunur.
    for (const kelime of aranan.split(/\s+/).slice(0, 5)) {
        sorgu = sorgu.like("arama", `%${kelime.replace(/[\\%_]/g, (k) => `\\${k}`)}%`);
    }
    if (tur && DONANIM_TUR_LISTESI.includes(tur)) sorgu = sorgu.eq("tur", tur);

    const { data, error } = await sorgu;
    if (error) return { hata: dbHataMesaji(error) };
    return { sonuclar: (data ?? []) as DonanimPuani[] };
}

// Stoktaki ürünün donanım kaydını elle bağlar (null: bağlantıyı kaldırır).
export async function urunDonanimBagla(urunId: string, puanId: string | null): Promise<IslemSonucu> {
    const yetki = await izinliIstemci("stok_yonet");
    if ("hata" in yetki) return yetki;

    const { data, error } = await yetki.supabase.from("urunler").update({ donanim_puan_id: puanId }).eq("id", urunId).select("id");
    if (error) return { hata: dbHataMesaji(error) };
    if (!data?.length) return { hata: "Ürün bulunamadı." };

    revalidatePath(`/admin/stok/${urunId}`);
    revalidatePath(DONANIM, "layout");
}
