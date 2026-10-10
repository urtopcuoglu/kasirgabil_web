// src/actions/icerik.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { htmlTemizle } from "@/lib/html";
import {
    blogKategoriSemasi,
    blogYazisiSemasi,
    SITE_ICERIKLERI,
    slugUret,
    type BlogYazisiGirdisi,
    type SiteIcerikAnahtari,
} from "@/lib/schemas/icerik";
import { bosIseNull, dbHataMesaji, OTURUM_HATASI, yetkiliIstemci } from "@/lib/supabase/yetkili";
import type { IslemSonucu } from "./personel";

const ICERIK = "/admin/icerik";

// ─── Site içerikleri ────────────────────────────────────────

export async function siteIcerigiKaydet(anahtar: SiteIcerikAnahtari, deger: unknown): Promise<IslemSonucu> {
    const tanim = SITE_ICERIKLERI[anahtar];
    if (!tanim) return { hata: "Bilinmeyen içerik." };

    const sonuc = tanim.sema.safeParse(deger);
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz veri." };

    // Zengin metin alanları kaydedilmeden önce temizlenir.
    const veri: Record<string, unknown> = { ...sonuc.data };
    if (typeof veri.icerik === "string") veri.icerik = htmlTemizle(veri.icerik);
    if (typeof veri.biz_kimiz === "string") veri.biz_kimiz = htmlTemizle(veri.biz_kimiz);

    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const { error } = await supabase.from("site_icerikleri").update({ deger: veri }).eq("anahtar", anahtar);
    if (error) return { hata: dbHataMesaji(error) };

    // İletişim bilgileri tüm sayfalardaki header/footer'da olduğu için vitrinin tamamı yenilenir.
    revalidatePath("/", "layout");
}

// ─── Blog yazıları ──────────────────────────────────────────

// datetime-local değeri Türkiye saatidir ("2026-10-10T14:30" → "2026-10-10T14:30:00+03:00").
const yayinTarihi = (v: string) => (v ? `${v}:00+03:00` : null);

// id null ise yeni yazı (kaydedince düzenleme sayfasına gider), değilse güncelleme.
export async function blogYazisiKaydet(id: string | null, girdi: BlogYazisiGirdisi): Promise<IslemSonucu> {
    const sonuc = blogYazisiSemasi.safeParse(girdi);
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz veri." };

    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const d = sonuc.data;
    const veri = {
        ...bosIseNull({
            baslik: d.baslik,
            slug: d.slug,
            ozet: d.ozet,
            kapak_gorsel_url: d.kapak_gorsel_url,
            kategori_id: d.kategori_id,
            durum: d.durum,
            seo_baslik: d.seo_baslik,
            seo_aciklama: d.seo_aciklama,
        }),
        icerik: htmlTemizle(d.icerik),
        yayin_tarihi: yayinTarihi(d.yayin_tarihi),
    };

    let hedefId = id;
    if (id) {
        const { error } = await supabase.from("blog_yazilari").update(veri).eq("id", id);
        if (error) return { hata: error.code === "23505" ? "Bu adres (slug) başka bir yazıda kullanılıyor." : dbHataMesaji(error) };
    } else {
        const { data, error } = await supabase.from("blog_yazilari").insert(veri).select("id").single();
        if (error) return { hata: error.code === "23505" ? "Bu adres (slug) başka bir yazıda kullanılıyor." : dbHataMesaji(error) };
        hedefId = data.id as string;
    }

    revalidatePath("/blog", "layout");
    revalidatePath(ICERIK, "layout");
    if (!id) redirect(`${ICERIK}/blog/${hedefId}`);
}

export async function blogYazisiSil(id: string): Promise<IslemSonucu> {
    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const { error } = await supabase.from("blog_yazilari").delete().eq("id", id);
    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath("/blog", "layout");
    revalidatePath(ICERIK, "layout");
    redirect(ICERIK);
}

// ─── Blog kategorileri ──────────────────────────────────────

export async function blogKategoriKaydet(id: string | null, ad: string): Promise<IslemSonucu> {
    const sonuc = blogKategoriSemasi.safeParse({ ad });
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz veri." };

    const slug = slugUret(sonuc.data.ad);
    if (!slug) return { hata: "Kategori adında harf veya rakam olmalı." };

    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const veri = { ad: sonuc.data.ad, slug };
    const { error } = id
        ? await supabase.from("blog_kategorileri").update(veri).eq("id", id)
        : await supabase.from("blog_kategorileri").insert(veri);
    if (error) return { hata: error.code === "23505" ? "Bu isimde bir kategori zaten var." : dbHataMesaji(error) };

    revalidatePath("/blog", "layout");
    revalidatePath(ICERIK, "layout");
}

export async function blogKategoriSil(id: string): Promise<IslemSonucu> {
    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    // Kategorideki yazılar silinmez, kategorisiz kalır (on delete set null).
    const { error } = await supabase.from("blog_kategorileri").delete().eq("id", id);
    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath("/blog", "layout");
    revalidatePath(ICERIK, "layout");
}
