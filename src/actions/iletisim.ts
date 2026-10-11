// src/actions/iletisim.ts
// İletişim formu (vitrin, giriş gerektirmez) ve paneldeki mesaj işlemleri.
"use server";

import { revalidatePath } from "next/cache";
import { iletisimSemasi, type IletisimGirdisi } from "@/lib/schemas/iletisim";
import { anonIstemci } from "@/lib/supabase/anon";
import { dbHataMesaji, izinliIstemci } from "@/lib/supabase/yetkili";
import type { IslemSonucu } from "./personel";

export async function iletisimMesajiGonder(girdi: IletisimGirdisi): Promise<IslemSonucu> {
    const sonuc = iletisimSemasi.safeParse(girdi);
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz bilgi." };
    const { ad, soyad, telefon, eposta, mesaj, web_sitesi } = sonuc.data;

    // Tuzak alan doluysa bot: başarılı görünür ama kaydedilmez.
    if (web_sitesi) return;

    const { error } = await anonIstemci().rpc("iletisim_mesaji_gonder", {
        p_ad: ad,
        p_soyad: soyad,
        p_telefon: telefon,
        p_eposta: eposta,
        p_mesaj: mesaj,
    });

    if (error) {
        console.error("[iletisim_mesaji_gonder]", error.code, error.message);
        // P0001: hız sınırı mesajı (fonksiyondaki raise exception)
        return { hata: error.code === "P0001" ? error.message : "Mesajınız şu anda gönderilemedi. Lütfen daha sonra tekrar deneyin." };
    }

    revalidatePath("/admin", "layout");
}

export async function mesajOkunduYap(id: string, okundu: boolean): Promise<IslemSonucu> {
    const yetki = await izinliIstemci("mesajlar");
    if ("hata" in yetki) return yetki;

    const { error } = await yetki.supabase.from("iletisim_mesajlari").update({ okundu }).eq("id", id);
    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath("/admin", "layout");
}

export async function mesajSil(id: string): Promise<IslemSonucu> {
    const yetki = await izinliIstemci("mesajlar");
    if ("hata" in yetki) return yetki;

    const { error } = await yetki.supabase.from("iletisim_mesajlari").delete().eq("id", id);
    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath("/admin", "layout");
}
