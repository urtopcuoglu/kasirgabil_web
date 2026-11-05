// src/actions/stok.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
    kategoriSemasi,
    kutuSemasi,
    markaAdiSemasi,
    modelAdiSemasi,
    stokHareketiSemasi,
    urunSemasi,
    type HareketTipi,
    type KutuGirdisi,
    type UrunGirdisi,
    type UrunKategori,
} from "@/lib/schemas/stok";
import { slugUret } from "@/lib/schemas/icerik";
import { sayiOku } from "@/lib/schemas/ortak";
import { depoYolu, vitrinUrunleriniYenile } from "@/lib/site-urunleri";
import { bosIseNull, dbHataMesaji, izinliIstemci, OTURUM_HATASI, yetkiliIstemci } from "@/lib/supabase/yetkili";
import type { IslemSonucu } from "./personel";
import type { SupabaseClient } from "@supabase/supabase-js";

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

    const yetki = await izinliIstemci("stok_yonet");
    if ("hata" in yetki) return yetki;
    const { supabase } = yetki;

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

    const yetki = await izinliIstemci("stok_yonet");
    if ("hata" in yetki) return yetki;
    const { supabase } = yetki;

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
    const yetki = await izinliIstemci("stok_yonet");
    if ("hata" in yetki) return yetki;
    const { supabase } = yetki;

    const { error } = await supabase.from("urun_kategorileri").update({ kutu_sistemi: acik }).eq("id", id);
    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath(STOK, "layout");
}

export async function kategoriSil(id: string): Promise<IslemSonucu> {
    const yetki = await izinliIstemci("stok_yonet");
    if ("hata" in yetki) return yetki;
    const { supabase } = yetki;

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
// urundenGelindi: ürün formundan "yeni kutu aç" ile gelindiyse kutu sayfasında "Ürüne geri dön" butonu çıkar.
export async function kutuKaydet(id: string | null, girdi: KutuGirdisi, urundenGelindi = false): Promise<IslemSonucu> {
    const sonuc = kutuSemasi.safeParse(girdi);
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz veri." };

    const yetki = await izinliIstemci("stok_yonet");
    if ("hata" in yetki) return yetki;
    const { supabase } = yetki;

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
    redirect(`${KUTULAR}/${data.id}${urundenGelindi ? "?donus=urun" : ""}`);
}

export async function kutuSil(id: string): Promise<IslemSonucu> {
    const yetki = await izinliIstemci("stok_yonet");
    if ("hata" in yetki) return yetki;
    const { supabase } = yetki;

    const { error } = await supabase.from("kutular").delete().eq("id", id);
    if (error) return { hata: error.code === "23503" ? "İçinde ürün olan kutu silinemez." : dbHataMesaji(error) };

    revalidatePath(KUTULAR);
    redirect(KUTULAR);
}

// ─── Ürünler ────────────────────────────────────────────────

const URUN_TEKILLIK = {
    urunler_stok_kodu_key: "Bu stok kodu başka bir üründe kayıtlı.",
    urunler_seri_tekil: "Bu seri numarası başka bir üründe kayıtlı.",
    urunler_barkod_tekil: "Bu barkod / GTIN başka bir üründe kayıtlı.",
};

// id null ise yeni ürün (stok kodu veritabanında üretilir), değilse güncelleme.
export async function urunKaydet(id: string | null, girdi: UrunGirdisi): Promise<IslemSonucu> {
    const sonuc = urunSemasi.safeParse(girdi);
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz veri." };

    const yetki = await izinliIstemci("stok_yonet");
    if ("hata" in yetki) return yetki;
    const { supabase } = yetki;

    const d = sonuc.data;
    // Yeni üründe kimlik burada üretilir: sitedeki adres (slug) kayıtla birlikte yazılabilsin.
    const hedefId = id ?? crypto.randomUUID();
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
            site_ad: d.site_ad,
            site_aciklama: d.site_aciklama,
            site_kategori_id: d.site_kategori_id,
        }),
        satis_fiyati: sayiOku(d.satis_fiyati),
        alis_fiyati: sayiOku(d.alis_fiyati),
        kdv_orani: d.kdv_orani ? Number(d.kdv_orani) : null,
        komisyon_orani: sayiOku(d.komisyon_orani),
        komisyon_tutari: sayiOku(d.komisyon_tutari),
        kargo_desi: sayiOku(d.kargo_desi),
        kargo_ucreti: sayiOku(d.kargo_ucreti),
        min_stok: sayiOku(d.min_stok),
        sitede: d.sitede,
        site_gorseller: d.site_gorseller,
        // Elle girilen stok kodu; boşsa gönderilmez (yeni kayıtta otomatik üretilir, düzenlemede eskisi kalır).
        ...(d.stok_kodu ? { stok_kodu: d.stok_kodu.toUpperCase() } : {}),
        // "lenovo-ideapad-slim-3-1a2b3c4d": addaki kimlik parçası, aynı adlı ürünlerin çakışmasını önler.
        site_slug: d.site_ad ? `${slugUret(d.site_ad) || "urun"}-${hedefId.slice(0, 8)}` : null,
    };

    if (id) {
        const { data: eski } = await supabase.from("urunler").select("site_gorseller").eq("id", id).maybeSingle();
        const { error } = await supabase.from("urunler").update(veri).eq("id", id);
        if (error) return { hata: tekillikMesaji(error, URUN_TEKILLIK) };
        // Formdan kaldırılan görseller depodan da silinir.
        const eskiGorseller = (eski?.site_gorseller ?? []) as string[];
        await gorselleriSil(supabase, eskiGorseller.filter((g) => !d.site_gorseller.includes(g)));
    } else {
        // Başlangıç adedi, veritabanında "İlk kayıt" giriş hareketine dönüştürülür.
        const { error } = await supabase.from("urunler").insert({ ...veri, id: hedefId, stok_adedi: sayiOku(d.stok_adedi) ?? 0 });
        if (error) return { hata: tekillikMesaji(error, URUN_TEKILLIK) };
    }

    revalidatePath(STOK, "layout");
    vitrinUrunleriniYenile();
    redirect(`${STOK}/${hedefId}`);
}

