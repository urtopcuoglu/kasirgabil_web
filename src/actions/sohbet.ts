// src/actions/sohbet.ts
// Paneldeki canlı sohbet işlemleri. Ziyaretçi tarafı fonksiyonları doğrudan tarayıcıdan çağırır (CanliSohbet.tsx).
"use server";

import { revalidatePath } from "next/cache";
import { mesajMetni, type SohbetDurumu } from "@/lib/schemas/sohbet";
import { dbHataMesaji, izinliIstemci } from "@/lib/supabase/yetkili";
import type { IslemSonucu } from "./personel";

export async function sohbetYanitla(sohbetId: string, metin: string): Promise<IslemSonucu> {
    const sonuc = mesajMetni.safeParse(metin);
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz mesaj." };

    const yetki = await izinliIstemci("sohbet");
    if ("hata" in yetki) return yetki;

    // personel_id trigger'da oturumdan atanır.
    const { error } = await yetki.supabase.from("sohbet_mesajlari").insert({ sohbet_id: sohbetId, gonderen: "personel", metin: sonuc.data });
    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath("/admin", "layout");
}

export async function sohbetOkundu(sohbetId: string): Promise<IslemSonucu> {
    const yetki = await izinliIstemci("sohbet");
    if ("hata" in yetki) return yetki;

    const { error } = await yetki.supabase.from("sohbetler").update({ personel_okudu_at: new Date().toISOString() }).eq("id", sohbetId);
    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath("/admin", "layout");
}

export async function sohbetDurumDegistir(sohbetId: string, durum: SohbetDurumu): Promise<IslemSonucu> {
    const yetki = await izinliIstemci("sohbet");
    if ("hata" in yetki) return yetki;

    const { error } = await yetki.supabase.from("sohbetler").update({ durum }).eq("id", sohbetId);
    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath("/admin", "layout");
}

export async function sohbetSil(sohbetId: string): Promise<IslemSonucu> {
    const yetki = await izinliIstemci("sil");
    if ("hata" in yetki) return yetki;

    const { error } = await yetki.supabase.from("sohbetler").delete().eq("id", sohbetId);
    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath("/admin", "layout");
}
