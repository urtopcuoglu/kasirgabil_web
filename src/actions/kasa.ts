// src/actions/kasa.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { baglantiSecenekleri } from "@/lib/kasa";
import {
    kasaHareketiSemasi,
    kasaKategoriSemasi,
    type BaglantiSecenegi,
    type BaglantiTuru,
    type KasaHareketiGirdisi,
    type KasaTipi,
} from "@/lib/schemas/kasa";
import { sayiOku } from "@/lib/schemas/ortak";
import { bosIseNull, dbHataMesaji, OTURUM_HATASI, yetkiliIstemci } from "@/lib/supabase/yetkili";
import type { IslemSonucu } from "./personel";

const KASA = "/admin/kasa";
const gunSayfasi = (tarih: string) => `${KASA}?tarih=${tarih}`;
const tarihMi = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);

// Hareket stoka, servise ve rehbere bağlı olabilir; ilgili sayfalar da yenilenir.
function kasaYenile() {
    revalidatePath(KASA, "layout");
    revalidatePath("/admin/stok", "layout");
    revalidatePath("/admin/teknik-servis", "layout");
}

// ─── Hareketler ─────────────────────────────────────────────

// id null ise yeni hareket (aynı sayfada kalınır), değilse düzenleme (hareketin gününe dönülür).
export async function kasaHareketiKaydet(id: string | null, girdi: KasaHareketiGirdisi): Promise<IslemSonucu> {
    const sonuc = kasaHareketiSemasi.safeParse(girdi);
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz veri." };

    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const d = sonuc.data;
    const veri = {
        ...bosIseNull({
            tarih: d.tarih,
            tip: d.tip,
            yontem: d.yontem,
            kategori_id: d.kategori_id,
            kimden_kime: d.kimden_kime,
            aciklama: d.aciklama,
            rehber_kisi_id: d.rehber_kisi_id,
            servis_id: d.servis_id,
            urun_id: d.urun_id,
        }),
        tutar: sayiOku(d.tutar),
        urun_adet: d.urun_id ? sayiOku(d.urun_adet) : null,
    };

    const { error } = id
        ? await supabase.from("kasa_hareketleri").update(veri).eq("id", id)
        : await supabase.from("kasa_hareketleri").insert(veri);
    if (error) return { hata: dbHataMesaji(error) };

    kasaYenile();
    if (id) redirect(gunSayfasi(d.tarih));
}

export async function kasaHareketiSil(id: string): Promise<IslemSonucu> {
    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    // Ürün bağlantısı varsa stok, veritabanındaki trigger ile geri alınır.
    const { error } = await supabase.from("kasa_hareketleri").delete().eq("id", id);
    if (error) return { hata: dbHataMesaji(error) };

    kasaYenile();
}

// Formdaki servis / ürün / rehber arama seçicileri.
export async function baglantiAra(tur: BaglantiTuru, q: string): Promise<BaglantiSecenegi[]> {
    if (q.trim().length < 2) return [];
    const supabase = await yetkiliIstemci();
    if (!supabase) return [];
    return baglantiSecenekleri(supabase, tur, { q: q.trim() });
}

// ─── Gün sonu ───────────────────────────────────────────────

export async function kasaGunKapat(tarih: string, sayilan: string, not: string): Promise<IslemSonucu> {
    const tutar = sayiOku(sayilan);
    if (!tarihMi(tarih)) return { hata: "Geçersiz tarih." };
    if (tutar == null || Number.isNaN(tutar) || tutar < 0) return { hata: "Kasada sayılan nakit tutarını girin." };

    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const { error } = await supabase.rpc("kasa_gun_kapat", { p_tarih: tarih, p_sayilan: tutar, p_not: not });
    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath(KASA, "layout");
}

export async function kasaGunAc(tarih: string): Promise<IslemSonucu> {
    if (!tarihMi(tarih)) return { hata: "Geçersiz tarih." };

    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const { error } = await supabase.rpc("kasa_gun_ac", { p_tarih: tarih });
    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath(KASA, "layout");
}

// Yalnızca öncesinde kapanmış gün yokken (kasanın ilk kullanımı) açılış nakdi elle girilir.
export async function kasaAcilisNakitKaydet(tarih: string, tutarMetni: string): Promise<IslemSonucu> {
    const tutar = sayiOku(tutarMetni);
    if (!tarihMi(tarih)) return { hata: "Geçersiz tarih." };
    if (tutar == null || Number.isNaN(tutar) || tutar < 0) return { hata: "Geçerli bir tutar girin." };

    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const { count } = await supabase
        .from("kasa_gunleri")
        .select("tarih", { count: "exact", head: true })
        .lt("tarih", tarih)
        .eq("kapandi", true);
    if (count) return { hata: "Açılış nakdi önceki günün sayımından devreder; elle değiştirilemez." };

    const { error } = await supabase.from("kasa_gunleri").upsert({ tarih, acilis_nakit: tutar });
    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath(KASA, "layout");
}

// ─── Kategoriler ────────────────────────────────────────────

export async function kasaKategoriKaydet(id: string | null, ad: string, tip: KasaTipi): Promise<IslemSonucu> {
    const sonuc = kasaKategoriSemasi.safeParse({ ad, tip });
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz veri." };

    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const { error } = id
        ? await supabase.from("kasa_kategorileri").update({ ad: sonuc.data.ad }).eq("id", id)
        : await supabase.from("kasa_kategorileri").insert(sonuc.data);
    if (error) return { hata: error.code === "23505" ? "Bu isimde bir kategori zaten var." : dbHataMesaji(error) };

    revalidatePath(KASA, "layout");
}

export async function kasaKategoriSil(id: string): Promise<IslemSonucu> {
    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const { error } = await supabase.from("kasa_kategorileri").delete().eq("id", id);
    if (error) return { hata: error.code === "23503" ? "Hareketi olan kategori silinemez." : dbHataMesaji(error) };

    revalidatePath(KASA, "layout");
}