export async function urunSil(id: string): Promise<IslemSonucu> {
    const yetki = await izinliIstemci("stok_yonet");
    if ("hata" in yetki) return yetki;
    const { supabase } = yetki;

    // Stok hareketleri cascade ile birlikte silinir.
    const { data, error } = await supabase.from("urunler").delete().eq("id", id).select("site_gorseller").maybeSingle();
    if (error) return { hata: dbHataMesaji(error) };
    await gorselleriSil(supabase, (data?.site_gorseller ?? []) as string[]);

    revalidatePath(STOK, "layout");
    vitrinUrunleriniYenile();
    redirect(STOK);
}

// Sitedeki ürünü stok adedinden bağımsız olarak "tükendi" gösterir (veya geri açar). Yalnızca sitedeki ürünlerde.
export async function siteStokKapat(id: string, kapali: boolean): Promise<IslemSonucu> {
    const yetki = await izinliIstemci("stok_yonet");
    if ("hata" in yetki) return yetki;
    const { supabase } = yetki;

    const { data, error } = await supabase
        .from("urunler")
        .update({ site_stok_kapali: kapali })
        .eq("id", id)
        .eq("sitede", true)
        .select("id");
    if (error) return { hata: dbHataMesaji(error) };
    if (!data?.length) return { hata: "Ürün sitede yayında değil." };

    revalidatePath(STOK, "layout");
    vitrinUrunleriniYenile();
}

// Görsel silinemezse kayıt işlemi bozulmaz; yalnızca depoda artık dosya kalır.
async function gorselleriSil(supabase: SupabaseClient, adresler: string[]) {
    const yollar = adresler.map(depoYolu).filter((y): y is string => !!y);
    if (yollar.length === 0) return;
    const { error } = await supabase.storage.from("site").remove(yollar);
    if (error) console.error("[gorselleriSil]", error.message);
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

    const yetki = await izinliIstemci("stok_hareket");
    if ("hata" in yetki) return yetki;
    const { supabase } = yetki;

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
    vitrinUrunleriniYenile();
}

// ─── Teknik servis aracı: stokta parça arama ────────────────

export type StoktakiParca = { id: string; stok_kodu: string; ad: string; stok_adedi: number; kutu_no: number | null };

// LCD kodu, parça no vb. ile stokta arama (ad, marka, model, seri no, barkod, stok kodu).
// Koddaki tire/boşluk gibi ayraçlar joker sayılır: "N156HRA-EA1" araması "N156HRA EA1" yazılmış ürünü de bulur.
export async function stoktaParcaAra(kod: string): Promise<{ sonuclar: StoktakiParca[] } | { hata: string }> {
    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };
    const temiz = String(kod ?? "").trim().slice(0, 60);
    if (temiz.length < 3) return { sonuclar: [] };

    // Yalnızca harf/rakam parçaları alınır, araları joker olur: "N156HRA-EA1" → "%N156HRA%EA1%".
    const parcalar = temiz.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    if (parcalar.length === 0) return { sonuclar: [] };
    const desen = `%${parcalar.join("%")}%`;

    const { data, error } = await supabase
        .from("urunler")
        .select("id, stok_kodu, ad, stok_adedi, kutular(kutu_no)")
        .ilike("arama", desen)
        .order("stok_adedi", { ascending: false })
        .limit(20);
    if (error) return { hata: dbHataMesaji(error) };

    type Satir = Omit<StoktakiParca, "kutu_no"> & { kutular: { kutu_no: number } | null };
    return {
        sonuclar: ((data ?? []) as unknown as Satir[]).map(({ kutular, ...u }) => ({ ...u, kutu_no: kutular?.kutu_no ?? null })),
    };
}

