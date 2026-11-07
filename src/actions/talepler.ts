// src/actions/talepler.ts
// Panel kayıt talepleri: /admin/kayit'tan gönderilir (giriş gerektirmez); Personel sayfasında yönetici onaylar ya da reddeder.
// Onayda personel kaydı + panel girişi oluşturulur. Şifreyi onaylayan belirler ve personele yönetim iletir;
// personel ilk girişte doğrulama uygulamasını kurar ve kendi şifresini belirler.
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sifreAlani } from "@/lib/schemas/kullanici";
import { talepSemasi, type TalepGirdisi } from "@/lib/schemas/talep";
import { anonIstemci } from "@/lib/supabase/anon";
import { GIZLI_ANAHTAR_EKSIK, yoneticiIstemci } from "@/lib/supabase/admin";
import { authHataMesaji } from "@/lib/supabase/auth-hata";
import { dbHataMesaji, izinliIstemci, oturum } from "@/lib/supabase/yetkili";
import type { IslemSonucu } from "./personel";

export async function talepGonder(girdi: TalepGirdisi): Promise<IslemSonucu> {
    const sonuc = talepSemasi.safeParse(girdi);
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz bilgi." };
    const { ad_soyad, telefon, eposta, web_sitesi } = sonuc.data;

    // Tuzak alan doluysa bot: başarılı görünür ama kaydedilmez.
    if (web_sitesi) return;

    const { error } = await anonIstemci().rpc("personel_talebi_gonder", {
        p_ad_soyad: ad_soyad,
        p_telefon: telefon,
        p_eposta: eposta,
    });
    if (error) {
        console.error("[personel_talebi_gonder]", error.code, error.message);
        // P0001: fonksiyondaki hız sınırı / bekleyen talep mesajı
        return { hata: error.code === "P0001" ? error.message : "Talebiniz şu anda gönderilemedi. Lütfen daha sonra tekrar deneyin." };
    }

    revalidatePath("/admin", "layout");
}

const onaySemasi = z.object({
    rol: z.enum(["yonetici", "teknisyen", "kasa"], { error: "Rol seçin." }),
    sifre: sifreAlani,
});

export async function talebiOnayla(talepId: string, rol: string, sifre: string): Promise<IslemSonucu> {
    const sonuc = onaySemasi.safeParse({ rol, sifre });
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz veri." };

    const yetki = await izinliIstemci("personel");
    if ("hata" in yetki) return yetki;
    const yonetici = yoneticiIstemci();
    if (!yonetici) return { hata: GIZLI_ANAHTAR_EKSIK };
    const { supabase } = yetki;

    const { data: talep } = await supabase.from("personel_talepleri").select("*").eq("id", talepId).maybeSingle();
    if (!talep) return { hata: "Talep bulunamadı." };
    if (talep.durum !== "bekliyor") return { hata: "Bu talep için zaten karar verilmiş." };

    // 1) Personel kaydı
    const { data: personel, error: personelHatasi } = await supabase
        .from("personel")
        .insert({ ad_soyad: talep.ad_soyad, telefon: talep.telefon, rol: sonuc.data.rol, aktif: true })
        .select("id")
        .single();
    if (personelHatasi) return { hata: dbHataMesaji(personelHatasi) };

    // 2) Panel girişi (ilk girişte doğrulama uygulaması kurulumu ve şifre değişikliği istenir)
    const { data: kullanici, error: authHatasi } = await yonetici.auth.admin.createUser({
        email: talep.eposta,
        password: sonuc.data.sifre,
        email_confirm: true,
        user_metadata: { sifre_degismeli: true },
    });
    if (authHatasi) {
        await supabase.from("personel").delete().eq("id", personel.id);
        return { hata: authHataMesaji(authHatasi) };
    }

    const { error: baglamaHatasi } = await supabase.from("personel").update({ auth_user_id: kullanici.user.id }).eq("id", personel.id);
    if (baglamaHatasi) {
        await yonetici.auth.admin.deleteUser(kullanici.user.id);
        await supabase.from("personel").delete().eq("id", personel.id);
        return { hata: dbHataMesaji(baglamaHatasi) };
    }

    // 3) Talep kapanır
    const { error: talepHatasi } = await supabase
        .from("personel_talepleri")
        .update({ durum: "onaylandi", karar_veren: (await oturum())?.personelId ?? null, karar_tarihi: new Date().toISOString(), personel_id: personel.id })
        .eq("id", talepId);
    if (talepHatasi) return { hata: dbHataMesaji(talepHatasi) };

    revalidatePath("/admin", "layout");
}

export async function talebiReddet(talepId: string): Promise<IslemSonucu> {
    const yetki = await izinliIstemci("personel");
    if ("hata" in yetki) return yetki;

    const { data, error } = await yetki.supabase
        .from("personel_talepleri")
        .update({ durum: "reddedildi", karar_veren: (await oturum())?.personelId ?? null, karar_tarihi: new Date().toISOString() })
        .eq("id", talepId)
        .eq("durum", "bekliyor")
        .select("id");
    if (error) return { hata: dbHataMesaji(error) };
    if (!data?.length) return { hata: "Bu talep için zaten karar verilmiş." };

    revalidatePath("/admin", "layout");
}

export async function talebiSil(talepId: string): Promise<IslemSonucu> {
    const yetki = await izinliIstemci("personel");
    if ("hata" in yetki) return yetki;

    const { error } = await yetki.supabase.from("personel_talepleri").delete().eq("id", talepId).neq("durum", "bekliyor");
    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath("/admin/personel");
}
