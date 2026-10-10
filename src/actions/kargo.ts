// src/actions/kargo.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
    gondericiSemasi,
    kargoOlusturSemasi,
    type GondericiGirdisi,
    type KargoGonderici,
    type KargoOlusturGirdisi,
} from "@/lib/schemas/kargo";
import { bosIseNull, dbHataMesaji, izinliIstemci, OTURUM_HATASI, yetkiliIstemci } from "@/lib/supabase/yetkili";
import type { IslemSonucu } from "./personel";

export async function gondericiEkle(
    girdi: GondericiGirdisi
): Promise<{ gonderici: KargoGonderici } | { hata: string }> {
    const sonuc = gondericiSemasi.safeParse(girdi);
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz veri." };

    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const { data, error } = await supabase
        .from("kargo_gondericileri")
        .insert(bosIseNull(sonuc.data))
        .select("id, firma_adi, gonderici_adi, telefon, adres, vkn, varsayilan")
        .single();

    if (error) return { hata: dbHataMesaji(error) };
    return { gonderici: data as KargoGonderici };
}

// Gönderici ve alıcı bilgileri istemciden değil, veritabanından okunup fişe kopyalanır.
export async function kargoOlustur(girdi: KargoOlusturGirdisi): Promise<{ id: string } | { hata: string }> {
    const sonuc = kargoOlusturSemasi.safeParse(girdi);
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz veri." };

    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const [gondericiSonucu, aliciSonucu] = await Promise.all([
        supabase.from("kargo_gondericileri").select("*").eq("id", sonuc.data.gonderici_id).maybeSingle(),
        supabase.from("rehber_kisiler").select("*").eq("id", sonuc.data.alici_rehber_id).maybeSingle(),
    ]);

    const gonderici = gondericiSonucu.data;
    const alici = aliciSonucu.data;
    if (!gonderici) return { hata: "Gönderici bulunamadı." };
    if (!alici) return { hata: "Alıcı rehberde bulunamadı." };
    if (!alici.adres?.trim()) return { hata: "Alıcının rehberde kayıtlı adresi yok." };

    const { data, error } = await supabase
        .from("kargolar")
        .insert({
            gonderici_id: gonderici.id,
            alici_rehber_id: alici.id,
            gonderici_firma_adi: gonderici.firma_adi,
            gonderici_adi: gonderici.gonderici_adi,
            gonderici_telefon: gonderici.telefon,
            gonderici_adres: gonderici.adres,
            gonderici_vkn: gonderici.vkn,
            alici_adi: alici.ad_soyad_unvan,
            alici_firma: alici.firma,
            alici_telefon: alici.telefon_1 ?? alici.telefon_2,
            alici_adres: alici.adres,
            odeme_tipi: sonuc.data.odeme_tipi,
        })
        .select("id")
        .single();

    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath("/admin/kargolar");
    return { id: data.id as string };
}

const tarihSemasi = z.union([z.literal(""), z.iso.date({ error: "Geçerli bir tarih girin." })]);

export async function kargoyaVerilisTarihiKaydet(id: string, tarih: string): Promise<IslemSonucu> {
    const sonuc = tarihSemasi.safeParse(tarih);
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz tarih." };

    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const { error } = await supabase
        .from("kargolar")
        .update({ kargoya_verilis_tarihi: sonuc.data || null })
        .eq("id", id);

    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath("/admin/kargolar");
    revalidatePath(`/admin/kargolar/${id}`);
}

// listeyeDon: detay sayfasından silinirken kullanılır; silinen kaydın sayfasında kalınmaz.
export async function kargoSil(id: string, listeyeDon = false): Promise<IslemSonucu> {
    const yetki = await izinliIstemci("sil");
    if ("hata" in yetki) return yetki;
    const { supabase } = yetki;

    const { error } = await supabase.from("kargolar").delete().eq("id", id);
    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath("/admin/kargolar");
    if (listeyeDon) redirect("/admin/kargolar");
}