// ─── Markalar ve modeller ───────────────────────────────────

const MARKALAR = `${STOK}/markalar`;

const MARKA_TEKILLIK = {
    urun_markalari_anahtar_key: "Bu marka zaten kayıtlı.",
    urun_modelleri_marka_id_anahtar_key: "Bu model bu markada zaten kayıtlı.",
    // Birleştirme sonucu iki kutu aynı marka/modele düşüyorsa
    kutular_marka_model_tekil: "Bu birleştirme aynı marka/model için iki kutu oluşturuyor. Önce kutulardan birinin parçalarını diğerine taşıyın.",
};

function markaSonrasiYenile() {
    revalidatePath(STOK, "layout");
    vitrinUrunleriniYenile(); // sitedeki marka/model filtreleri
}

export async function markaEkle(ad: string): Promise<IslemSonucu> {
    const sonuc = markaAdiSemasi.safeParse(ad);
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz ad." };
    const yetki = await izinliIstemci("stok_yonet");
    if ("hata" in yetki) return yetki;

    const { error } = await yetki.supabase.from("urun_markalari").insert({ ad: sonuc.data.replace(/\s+/g, " ") });
    if (error) return { hata: tekillikMesaji(error, MARKA_TEKILLIK) };
    revalidatePath(MARKALAR);
}

export async function modelEkle(markaId: string, ad: string): Promise<IslemSonucu> {
    const sonuc = modelAdiSemasi.safeParse(ad);
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz ad." };
    const yetki = await izinliIstemci("stok_yonet");
    if ("hata" in yetki) return yetki;

    const { error } = await yetki.supabase.from("urun_modelleri").insert({ marka_id: markaId, ad: sonuc.data.replace(/\s+/g, " ") });
    if (error) return { hata: tekillikMesaji(error, MARKA_TEKILLIK) };
    revalidatePath(MARKALAR);
}

// Yeniden adlandırma ürün ve kutulardaki metni de günceller; aynı ad başka kayda denk gelirse ikisi birleşir.
export async function markaYenidenAdlandir(id: string, ad: string): Promise<IslemSonucu> {
    const sonuc = markaAdiSemasi.safeParse(ad);
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz ad." };
    const yetki = await izinliIstemci("stok_yonet");
    if ("hata" in yetki) return yetki;

    const { error } = await yetki.supabase.rpc("marka_yeniden_adlandir", { p_id: id, p_ad: sonuc.data });
    if (error) return { hata: tekillikMesaji(error, MARKA_TEKILLIK) };
    markaSonrasiYenile();
}

export async function modelYenidenAdlandir(id: string, ad: string): Promise<IslemSonucu> {
    const sonuc = modelAdiSemasi.safeParse(ad);
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz ad." };
    const yetki = await izinliIstemci("stok_yonet");
    if ("hata" in yetki) return yetki;

    const { error } = await yetki.supabase.rpc("model_yeniden_adlandir", { p_id: id, p_ad: sonuc.data });
    if (error) return { hata: tekillikMesaji(error, MARKA_TEKILLIK) };
    markaSonrasiYenile();
}

// Yalnızca hiçbir ürün veya kutuda kullanılmayan kayıt silinir (veritabanı fonksiyonu denetler).
export async function markaSil(id: string): Promise<IslemSonucu> {
    const yetki = await izinliIstemci("stok_yonet");
    if ("hata" in yetki) return yetki;
    const { error } = await yetki.supabase.rpc("marka_sil", { p_id: id });
    if (error) return { hata: dbHataMesaji(error) };
    revalidatePath(MARKALAR);
}

export async function modelSil(id: string): Promise<IslemSonucu> {
    const yetki = await izinliIstemci("stok_yonet");
    if ("hata" in yetki) return yetki;
    const { error } = await yetki.supabase.rpc("model_sil", { p_id: id });
    if (error) return { hata: dbHataMesaji(error) };
    revalidatePath(MARKALAR);
}
