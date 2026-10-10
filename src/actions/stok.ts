// src/actions/stok.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
    kategoriSemasi,
    kutuSemasi,
    stokHareketiSemasi,
    urunSemasi,
    type HareketTipi,
    type KutuGirdisi,
    type UrunGirdisi,
    type UrunKategori,
} from "@/lib/schemas/stok";
import { sayiOku } from "@/lib/schemas/ortak";
import { bosIseNull, dbHataMesaji, OTURUM_HATASI, yetkiliIstemci } from "@/lib/supabase/yetkili";
import type { IslemSonucu } from "./personel";

const STOK = "/admin/stok";
const KUTULAR = `${STOK}/kutular`;
const KATEGORILER = `${STOK}/kategoriler`;

type DbHatasi = { code?: string; message: string };

// Unique kısıt ihlalinde hangi alanın çakıştığını söyler.
function tekillikMesaji(error: DbHatasi, mesajlar: Record<string, string>) {
    if (error.code === "23505") {
        for (const [kisit, mesaj] of Object.entries(mesajlar)) if (error.message.includes(kisit)) return mesaj;
    }
    return dbHataMesaji(error);
}

// ─── Kategoriler ────────────────────────────────────────────

// id null ise ustId altına yeni kategori, değilse yeniden adlandırma.
export async function kategoriKaydet(id: string | null, ustId: string | null, ad: string): Promise<IslemSonucu> {
    const sonuc = kategoriSemasi.safeParse({ ad });
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz veri." };

    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const { error } = id
        ? await supabase.from("urun_kategorileri").update(sonuc.data).eq("id", id)
        : await supabase.from("urun_kategorileri").insert({ ...sonuc.data, ust_id: ustId });

    if (error) return { hata: tekillikMesaji(error, { urun_kategorileri_ad_tekil: "Bu dalda aynı isimde bir kategori var." }) };

    revalidatePath(STOK, "layout");
}

// Ürün formundaki kategori seçiciden ekleme: yeni kategoriyi döndürür, form onu hemen seçer.
export async function kategoriEkle(ustId: string | null, ad: string): Promise<{ kategori: UrunKategori } | { hata: string }> {
    const sonuc = kategoriSemasi.safeParse({ ad });
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz veri." };

    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const { data, error } = await supabase
        .from("urun_kategorileri")
        .insert({ ...sonuc.data, ust_id: ustId })
        .select("id, ad, ust_id, kutu_sistemi")
        .single();

    if (error) return { hata: tekillikMesaji(error, { urun_kategorileri_ad_tekil: "Bu dalda aynı isimde bir kategori var." }) };

    revalidatePath(KATEGORILER);
    return { kategori: data as UrunKategori };
}

export async function kategoriKutuSistemi(id: string, acik: boolean): Promise<IslemSonucu> {
    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const { error } = await supabase.from("urun_kategorileri").update({ kutu_sistemi: acik }).eq("id", id);
    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath(STOK, "layout");
}

export async function kategoriSil(id: string): Promise<IslemSonucu> {
    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const { error } = await supabase.from("urun_kategorileri").delete().eq("id", id);
    if (error) {
        return {
            hata: error.code === "23503" ? "Alt kategorisi veya ürünü olan kategori silinemez." : dbHataMesaji(error),
        };
    }

    revalidatePath(KATEGORILER);
}

// ─── Kutular ────────────────────────────────────────────────

const KUTU_TEKILLIK = {
    kutular_kutu_no_key: "Bu kutu numarası zaten kullanılıyor.",
    kutular_marka_model_tekil: "Bu marka/model için zaten bir kutu var. Parçaları o kutuya ekleyin.",
};

// id null ise yeni kutu (kaydedince kutu sayfasına gider), değilse güncelleme.
export async function kutuKaydet(id: string | null, girdi: KutuGirdisi): Promise<IslemSonucu> {
    const sonuc = kutuSemasi.safeParse(girdi);
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz veri." };

    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const veri = bosIseNull({ ...sonuc.data, kutu_no: Number(sonuc.data.kutu_no) });

    if (id) {
        const { error } = await supabase.from("kutular").update(veri).eq("id", id);
        if (error) return { hata: tekillikMesaji(error, KUTU_TEKILLIK) };
        revalidatePath(KUTULAR, "layout");
        return;
    }

    const { data, error } = await supabase.from("kutular").insert(veri).select("id").single();
    if (error) return { hata: tekillikMesaji(error, KUTU_TEKILLIK) };

    revalidatePath(KUTULAR);
    redirect(`${KUTULAR}/${data.id}`);
}

