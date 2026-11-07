// src/actions/iki-adimli.ts
// İki adımlı doğrulama (TOTP, Google/Microsoft Authenticator) tüm personel için zorunludur.
// proxy.ts, oturum aal2 olana kadar kullanıcıyı /admin/dogrula'da tutar: uygulaması yoksa orada kurar, varsa kodu girer.
// Bu dosya: kurulum, girişte kod doğrulama, yeni telefona taşıma ve yöneticinin sıfırlaması.
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { GIZLI_ANAHTAR_EKSIK, yoneticiIstemci } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { izinliIstemci, OTURUM_HATASI } from "@/lib/supabase/yetkili";
import type { IslemSonucu } from "./personel";

const kodSemasi = z
    .string()
    .transform((v) => v.replace(/\s/g, ""))
    .pipe(z.string().regex(/^\d{6}$/, { error: "Uygulamadaki 6 haneli kodu girin." }));

function mfaHataMesaji(error: { message: string; code?: string }) {
    console.error("[mfa]", error.code, error.message);
    if (error.code === "mfa_verification_failed" || /invalid totp/i.test(error.message)) return "Kod hatalı ya da süresi dolmuş. Uygulamadaki güncel kodu girin.";
    if (error.code === "mfa_challenge_expired") return "Doğrulama süresi doldu. Tekrar deneyin.";
    if (error.code === "over_request_rate_limit" || error.code === "mfa_verification_rejected") return "Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar deneyin.";
    if (error.code === "mfa_totp_enroll_not_enabled" || error.code === "mfa_totp_enroll_disabled") return "Supabase projesinde TOTP doğrulaması kapalı (Authentication → Multi-Factor).";
    if (error.code === "insufficient_aal") return "Bu işlem için önce iki adımlı doğrulama kodunu girmeniz gerekiyor.";
    return "İşlem yapılamadı. Lütfen tekrar deneyin.";
}

// ─── Kurulum (/admin/dogrula) ─────────────────────────────

export type KurulumBilgisi = { factorId: string; qrKodu: string; anahtar: string };

export async function kurulumuBaslat(): Promise<{ hata: string } | KurulumBilgisi> {
    const supabase = await createClient();
    const { data: liste, error: listeHatasi } = await supabase.auth.mfa.listFactors();
    if (listeHatasi) return { hata: OTURUM_HATASI };
    if (liste.totp.length > 0) return { hata: "İki adımlı doğrulama zaten etkin." };

    // Yarım kalmış (doğrulanmamış) kurulumlar temizlenir; aynı adla yeni kurulum açılabilsin.
    for (const f of liste.all.filter((f) => f.factor_type === "totp" && f.status !== "verified")) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
    }

    const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Kasırga Panel",
        issuer: "Kasırga Bilgisayar",
    });
    if (error) return { hata: mfaHataMesaji(error) };
    return { factorId: data.id, qrKodu: data.totp.qr_code, anahtar: data.totp.secret };
}

export async function kurulumuTamamla(factorId: string, kod: string): Promise<IslemSonucu> {
    const sonuc = kodSemasi.safeParse(kod);
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz kod." };

    const supabase = await createClient();
    // Başarılı doğrulama oturumu aal2'ye yükseltir (yeni anahtar cookie'ye yazılır).
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: sonuc.data });
    if (error) return { hata: mfaHataMesaji(error) };
    revalidatePath("/admin", "layout");
}

// Yeni telefona taşıma: mevcut uygulama kaydı silinir, oturum aal1'e döner ve proxy kullanıcıyı yeniden kuruluma götürür.
export async function yeniTelefonaTasi() {
    const supabase = await createClient();
    const { data: liste, error: listeHatasi } = await supabase.auth.mfa.listFactors();
    if (listeHatasi) return { hata: OTURUM_HATASI };
    for (const f of liste.all.filter((f) => f.factor_type === "totp")) {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: f.id });
        if (error) return { hata: mfaHataMesaji(error) };
    }
    await supabase.auth.refreshSession();
    redirect("/admin/dogrula");
}

// ─── Girişte kod doğrulama (/admin/dogrula) ─────────────────────────────

export type DogrulamaDurumu = { hata?: string };

export async function koduDogrula(_onceki: DogrulamaDurumu, formData: FormData): Promise<DogrulamaDurumu> {
    const sonuc = kodSemasi.safeParse(String(formData.get("kod") ?? ""));
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message };

    const supabase = await createClient();
    const { data: liste, error: listeHatasi } = await supabase.auth.mfa.listFactors();
    if (listeHatasi) return { hata: OTURUM_HATASI };
    const faktor = liste.totp[0];
    if (!faktor) return { hata: "Hesabınızda kayıtlı doğrulama uygulaması yok. Sayfayı yenileyip kurulumu yapın." };

    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: faktor.id, code: sonuc.data });
    if (error) return { hata: mfaHataMesaji(error) };

    redirect("/admin");
}

// ─── Yönetici: personelin doğrulamasını sıfırlama (telefon kaybı vb.) ─────────────────────────────

export async function personelDogrulamasiniSifirla(personelId: string): Promise<IslemSonucu> {
    const yetki = await izinliIstemci("personel");
    if ("hata" in yetki) return yetki;
    const yonetici = yoneticiIstemci();
    if (!yonetici) return { hata: GIZLI_ANAHTAR_EKSIK };

    const { data: personel } = await yetki.supabase.from("personel").select("auth_user_id").eq("id", personelId).maybeSingle();
    if (!personel?.auth_user_id) return { hata: "Bu personelin panel girişi yok." };

    const { data: liste, error: listeHatasi } = await yonetici.auth.admin.mfa.listFactors({ userId: personel.auth_user_id });
    if (listeHatasi) return { hata: mfaHataMesaji(listeHatasi) };
    for (const f of liste.factors) {
        const { error } = await yonetici.auth.admin.mfa.deleteFactor({ id: f.id, userId: personel.auth_user_id });
        if (error) return { hata: mfaHataMesaji(error) };
    }

    revalidatePath(`/admin/personel/${personelId}`);
}
