// src/actions/servis.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
    durumDegistirSemasi,
    kalemSemasi,
    servisSemasi,
    type KalemGirdisi,
    type MusteriSecenegi,
    type ServisDurumu,
    type ServisGirdisi,
} from "@/lib/schemas/servis";
import { bosIseNull, dbHataMesaji, OTURUM_HATASI, yetkiliIstemci } from "@/lib/supabase/yetkili";
import { aramaDeseni } from "@/app/admin/_components/liste";
import { cihazlariSirala, MUSTERI_SECIMI } from "@/lib/musteri";
import type { IslemSonucu } from "./personel";

const LISTE = "/admin/teknik-servis";
const detay = (id: string) => `${LISTE}/${id}`;

// ─── Müşteri arama (servis formu) ──────────────────────────

// Rehberde ad / firma / telefon ile arar; kişinin kayıtlı cihazlarını ve geçmiş servislerini de döndürür.
export async function musteriAra(q: string): Promise<MusteriSecenegi[]> {
    const aranan = q.trim();
    if (aranan.length < 2) return [];

    const supabase = await yetkiliIstemci();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from("rehber_kisiler")
        .select(MUSTERI_SECIMI)
        .ilike("arama", aramaDeseni(aranan))
        .order("ad_soyad_unvan")
        .limit(8);

    if (error) {
        console.error("[musteriAra]", error.code, error.message);
        return [];
    }
    return (data as MusteriSecenegi[]).map(cihazlariSirala);
}

// ─── Servis kaydı ───────────────────────────────────────────

// id null ise yeni kayıt (form_no veritabanında üretilir), değilse güncelleme.
export async function servisKaydet(id: string | null, girdi: ServisGirdisi): Promise<IslemSonucu> {
    const sonuc = servisSemasi.safeParse(girdi);
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz veri." };

    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const veri = bosIseNull(sonuc.data);
    let hedefId = id;

    if (id) {
        const { error } = await supabase.from("teknik_servis_kayitlari").update(veri).eq("id", id);
        if (error) return { hata: dbHataMesaji(error) };
    } else {
        const { data, error } = await supabase.from("teknik_servis_kayitlari").insert(veri).select("id").single();
        if (error) return { hata: dbHataMesaji(error) };
        hedefId = data.id as string;
    }

    revalidatePath(LISTE);
    redirect(detay(hedefId!));
}

export async function servisSil(id: string): Promise<IslemSonucu> {
    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    // Durum geçmişi ve ücret kalemleri cascade ile birlikte silinir.
    const { error } = await supabase.from("teknik_servis_kayitlari").delete().eq("id", id);
    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath(LISTE);
    redirect(LISTE);
}

export async function servisDurumDegistir(id: string, durum: ServisDurumu, aciklama: string): Promise<IslemSonucu> {
    const sonuc = durumDegistirSemasi.safeParse({ durum, aciklama });
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz veri." };

    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const { error } = await supabase.rpc("servis_durum_degistir", {
        p_servis_id: id,
        p_durum: sonuc.data.durum,
        p_aciklama: sonuc.data.aciklama,
    });
    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath(LISTE);
    revalidatePath(detay(id));
}

// ─── Ücret kalemleri ────────────────────────────────────────

// kalemId null ise yeni kalem, değilse güncelleme.
export async function kalemKaydet(servisId: string, kalemId: string | null, girdi: KalemGirdisi): Promise<IslemSonucu> {
    const sonuc = kalemSemasi.safeParse(girdi);
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz veri." };

    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const { error } = kalemId
        ? await supabase.from("servis_kalemleri").update(sonuc.data).eq("id", kalemId).eq("servis_id", servisId)
        : await supabase.from("servis_kalemleri").insert({ ...sonuc.data, servis_id: servisId });

    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath(LISTE);
    revalidatePath(detay(servisId));
}

export async function kalemSil(servisId: string, kalemId: string): Promise<IslemSonucu> {
    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const { error } = await supabase.from("servis_kalemleri").delete().eq("id", kalemId).eq("servis_id", servisId);
    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath(LISTE);
    revalidatePath(detay(servisId));
}