export async function kutuSil(id: string): Promise<IslemSonucu> {
    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const { error } = await supabase.from("kutular").delete().eq("id", id);
    if (error) return { hata: error.code === "23503" ? "İçinde ürün olan kutu silinemez." : dbHataMesaji(error) };

    revalidatePath(KUTULAR);
    redirect(KUTULAR);
}

// ─── Ürünler ────────────────────────────────────────────────

const URUN_TEKILLIK = {
    urunler_seri_tekil: "Bu seri numarası başka bir üründe kayıtlı.",
    urunler_barkod_tekil: "Bu barkod / GTIN başka bir üründe kayıtlı.",
};

// id null ise yeni ürün (stok kodu veritabanında üretilir), değilse güncelleme.
export async function urunKaydet(id: string | null, girdi: UrunGirdisi): Promise<IslemSonucu> {
    const sonuc = urunSemasi.safeParse(girdi);
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz veri." };

    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const d = sonuc.data;
    const veri = {
        ...bosIseNull({
            kategori_id: d.kategori_id,
            kutu_id: d.kutu_id,
            ad: d.ad,
            marka: d.marka,
            model: d.model,
            durum: d.durum,
            seri_no: d.seri_no,
            barkod: d.barkod,
            tedarikci_id: d.tedarikci_id,
            aciklama: d.aciklama,
        }),
        satis_fiyati: sayiOku(d.satis_fiyati),
        alis_fiyati: sayiOku(d.alis_fiyati),
        kdv_orani: d.kdv_orani ? Number(d.kdv_orani) : null,
        komisyon_orani: sayiOku(d.komisyon_orani),
        komisyon_tutari: sayiOku(d.komisyon_tutari),
        kargo_desi: sayiOku(d.kargo_desi),
        kargo_ucreti: sayiOku(d.kargo_ucreti),
    };

    let hedefId = id;
    if (id) {
        const { error } = await supabase.from("urunler").update(veri).eq("id", id);
        if (error) return { hata: tekillikMesaji(error, URUN_TEKILLIK) };
    } else {
        // Başlangıç adedi, veritabanında "İlk kayıt" giriş hareketine dönüştürülür.
        const { data, error } = await supabase
            .from("urunler")
            .insert({ ...veri, stok_adedi: sayiOku(d.stok_adedi) ?? 0 })
            .select("id")
            .single();
        if (error) return { hata: tekillikMesaji(error, URUN_TEKILLIK) };
        hedefId = data.id as string;
    }

    revalidatePath(STOK, "layout");
    redirect(`${STOK}/${hedefId}`);
}

export async function urunSil(id: string): Promise<IslemSonucu> {
    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    // Stok hareketleri cascade ile birlikte silinir.
    const { error } = await supabase.from("urunler").delete().eq("id", id);
    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath(STOK, "layout");
    redirect(STOK);
}

// ─── Stok hareketleri ───────────────────────────────────────

// giris/cikis: miktar kadar artırır/azaltır. sayim: miktar sayılan gerçek adettir, fark hareket olarak yazılır.
export async function stokHareketiEkle(
    urunId: string,
    tip: HareketTipi,
    miktar: number,
    aciklama: string
): Promise<IslemSonucu> {
    const sonuc = stokHareketiSemasi.safeParse({ tip, miktar, aciklama });
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz veri." };

    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    let fark: number;
    if (sonuc.data.tip === "sayim") {
        const { data, error } = await supabase.from("urunler").select("stok_adedi").eq("id", urunId).single();
        if (error) return { hata: dbHataMesaji(error) };
        fark = sonuc.data.miktar - (data.stok_adedi as number);
        if (fark === 0) return { hata: "Sayılan adet mevcut stokla aynı; düzeltme gerekmiyor." };
    } else {
        if (sonuc.data.miktar === 0) return { hata: "Adet 0 olamaz." };
        fark = sonuc.data.tip === "giris" ? sonuc.data.miktar : -sonuc.data.miktar;
    }

    const { error } = await supabase.from("stok_hareketleri").insert({
        urun_id: urunId,
        tip: sonuc.data.tip,
        miktar: fark,
        aciklama: sonuc.data.aciklama || null,
    });
    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath(STOK, "layout");
}
